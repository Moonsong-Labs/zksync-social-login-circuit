import path from "node:path";

import { cmd, cmdArgs } from "../lib/cmd.js";
import { rawZkeyFilePath } from "./create-zkey-cmd.js";

export function testVerifierPath(name: string): string {
  return `target/${name}/verifier-test.sol`;
}

export async function verifierTestCmd(circuit: string) {
  const fileData = path.parse(circuit);
  const outPath = testVerifierPath(fileData.name);
  const zkey = rawZkeyFilePath(fileData.name);
  await cmd(`snarkjs zkey export solidityverifier ${zkey} ${outPath}`);
  await cmdArgs("sed", ["-i", "s/contract Groth16Verifier/contract Groth16VerifierTest/g", outPath]);
}
