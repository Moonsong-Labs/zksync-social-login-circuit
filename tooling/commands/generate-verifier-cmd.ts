import fs from "node:fs";
import path from "node:path";

import { cmd, ROOT_DIR } from "../lib/cmd.js";
import { compileCmd } from "./compile-cmd.js";
import { createZkeyCmd, DEFAULT_PTAU, r1csFilePath } from "./create-zkey-cmd.js";
import { downloadPtauCmd } from "./download-ptau-cmd.js";
import { preparedZkeyFile, prepareZkeyCmd } from "./prepare-zkey-cmd.js";
import { type AddCmdFn, FILE_ARG_DEF } from "../base-cli.js";

export function defaultVerifierPath(name: string): string {
  return `target/${name}/verifier.sol`;
}

export async function generateVerifierCmd(circuit: string, outFile: string | null): Promise<void> {
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
      await downloadPtauCmd(20);
    }
    if (!fs.existsSync(path.join(ROOT_DIR, r1csFilePath(fileData.name)))) {
      console.log("Missing r1cs file. Compiling circuit:");
      await compileCmd(circuit);
    }
    await createZkeyCmd(circuit, DEFAULT_PTAU);
    await prepareZkeyCmd(circuit);
  }

  await cmd(`snarkjs zkey export solidityverifier ${zkey} ${outPath}`);
}

export const addGenerateVerifierCmd: AddCmdFn = (cli) => {
  return cli.command(
    "verifier <file>",
    "calculates oidc_digest for jwt in env var",
    {
      ...FILE_ARG_DEF,
      out: {
        type: "string",
        demandOption: false,
        description: "where to save the contract.",
        default: null,
        alias: ["o"],
      },
    },
    async (argv) => {
      await generateVerifierCmd(argv.file, argv.out);
    });
};
