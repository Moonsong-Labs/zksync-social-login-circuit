import { writeFileSync } from "node:fs";
import path from "node:path";

import { type AddCmdFn, FILE_ARG_DEF } from "../base-cli.js";
import { cmd } from "../lib/cmd.js";

export function compiledWasmFile(name: string): string {
  return path.join("target", name, `${name}_js`, `${name}.wasm`);
}

export async function compileCmd(filePath: string) {
  const fileData = path.parse(filePath);

  if (fileData.ext !== ".circom") {
    throw new Error("File should be a circom file");
  }

  const targetDir = path.join("target", fileData.name);
  await cmd(`mkdir -p ${targetDir}`);

  await cmd(`circom ${filePath} --sym --r1cs --wasm --O2 -o ${targetDir} -l node_modules`);
  const packageJsonPath = path.join(targetDir, `${fileData.name}_js`, "package.json");
  await cmd(`touch ${packageJsonPath}`);
  writeFileSync(packageJsonPath, JSON.stringify({ type: "commonjs" }, null, 2));
}

export const addCompileCmd: AddCmdFn = (cli) => {
  return cli.command("compile <file>", "compiles circuit to wasm, sym and r1cs", FILE_ARG_DEF, async (argv) => {
    await compileCmd(argv.file);
  });
};
