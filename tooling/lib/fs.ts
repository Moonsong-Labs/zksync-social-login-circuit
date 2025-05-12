import { writeFileSync } from "node:fs";
import path from "node:path";

import { cmd } from "./cmd.js";

export async function writeFile(filePath: string, content: Buffer) {
  await ensureDir(filePath);
  writeFileSync(filePath, content);
}

export async function ensureDir(filePath: string) {
  await cmd(`mkdir -p ${path.parse(filePath).dir}`);
}
