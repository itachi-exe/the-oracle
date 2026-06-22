// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./AgentRegistry.sol";

/// @title PredictionLock
/// @notice Append-only prediction registry for The Oracle devnet demo. Stores the full
/// disagreement record from the sparring loop — the agent's own initial call, the user's
/// own initial call, and the final agreed call that actually got locked — so reputation
/// scoring can tell whether the user overrode their agent.
contract PredictionLock {
    enum Status {
        Pending,
        Resolving,
        Won,
        Lost
    }

    struct Prediction {
        uint256 id;
        address user;
        bytes32 marketId;
        bytes32 outcomeHash; // hash of the FINAL agreed outcome
        string outcome; // FINAL agreed outcome
        uint16 confidenceBps; // FINAL agreed confidence
        string agentOutcome; // the agent's own initial stance
        uint16 agentConfidenceBps;
        string userOutcome; // the user's own initial stance
        bool userOverrodeAgent; // finalOutcome != agentOutcome
        uint64 lockedAt;
        Status status;
    }

    address public owner;
    address public reputationContract;
    AgentRegistry public agentRegistry;
    uint256 public nextPredictionId = 1;

    mapping(uint256 => Prediction) private predictions;
    mapping(address => uint256[]) private predictionsByUser;
    mapping(bytes32 => uint256[]) private predictionsByMarket;
    mapping(address => mapping(bytes32 => bool)) public hasPredictedMarket;
    /// @dev Set the instant Reputation decides a market's winning outcome, so nobody can lock
    /// a "free win" prediction after the outcome is already known but before scoring finishes.
    mapping(bytes32 => bool) public marketLockedForResolution;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ReputationContractSet(address indexed reputationContract);
    event AgentRegistrySet(address indexed agentRegistry);
    event MarketLockedForResolution(bytes32 indexed marketId);
    event PredictionLocked(
        uint256 indexed predictionId,
        address indexed user,
        bytes32 indexed marketId,
        bytes32 outcomeHash,
        string outcome,
        uint16 confidenceBps,
        bool userOverrodeAgent,
        uint64 lockedAt
    );
    event PredictionStatusUpdated(uint256 indexed predictionId, Status status);

    error NotOwner();
    error NotReputationContract();
    error InvalidOutcome();
    error InvalidConfidence();
    error DuplicatePrediction();
    error PredictionNotFound();
    error AgentRegistryMissing();
    error CallerHasNoAgent();
    error MarketResolutionInProgress();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyReputationContract() {
        if (msg.sender != reputationContract) revert NotReputationContract();
        _;
    }

    constructor(address initialOwner) {
        owner = initialOwner == address(0) ? msg.sender : initialOwner;
        emit OwnershipTransferred(address(0), owner);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "newOwner=0");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setReputationContract(address newReputationContract) external onlyOwner {
        require(newReputationContract != address(0), "reputation=0");
        reputationContract = newReputationContract;
        emit ReputationContractSet(newReputationContract);
    }

    function setAgentRegistry(address newAgentRegistry) external onlyOwner {
        require(newAgentRegistry != address(0), "agentRegistry=0");
        agentRegistry = AgentRegistry(newAgentRegistry);
        emit AgentRegistrySet(newAgentRegistry);
    }

    /// @notice Called by Reputation the instant it decides a market's winning outcome.
    function lockMarketForResolution(bytes32 marketId) external onlyReputationContract {
        marketLockedForResolution[marketId] = true;
        emit MarketLockedForResolution(marketId);
    }

    /// @notice Locks one immutable prediction per user per market, carrying the disagreement record.
    /// @dev marketId should be keccak256(bytes(frontendMarketId)) for the devnet UI.
    function lockPrediction(
        bytes32 marketId,
        string calldata agentOutcome,
        uint16 agentConfidenceBps,
        string calldata userOutcome,
        string calldata finalOutcome,
        uint16 finalConfidenceBps
    ) external returns (uint256 predictionId) {
        if (address(agentRegistry) == address(0)) revert AgentRegistryMissing();
        if (!agentRegistry.hasAgent(msg.sender)) revert CallerHasNoAgent();
        if (marketLockedForResolution[marketId]) revert MarketResolutionInProgress();

        bytes32 outcomeHash = keccak256(bytes(finalOutcome));
        if (marketId == bytes32(0) || bytes(finalOutcome).length == 0) revert InvalidOutcome();
        if (finalConfidenceBps > 10_000 || agentConfidenceBps > 10_000) revert InvalidConfidence();
        if (hasPredictedMarket[msg.sender][marketId]) revert DuplicatePrediction();

        bool overrode = keccak256(bytes(finalOutcome)) != keccak256(bytes(agentOutcome));

        predictionId = nextPredictionId++;
        predictions[predictionId] = Prediction({
            id: predictionId,
            user: msg.sender,
            marketId: marketId,
            outcomeHash: outcomeHash,
            outcome: finalOutcome,
            confidenceBps: finalConfidenceBps,
            agentOutcome: agentOutcome,
            agentConfidenceBps: agentConfidenceBps,
            userOutcome: userOutcome,
            userOverrodeAgent: overrode,
            lockedAt: uint64(block.timestamp),
            status: Status.Pending
        });

        hasPredictedMarket[msg.sender][marketId] = true;
        predictionsByUser[msg.sender].push(predictionId);
        predictionsByMarket[marketId].push(predictionId);

        emit PredictionLocked(
            predictionId,
            msg.sender,
            marketId,
            outcomeHash,
            finalOutcome,
            finalConfidenceBps,
            overrode,
            uint64(block.timestamp)
        );
    }

    function markResolving(uint256 predictionId) external onlyReputationContract {
        Prediction storage prediction = predictions[predictionId];
        if (prediction.id == 0) revert PredictionNotFound();
        if (prediction.status == Status.Pending) {
            prediction.status = Status.Resolving;
            emit PredictionStatusUpdated(predictionId, Status.Resolving);
        }
    }

    function markResolved(uint256 predictionId, bool won) external onlyReputationContract {
        Prediction storage prediction = predictions[predictionId];
        if (prediction.id == 0) revert PredictionNotFound();
        prediction.status = won ? Status.Won : Status.Lost;
        emit PredictionStatusUpdated(predictionId, prediction.status);
    }

    function getPrediction(uint256 predictionId) external view returns (Prediction memory) {
        Prediction memory prediction = predictions[predictionId];
        if (prediction.id == 0) revert PredictionNotFound();
        return prediction;
    }

    function getUserPredictionIds(address user) external view returns (uint256[] memory) {
        return predictionsByUser[user];
    }

    function getMarketPredictionIds(bytes32 marketId) external view returns (uint256[] memory) {
        return predictionsByMarket[marketId];
    }
}
