import fs from "node:fs";
import path from "node:path";

import { cmd } from "./lib/cmd.js";
import { preparedZkeyFile } from "./prepare-zkey.js";
import { witnessFile } from "./witness.js";

export async function prove(filePath: string) {
  const fileData = path.parse(filePath);

  const zkey = preparedZkeyFile(fileData.name);
  const witness = witnessFile(fileData.name);

  if (!fs.existsSync(zkey)) {
    throw new Error("Missing prepared zkey file.");
  }

  const outProof = `target/${fileData.name}/proof.json`;
  const outPublic = `target/${fileData.name}/public-input.json`;

  await cmd(`snarkjs g16p ${zkey} ${witness} ${outProof} ${outPublic}`);
}
