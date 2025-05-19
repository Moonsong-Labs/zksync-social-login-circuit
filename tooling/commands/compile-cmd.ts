import { writeFileSync } from "node:fs";
import path from "node:path";

import { cmd } from "../lib/cmd.js";

export async function compileCmd(filePath: string) {
  const fileData = path.parse(filePath);

  if (fileData.ext !== ".circom") {
    throw new Error("File should be a circom file");
  }

  await cmd(`mkdir -p target/${fileData.name}`);
  await cmd(`circom ${filePath} --sym --r1cs --wasm --O2 -o target/${fileData.name} -l node_modules`);
  const packageJsonPath = path.join("target", fileData.name, `${fileData.name}_js`, "package.json");
  await cmd(`touch ${packageJsonPath}`);
  writeFileSync(packageJsonPath, JSON.stringify({ type: "commonjs" }, null, 2));
}
