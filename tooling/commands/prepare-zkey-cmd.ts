import { randomBytes } from "node:crypto";
import path from "node:path";

import { cmd } from "../lib/cmd.js";
import { rawZkeyFilePath } from "./create-zkey-cmd.js";

export function preparedZkeyFile(name: string): string {
  return `target/${name}/${name}.final.zkey`;
}

export async function prepareZkeyCmd(file: string) {
  const parsed = path.parse(file);
  await cmd(`mkdir -p ptaus`);

  const inZkey = rawZkeyFilePath(parsed.name);
  const phase2Zkey = `target/${parsed.name}/${parsed.name}.phase2.zkey`;

  const entropy = randomBytes(32).toString("hex");
  await cmd(`snarkjs zkc ${inZkey} ${phase2Zkey} -e="${entropy}" -v`);

  const beacon = randomBytes(32).toString("hex");
  const finalZkey = `target/${parsed.name}/${parsed.name}.final.zkey`;
  await cmd(`snarkjs zkb ${phase2Zkey} ${finalZkey} ${beacon} 10 -v`);
}
