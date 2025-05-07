import { existsSync } from "node:fs";
import * as path from "node:path";

import { cmd } from "../lib/cmd.js";
import { type AddCmdFn, FILE_ARG_DEF } from "../base-cli.js";

export function witnessFile(name: string): string {
  return `target/${name}/${name}.wtns`;
}

export async function generateWitnessCmd(filePath: string) {
  const fileData = path.parse(filePath);

  console.log(filePath);
  const input = `inputs/${filePath.replace(".circom", ".input.json")}`;
  console.log(input);
  if (!existsSync(input)) {
    throw new Error("Missing input. try running `tooling input :circuit:`");
  }

  const wtnsScript = `target/${fileData.name}/${fileData.name}_js/generate_witness.js`;
  const wasm = `target/${fileData.name}/${fileData.name}_js/${fileData.name}.wasm`;
  const out = witnessFile(fileData.name);

  if ([wtnsScript, wasm].some((file) => !existsSync(file))) {
    throw new Error("Missing compilation output. Try running `tooling compile :circuit:`");
  }

  await cmd(`mkdir -p target/${fileData.name}`);
  await cmd(`node ${wtnsScript} ${wasm} ${input} ${out}`);
}

export const addGenerateWitnessCmd: AddCmdFn = (cli) => {
  return cli.command("witness <file>", "generate a witness file from an input generated previously", FILE_ARG_DEF, async (argv) => {
    await generateWitnessCmd(argv.file);
  });
};
