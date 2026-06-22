// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title AgentRegistry
/// @notice One AI agent per wallet, minted on first connect. Holds the agent's name and the
/// shared pair-reputation score (starts at the 50% coin-flip line) plus the agent's own
/// solo-accuracy track record. Reputation/solo-accuracy writes are restricted to the
/// Reputation contract, which applies them on market resolution.
contract AgentRegistry {
    struct AgentRecord {
        string name;
        uint16 pairReputationBps; // starts at 5000 = 50.00%
        uint32 agentSoloWins;
        uint32 agentSoloResolved;
        uint64 createdAt;
        bool exists;
    }

    address public owner;
    address public reputationContract;

    mapping(address => AgentRecord) private agents;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event ReputationContractSet(address indexed reputationContract);
    event AgentCreated(address indexed owner, string name, uint64 createdAt);
    event ReputationUpdated(address indexed owner, uint16 pairReputationBps);
    event AgentSoloScored(address indexed owner, bool won, uint32 agentSoloWins, uint32 agentSoloResolved);

    error NotOwner();
    error NotReputationContract();
    error AgentAlreadyExists();
    error AgentNotFound();

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

    /// @notice Mints one agent for the caller. Reverts if the wallet already has one.
    function createAgent(string calldata name) external {
        if (agents[msg.sender].exists) revert AgentAlreadyExists();

        agents[msg.sender] = AgentRecord({
            name: name,
            pairReputationBps: 5000,
            agentSoloWins: 0,
            agentSoloResolved: 0,
            createdAt: uint64(block.timestamp),
            exists: true
        });

        emit AgentCreated(msg.sender, name, uint64(block.timestamp));
    }

    function hasAgent(address agentOwner) external view returns (bool) {
        return agents[agentOwner].exists;
    }

    function getAgent(address agentOwner) external view returns (AgentRecord memory) {
        AgentRecord memory record = agents[agentOwner];
        if (!record.exists) revert AgentNotFound();
        return record;
    }

    /// @notice Applies a signed reputation delta, clamped to [0, 10000] bps.
    function applyReputationDelta(address agentOwner, int256 deltaBps) external onlyReputationContract {
        AgentRecord storage record = agents[agentOwner];
        if (!record.exists) revert AgentNotFound();

        int256 next = int256(uint256(record.pairReputationBps)) + deltaBps;
        if (next < 0) next = 0;
        if (next > 10_000) next = 10_000;

        record.pairReputationBps = uint16(uint256(next));
        emit ReputationUpdated(agentOwner, record.pairReputationBps);
    }

    /// @notice Scores the agent's OWN initial call against the resolution, independent of
    /// whatever the human+agent pair actually locked.
    function scoreAgentSolo(address agentOwner, bool won) external onlyReputationContract {
        AgentRecord storage record = agents[agentOwner];
        if (!record.exists) revert AgentNotFound();

        record.agentSoloResolved += 1;
        if (won) record.agentSoloWins += 1;

        emit AgentSoloScored(agentOwner, won, record.agentSoloWins, record.agentSoloResolved);
    }
}
