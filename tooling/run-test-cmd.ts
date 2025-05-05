import { writeFileSync } from "node:fs";
import path from "node:path";

import { compileCmd } from "./compile.js";
import { cmd, ROOT_DIR } from "./lib/cmd.js";
import { witnessCommand } from "./witness.js";

export async function runTestCmd(circuitPath: string) {
  const circomFileData = path.parse(circuitPath);
  const inputDestinationPath = path.join(ROOT_DIR, "inputs", `${circomFileData.name}.input.json`);
  const inputFileData = path.parse(inputDestinationPath);
  writeFileSync(inputDestinationPath, Buffer.from("{}", "utf8"));
  await cmd(`mkdir -p ${inputFileData.dir}`);
  await compileCmd(circuitPath);
  await witnessCommand(circuitPath);
}
