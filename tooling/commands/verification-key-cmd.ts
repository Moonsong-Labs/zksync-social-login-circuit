import path from "node:path";

import { cmd } from "../lib/cmd.js";
import { preparedZkeyFile } from "./prepare-zkey-cmd.js";
import { type AddCmdFn, FILE_ARG_DEF } from "../base-cli.js";

export function verificationKeyPath(name: string): string {
  return `target/${name}/${name}.vkey`;
}

export async function verificationKeyCmd(filePath: string) {
  const fileData = path.parse(filePath);

  const zkey = preparedZkeyFile(fileData.name);
  const out = verificationKeyPath(fileData.name);

  await cmd(`snarkjs zkev ${zkey} ${out} -v`);
}

export const addVerificationKeyCmd: AddCmdFn = (cli) => {
  return cli.command(
    "vkey <file>",
    "exports verification key for a circuit",
    FILE_ARG_DEF,
    async (argv) => {
      await verificationKeyCmd(argv.file);
    });
};
