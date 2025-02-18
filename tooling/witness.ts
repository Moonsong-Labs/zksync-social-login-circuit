import { existsSync } from "node:fs";
import * as path from "node:path";

import { cmd } from "./lib/cmd.js";

export async function witnessCommand(filePath: string) {
  const fileData = path.parse(filePath);

  const input = `inputs/${fileData.name}.input.json`;

  if (!existsSync(input)) {
    throw new Error("Missing input. try running `tooling input :circuit:`");
  }

  const wtnsScript = `target/${fileData.name}/${fileData.name}_js/generate_witness.js`;
  const wasm = `target/${fileData.name}/${fileData.name}_js/${fileData.name}.wasm`;
  const out = `target/${fileData.name}/${fileData.name}.wtns`;

  if ([wtnsScript, wasm].some((file) => !existsSync(file))) {
    throw new Error("Missing compilation output. Try running `tooling compile :circuit:`");
  }

  await cmd(`mkdir -p target/${fileData.name}`);
  await cmd(`node ${wtnsScript} ${wasm} ${input} ${out}`);
}
