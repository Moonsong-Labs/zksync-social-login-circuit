import fs from "node:fs";
import path from "node:path";

import { compileCmd } from "./compile.js";
import { downloadPtau } from "./download-ptau.js";
import { cmd, ROOT_DIR } from "./lib/cmd.js";
import { preparedZkeyFile } from "./prepare-zkey.js";
import { DEFAULT_PTAU, r1csFilePath, zkeyCommand } from "./zkey.js";

export function defaultVerifierPath(name: string): string {
  return `target/${name}/verifier.sol`;
}

export async function generateVerifier(circuit: string, outFile: string | null): Promise<void> {
  const fileData = path.parse(circuit);
  const name = fileData.name;
  const outPath = outFile === null
    ? `target/${name}/verifier.sol`
    : outFile;
  const zkey = preparedZkeyFile(name);

  if (!fs.existsSync(path.join(ROOT_DIR, zkey))) {
    console.log("Missing zkey file. Trying to recreate:");

    if (!fs.existsSync(path.join(ROOT_DIR, DEFAULT_PTAU))) {
      console.log("Missing powers of tau. Downloading default one:");
      await downloadPtau(20);
    }
    if (!fs.existsSync(path.join(ROOT_DIR, r1csFilePath(fileData.name)))) {
      console.log("Missing r1cs file. Compiling circuit:");
      await compileCmd(circuit);
    }
    await zkeyCommand(circuit, DEFAULT_PTAU);
  }

  await cmd(`snarkjs zkey export solidityverifier ${zkey} ${outPath}`);
}
