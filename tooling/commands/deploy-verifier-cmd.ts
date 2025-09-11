// forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY --zksync src/verifier.sol:Groth16Verifier

import path from "node:path";

import { cmd, ROOT_DIR } from "../lib/cmd.js";
import { envOrDefault } from "../lib/env.js";
import { defaultVerifierPath } from "./generate-verifier-cmd.js";
import { type AddCmdFn, FILE_ARG_DEF } from "../base-cli.js";

export async function deployVerifierCmd(circuit: string): Promise<void> {
  const data = path.parse(circuit);

  const rpcUrl = envOrDefault("RPC_URL", "http://localhost:8011");
  const privKey = envOrDefault(
    "SEC_KEY",
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a");
  const verifier = defaultVerifierPath(data.name);

  await cmd(`forge create --rpc-url ${rpcUrl} --private-key ${privKey} --zksync ${ROOT_DIR}/${verifier}:Groth16Verifier`);
}

export const addDeployVerifierCmd: AddCmdFn = (cli) => {
  return cli.command(
    "deploy-verifier <file>",
    "deploys verifier to local anvil",
    FILE_ARG_DEF,
    async (argv) => {
      await deployVerifierCmd(argv.file);
    },
  );
};
