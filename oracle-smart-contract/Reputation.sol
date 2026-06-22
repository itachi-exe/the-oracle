// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./PredictionLock.sol";
import "./AgentRegistry.sol";

/// @title Reputation
/// @notice Manual/mock resolver and scorekeeper. On resolution, applies a confidence-weighted
/// delta to the shared pair reputation, amplified when the user overrode their agent, and
/// separately scores the agent's own solo accuracy against its initial call.
/// @dev Resolver is intentionally pluggable for the devnet demo — this is NOT trustless
/// outcome resolution. Replace `resolver` with a real oracle flow later.
contract Reputation {
    // TODO(decision): tune K — max swing at 100% confidence is K_BPS/100 percentage points.
    uint16 public constant K_BPS = 2000;
    uint16 public constant OVERRIDE_MODIFIER_BPS = 15_000; // 1.5x, in bps-of-bps (10_000 = 1.0x)

    address public owner;
    address public resolver;
    PredictionLock public predictionLock;
    AgentRegistry public agentRegistry;

    mapping(bytes32 => bool) public marketResolved;
    mapping(bytes32 => bytes32) public winningOutcomeByMarket;
    /// @dev How many of a market's predictions (in PredictionLock's id order) have been scored so far.
    mapping(bytes32 => uint256) public scoredCount;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ResolverSet(address indexed resolver);
    event PredictionLockSet(address indexed predictionLock);
    event AgentRegistrySet(address indexed agentRegistry);
    event MarketResolving(bytes32 indexed marketId, bytes32 indexed winningOutcomeHash);
    event MarketResolved(bytes32 indexed marketId, bytes32 indexed winningOutcomeHash, uint256 scoredPredictions);
    event PredictionScored(
        uint256 indexed predictionId,
        address indexed user,
        bytes32 indexed marketId,
        bool won,
        bool agentWon,
        bool overrode,
        int256 reputationDeltaBps
    );

    error NotOwner();
    error NotResolver();
    error MarketAlreadyResolved();
    error MarketNotResolving();
    error PredictionLockMissing();
    error AgentRegistryMissing();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyResolver() {
        if (msg.sender != resolver) revert NotResolver();
        _;
    }

    constructor(address initialOwner) {
        owner = initialOwner == address(0) ? msg.sender : initialOwner;
        resolver = owner;
        emit OwnershipTransferred(address(0), owner);
        emit ResolverSet(resolver);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "newOwner=0");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setResolver(address newResolver) external onlyOwner {
        require(newResolver != address(0), "resolver=0");
        resolver = newResolver;
        emit ResolverSet(newResolver);
    }

    function setPredictionLock(address newPredictionLock) external onlyOwner {
        require(newPredictionLock != address(0), "predictionLock=0");
        predictionLock = PredictionLock(newPredictionLock);
        emit PredictionLockSet(newPredictionLock);
    }

    function setAgentRegistry(address newAgentRegistry) external onlyOwner {
        require(newAgentRegistry != address(0), "agentRegistry=0");
        agentRegistry = AgentRegistry(newAgentRegistry);
        emit AgentRegistrySet(newAgentRegistry);
    }

    /// @notice Decides a market's winning outcome. Cheap and O(1), scoring happens separately
    /// via scoreNextBatch so a market with many predictions can never blow the block gas limit.
    /// @dev Also locks PredictionLock against new predictions for this market in the same call,
    /// so nobody can lock a "free win" in the window before scoreNextBatch finishes processing it.
    function resolveMarket(bytes32 marketId, string calldata winningOutcome) external onlyResolver {
        if (address(predictionLock) == address(0)) revert PredictionLockMissing();
        if (marketResolved[marketId]) revert MarketAlreadyResolved();

        bytes32 winningOutcomeHash = keccak256(bytes(winningOutcome));
        marketResolved[marketId] = true;
        winningOutcomeByMarket[marketId] = winningOutcomeHash;
        predictionLock.lockMarketForResolution(marketId);
        emit MarketResolving(marketId, winningOutcomeHash);
    }

    /// @notice Scores up to `maxCount` of a resolved market's not-yet-scored predictions.
    /// Call repeatedly (any caller can drive this forward once a market is resolving) until
    /// scoredCount reaches the market's prediction count — that's what keeps a single call
    /// bounded regardless of how many predictions a market ends up with.
    function scoreNextBatch(bytes32 marketId, uint256 maxCount) external returns (uint256 scoredInBatch) {
        if (address(predictionLock) == address(0)) revert PredictionLockMissing();
        if (address(agentRegistry) == address(0)) revert AgentRegistryMissing();
        if (!marketResolved[marketId]) revert MarketNotResolving();

        uint256[] memory predictionIds = predictionLock.getMarketPredictionIds(marketId);
        uint256 start = scoredCount[marketId];
        uint256 remaining = predictionIds.length - start;
        uint256 batchSize = maxCount < remaining ? maxCount : remaining;
        uint256 end = start + batchSize;

        bytes32 winningOutcomeHash = winningOutcomeByMarket[marketId];

        for (uint256 i = start; i < end; i++) {
            uint256 predictionId = predictionIds[i];
            predictionLock.markResolving(predictionId);

            PredictionLock.Prediction memory prediction = predictionLock.getPrediction(predictionId);
            bool won = prediction.outcomeHash == winningOutcomeHash;
            bool agentWon = keccak256(bytes(prediction.agentOutcome)) == winningOutcomeHash;
            predictionLock.markResolved(predictionId, won);

            int256 deltaBps = _scoreDelta(prediction.confidenceBps, won, prediction.userOverrodeAgent);
            agentRegistry.applyReputationDelta(prediction.user, deltaBps);
            agentRegistry.scoreAgentSolo(prediction.user, agentWon);

            emit PredictionScored(
                predictionId,
                prediction.user,
                marketId,
                won,
                agentWon,
                prediction.userOverrodeAgent,
                deltaBps
            );
        }

        scoredCount[marketId] = end;
        scoredInBatch = end - start;

        if (end == predictionIds.length) {
            emit MarketResolved(marketId, winningOutcomeHash, predictionIds.length);
        }
    }

    function isFullyScored(bytes32 marketId) external view returns (bool) {
        if (!marketResolved[marketId]) return false;
        return scoredCount[marketId] == predictionLock.getMarketPredictionIds(marketId).length;
    }

    /// @dev base = K * finalConfidence; result = won ? +base : -base; modifier = overrode ? 1.5x : 1.0x.
    function _scoreDelta(uint16 finalConfidenceBps, bool won, bool overrode) private pure returns (int256) {
        int256 base = (int256(uint256(K_BPS)) * int256(uint256(finalConfidenceBps))) / 10_000;
        int256 result = won ? base : -base;
        int256 modifierBps = overrode ? int256(uint256(OVERRIDE_MODIFIER_BPS)) : int256(10_000);
        return (result * modifierBps) / 10_000;
    }
}
