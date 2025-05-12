import fs from "node:fs";
import path from "node:path";

import { cmd } from "../lib/cmd.js";
import { witnessFile } from "./generate-witness-cmd.js";
import { preparedZkeyFile } from "./prepare-zkey-cmd.js";
import { type AddCmdFn, FILE_ARG_DEF } from "../base-cli.js";

export function proofPath(name: string): string {
  return `target/${name}/proof.json`;
}

export function publicInputPath(name: string): string {
  return `target/${name}/public-input.json`;
}

export async function proveCmd(filePath: string) {
  const fileData = path.parse(filePath);

  const zkey = preparedZkeyFile(fileData.name);
  const witness = witnessFile(fileData.name);

  if (!fs.existsSync(zkey)) {
    throw new Error("Missing prepared zkey file.");
  }

  const outProof = `target/${fileData.name}/proof.json`;
  const outPublic = `target/${fileData.name}/public-input.json`;

  await cmd(`snarkjs g16p ${zkey} ${witness} ${outProof} ${outPublic} -v`);
}

export const addProveCmd: AddCmdFn = (cli) => {
  return cli.command(
    "prove <file>",
    "Calculates a proof using default inputs",
    FILE_ARG_DEF,
    async (argv) => {
      await proveCmd(argv.file);
    },
  );
};
