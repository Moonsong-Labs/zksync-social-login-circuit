import { compileCmd } from "./compile-cmd.js";
import { generateInputCmd } from "./generate-input-cmd.js";
import { generateWitnessCmd } from "./generate-witness-cmd.js";

export async function runCmd(circuit: string, recreateInput = true) {
  if (recreateInput) {
    await generateInputCmd();
  }
  await compileCmd(circuit);
  await generateWitnessCmd(circuit);
}
