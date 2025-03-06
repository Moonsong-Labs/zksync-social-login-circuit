import { readFileSync } from "node:fs";
import path from "node:path";

import { env } from "./lib/env.js";
import { proofPath, publicInputPath } from "./prove.js";
import { cmd } from "./lib/cmd.js";

export async function callVerifierCmd(circuit: string) {
  const fileData = path.parse(circuit);
  const addr = env("VERIFIER_ADDR");
  const rpcUrl = "http://localhost:8011";
  const fnSign = "verifyProof(uint[2],uint[2][2],uint[2],uint[151])(bool)";

  const proof = JSON.parse(readFileSync(proofPath(fileData.name), "utf8"));
  const pubInputs = JSON.parse(readFileSync(publicInputPath(fileData.name), "utf8"));

  const serializedPub = JSON.stringify(pubInputs).replaceAll("\"", "");

  // const piA = `[${proof.pi_a[0]},${proof.pi_a[1]}]`;
  // const piB = `[[${proof.pi_b[0][0]},${proof.pi_b[0][1]}],[${proof.pi_b[1][0]},${proof.pi_b[1][1]}]]`;
  // const piC = `[${proof.pi_c[0]},${proof.pi_c[1]}]`;
  const piA = `[${proof.pi_a[0]},${proof.pi_a[1]}]`;
  const piB = `[[${proof.pi_b[0][1]},${proof.pi_b[0][0]}],[${proof.pi_b[1][1]},${proof.pi_b[1][0]}]]`;
  const piC = `[${proof.pi_c[0]},${proof.pi_c[1]}]`;

  // console.log(`cast call --rpc-url ${rpcUrl} ${addr} "${fnSign}" "${piA}" "${piB}" "${piC}" "${serializedPub}"`);
  await cmd(`cast call --rpc-url ${rpcUrl} ${addr} ${fnSign} ${piA} ${piB} ${piC} ${serializedPub}`);
}
