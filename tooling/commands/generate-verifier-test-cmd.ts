import path from "node:path";

import { cmd, cmdArgs } from "../lib/cmd.js";
import { rawZkeyFilePath } from "./create-zkey-cmd.js";
import { type AddCmdFn, FILE_ARG_DEF } from "../base-cli.js";

import { MAIN_CIRCUIT_PATH } from "../paths.js";

export function testVerifierPath(name: string): string {
  return `target/${name}/verifier-test.sol`;
}

export async function generateVerifierTestCmd() {
  const fileData = path.parse(MAIN_CIRCUIT_PATH);
  const outPath = testVerifierPath(fileData.name);
  const zkey = rawZkeyFilePath(fileData.name);
  await cmd(`snarkjs zkey export solidityverifier ${zkey} ${outPath}`);
  await cmdArgs("sed", ["-i", "s/contract Groth16Verifier/contract Groth16VerifierTest/g", outPath]);
}

export const addGenerateVerifierTestCmd: AddCmdFn = (cli) => {
  return cli.command(
    "verifier-for-test <file>",
    "Generates a verifier to be use in testing environments",
    FILE_ARG_DEF,
    async () => {
      await generateVerifierTestCmd();
    },
  );
};
