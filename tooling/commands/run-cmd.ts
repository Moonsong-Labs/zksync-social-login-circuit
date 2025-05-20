import { compileCmd } from "./compile-cmd.js";
import { generateInputCmd } from "./generate-input-cmd.js";
import { generateWitnessCmd } from "./generate-witness-cmd.js";
import { type AddCmdFn, FILE_ARG_DEF } from "../base-cli.js";

export async function runCmd(circuit: string, recreateInput = true) {
  if (recreateInput) {
    await generateInputCmd();
  }
  await compileCmd(circuit);
  await generateWitnessCmd(circuit);
}

export const addRunCmd: AddCmdFn = (cli) => {
  return cli.command(
    "run <file>",
    "Generates inputs, wasm and witness for a circuit",
    FILE_ARG_DEF,
    async (argv) => {
      await runCmd(argv.file);
    },
  );
};
