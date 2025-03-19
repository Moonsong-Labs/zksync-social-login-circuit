import { compileCmd } from "./compile.js";
import { inputCommand } from "./generate-input.js";
import { witnessCommand } from "./witness.js";

export async function runCmd(circuit: string) {
  await inputCommand(circuit);
  await compileCmd(circuit);
  await witnessCommand(circuit);
}
