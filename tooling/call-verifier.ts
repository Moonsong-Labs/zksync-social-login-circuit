import { readFileSync } from "node:fs";
import path from "node:path";

import { cmd } from "./lib/cmd.js";
import { env, envOrDefault } from "./lib/env.js";
import { proofPath, publicInputPath } from "./prove.js";

export async function callVerifierCmd(circuit: string) {
  const fileData = path.parse(circuit);
  const addr = env("VERIFIER_ADDR");
  const rpcUrl = envOrDefault("RPC_URL", "http://localhost:8011");

  const fnSign = "verifyProof(uint[2],uint[2][2],uint[2],uint[20])(bool)";

  const proof = JSON.parse(readFileSync(proofPath(fileData.name), "utf8"));
  const pubInputs = JSON.parse(readFileSync(publicInputPath(fileData.name), "utf8"));

  const serializedPub = JSON.stringify(pubInputs).replaceAll("\"", "");

  const piA = `[${proof.pi_a[0]},${proof.pi_a[1]}]`;
  const piB = `[[${proof.pi_b[0][1]},${proof.pi_b[0][0]}],[${proof.pi_b[1][1]},${proof.pi_b[1][0]}]]`;
  const piC = `[${proof.pi_c[0]},${proof.pi_c[1]}]`;

  const privKey = envOrDefault(
    "SEC_KEY",
    "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
  );

  await cmd(`cast send --private-key=${privKey} --rpc-url ${rpcUrl} ${addr} ${fnSign} ${piA} ${piB} ${piC} ${serializedPub}`);
}
