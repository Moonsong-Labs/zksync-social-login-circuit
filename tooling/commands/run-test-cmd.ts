import { writeFileSync } from "node:fs";
import path from "node:path";

import { cmd, ROOT_DIR } from "../lib/cmd.js";
import { compileCmd } from "./compile-cmd.js";
import { generateWitnessCmd } from "./generate-witness-cmd.js";
import { type AddCmdFn, FILE_ARG_DEF } from "../base-cli.js";

export async function runTestCmd(circuitPath: string) {
  const circomFileData = path.parse(circuitPath);
  const inputDestinationPath = path.join(ROOT_DIR, "inputs", `${circomFileData.name}.input.json`);
  const inputFileData = path.parse(inputDestinationPath);
  writeFileSync(inputDestinationPath, Buffer.from("{}", "utf8"));
  await cmd(`mkdir -p ${inputFileData.dir}`);
  await compileCmd(circuitPath);
  await generateWitnessCmd(circuitPath);
}

export const addRunTestCmd: AddCmdFn = (cli) => {
  return cli.command(
    "run-test <file>",
    "Generates inputs, wasm and witness for a test circuit",
    FILE_ARG_DEF,
    async (argv) => {
      await runTestCmd(argv.file);
    },
  );
};
