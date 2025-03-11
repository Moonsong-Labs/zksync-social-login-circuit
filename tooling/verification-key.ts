import path from "node:path";

import { cmd } from "./lib/cmd.js";
import { preparedZkeyFile } from "./prepare-zkey.js";

export function verificationKeyPath(name: string): string {
  return `target/${name}/${name}.vkey`;
}

export async function verificationKeyCmd(filePath: string) {
  const fileData = path.parse(filePath);

  const zkey = preparedZkeyFile(fileData.name);
  const out = verificationKeyPath(fileData.name);

  await cmd(`snarkjs zkev ${zkey} ${out} -v`);
}
