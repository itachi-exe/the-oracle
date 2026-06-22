import fs from "node:fs";
import path from "node:path";
import { ContractFactory, JsonRpcProvider, Wallet } from "ethers";

const root = process.cwd();
const rpcUrl = process.env.DEVNET_RPC_URL ?? process.env.VITE_OG_RPC_URL;
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

if (!rpcUrl) {
  throw new Error("Set DEVNET_RPC_URL or VITE_OG_RPC_URL before deploying.");
}

if (!privateKey) {
  throw new Error("Set DEPLOYER_PRIVATE_KEY before deploying.");
}

const agentRegistryArtifact = readArtifact("AgentRegistry.sol", "AgentRegistry");
const predictionLockArtifact = readArtifact("PredictionLock.sol", "PredictionLock");
const reputationArtifact = readArtifact("Reputation.sol", "Reputation");

const provider = new JsonRpcProvider(rpcUrl);
const deployer = new Wallet(privateKey, provider);
const owner = process.env.CONTRACT_OWNER_ADDRESS ?? deployer.address;

console.log(`Deploying from ${deployer.address}`);
console.log(`Owner: ${owner}`);

const agentRegistryFactory = new ContractFactory(agentRegistryArtifact.abi, agentRegistryArtifact.bytecode, deployer);
const agentRegistry = await agentRegistryFactory.deploy(owner);
await agentRegistry.waitForDeployment();

const predictionLockFactory = new ContractFactory(
  predictionLockArtifact.abi,
  predictionLockArtifact.bytecode,
  deployer,
);
const predictionLock = await predictionLockFactory.deploy(owner);
await predictionLock.waitForDeployment();

const reputationFactory = new ContractFactory(reputationArtifact.abi, reputationArtifact.bytecode, deployer);
const reputation = await reputationFactory.deploy(owner);
await reputation.waitForDeployment();

const agentRegistryAddress = await agentRegistry.getAddress();
const predictionLockAddress = await predictionLock.getAddress();
const reputationAddress = await reputation.getAddress();

if (owner.toLowerCase() === deployer.address.toLowerCase()) {
  await (await predictionLock.setReputationContract(reputationAddress)).wait();
  await (await predictionLock.setAgentRegistry(agentRegistryAddress)).wait();
  await (await reputation.setPredictionLock(predictionLockAddress)).wait();
  await (await reputation.setAgentRegistry(agentRegistryAddress)).wait();
  await (await agentRegistry.setReputationContract(reputationAddress)).wait();
} else {
  console.warn(
    "Owner is not the deployer. Run setReputationContract/setAgentRegistry (on PredictionLock and Reputation) wiring from the owner wallet.",
  );
}

const network = await provider.getNetwork();
const deployment = {
  chainId: network.chainId.toString(),
  rpcUrl,
  owner,
  deployer: deployer.address,
  agentRegistry: agentRegistryAddress,
  predictionLock: predictionLockAddress,
  reputation: reputationAddress,
  deployedAt: new Date().toISOString(),
};

const deploymentsDir = path.join(root, "oracle-smart-contract", "deployments");
fs.mkdirSync(deploymentsDir, { recursive: true });
fs.writeFileSync(path.join(deploymentsDir, "devnet.json"), `${JSON.stringify(deployment, null, 2)}\n`);

console.log("AgentRegistry:", agentRegistryAddress);
console.log("PredictionLock:", predictionLockAddress);
console.log("Reputation:", reputationAddress);
console.log("Wrote oracle-smart-contract/deployments/devnet.json");

function readArtifact(sourceName, contractName) {
  const artifactPath = path.join(root, "oracle-smart-contract", "artifacts", "contracts", sourceName, `${contractName}.json`);
  if (!fs.existsSync(artifactPath)) {
    throw new Error(`Missing ${artifactPath}. Run npm run contracts:compile first.`);
  }

  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
}
