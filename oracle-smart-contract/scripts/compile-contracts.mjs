import fs from "node:fs";
import path from "node:path";
import solc from "solc";

const root = process.cwd();
const contractsDir = path.join(root, "oracle-smart-contract");
const artifactsDir = path.join(root, "oracle-smart-contract", "artifacts", "contracts");
const frontendAbiDir = path.join(root, "oracle-frontend", "src", "lib", "chain", "abis");

const contractFiles = ["AgentRegistry.sol", "PredictionLock.sol", "Reputation.sol"];

const sources = Object.fromEntries(
  contractFiles.map((file) => [
    file,
    {
      content: fs.readFileSync(path.join(contractsDir, file), "utf8"),
    },
  ]),
);

const input = {
  language: "Solidity",
  sources,
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,
    },
    outputSelection: {
      "*": {
        "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object", "metadata"],
      },
    },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = output.errors ?? [];
const failures = errors.filter((error) => error.severity === "error");

for (const error of errors) {
  const log = error.formattedMessage ?? error.message;
  if (error.severity === "error") console.error(log);
  else console.warn(log);
}

if (failures.length > 0) {
  process.exit(1);
}

fs.mkdirSync(artifactsDir, { recursive: true });
fs.mkdirSync(frontendAbiDir, { recursive: true });

for (const [sourceName, contracts] of Object.entries(output.contracts)) {
  const sourceArtifactDir = path.join(artifactsDir, sourceName);
  fs.mkdirSync(sourceArtifactDir, { recursive: true });

  for (const [contractName, artifact] of Object.entries(contracts)) {
    const normalized = {
      contractName,
      sourceName,
      abi: artifact.abi,
      bytecode: `0x${artifact.evm.bytecode.object}`,
      deployedBytecode: `0x${artifact.evm.deployedBytecode.object}`,
      metadata: JSON.parse(artifact.metadata),
    };

    fs.writeFileSync(
      path.join(sourceArtifactDir, `${contractName}.json`),
      `${JSON.stringify(normalized, null, 2)}\n`,
    );

    fs.writeFileSync(
      path.join(frontendAbiDir, `${contractName}.json`),
      `${JSON.stringify(artifact.abi, null, 2)}\n`,
    );
  }
}

console.log(`Compiled ${contractFiles.length} Solidity files.`);
console.log(`Artifacts: ${path.relative(root, artifactsDir)}`);
console.log(`Frontend ABIs: ${path.relative(root, frontendAbiDir)}`);
