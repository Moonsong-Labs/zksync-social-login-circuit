import { existsSync } from "node:fs";
import * as path from "node:path";

import { type AddCmdFn, FILE_ARG_DEF } from "../base-cli.js";
import { cmd } from "../lib/cmd.js";

export const DEFAULT_PTAU = "ptaus/ppot_0080_20.ptau";

export function r1csFilePath(name: string) {
  return `target/${name}/${name}.r1cs`;
}

export function rawZkeyFilePath(name: string): string {
  return `target/${name}/${name}.zkey`;
}

export async function createZkeyCmd(filePath: string, ptauPath: string) {
  const fileData = path.parse(filePath);

  if (!existsSync(ptauPath)) {
    throw new Error(`Missing ptau file: ${filePath}. Maybe you want to download with 'tooling download-ptau'`);
  }

  const r1cs = r1csFilePath(fileData.name);

  const out = rawZkeyFilePath(fileData.name);
  await cmd(`snarkjs g16s ${r1cs} ${ptauPath} ${out}`);
}

export const addCreateZkeyCmd: AddCmdFn = (cli) => {
  return cli.command(
    "zkey <file>",
    "generate a zkey file for a circuit",
    {
      file: FILE_ARG_DEF.file,
      ptau: {
        type: "string",
        demandOption: false,
        description: "path to powers of tau file",
        default: DEFAULT_PTAU,
      },
    },
    async (argv) => {
      console.warn("For production please use a prepared power of tau.");
      await createZkeyCmd(argv.file, argv.ptau);
    });
};
