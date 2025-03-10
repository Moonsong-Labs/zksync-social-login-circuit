// forge create --rpc-url $RPC_URL --private-key $PRIVATE_KEY --zksync src/verifier.sol:Groth16Verifier

import path from "node:path";

import { defaultVerifierPath } from "./generate-verifier.js";
import { cmd, ROOT_DIR } from "./lib/cmd.js";
import { envOrDefault } from "./lib/env.js";

export async function deployVerifier(circuit: string): Promise<void> {
  const data = path.parse(circuit);

  const rpcUrl = envOrDefault("RPC_URL", "http://localhost:8011");
  const privKey = envOrDefault(
    "SEC_KEY",
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a");
  const verifier = defaultVerifierPath(data.name);
  // console.log(verifier);
  await cmd(`forge create --rpc-url ${rpcUrl} --private-key ${privKey} --zksync ${ROOT_DIR}/${verifier}:Groth16Verifier`);
  // await cmd(`forge create --rpc-url ${rpcUrl} --private-key ${privKey} ${ROOT_DIR}/${verifier}:Groth16Verifier --broadcast`);
  // await cmd(`cat ${verifier}`);
}
