import { randomBytes } from "node:crypto";
import path from "node:path";

import { cmd } from "./lib/cmd.js";
import { rawZkeyFilePath } from "./zkey.js";

export function preparedZkeyFile(name: string): string {
  return `target/${name}/${name}.prepared.zkey`;
}

export async function prepareZkeyCmd(file: string) {
  const parsed = path.parse(file);
  await cmd(`mkdir -p ptaus`);

  const inZkey = rawZkeyFilePath(parsed.name);
  const outZkey = `target/${parsed.name}/${parsed.name}.prepared.zkey`;

  const entropy = randomBytes(32).toString("hex");
  await cmd(`snarkjs zkc ${inZkey} ${outZkey} -e="${entropy}" -v`);
}
