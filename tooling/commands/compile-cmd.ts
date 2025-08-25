import { writeFileSync } from "node:fs";
import path from "node:path";

import { cmd } from "../lib/cmd.js";

export async function compileCmd(filePath: string) {
  const fileData = path.parse(filePath);

  if (fileData.ext !== ".circom") {
    throw new Error("File should be a circom file");
  }

  // Put artifacts inside the circuits package so pnpm local node_modules layout
  // doesn't cause missing library includes when circom is executed from repo root.
  const outDir = path.join("packages", "circuits", "target", fileData.name);
  await cmd(`mkdir -p ${outDir}`);

  // Add multiple -l paths so includes like `circomlib/circuits/poseidon.circom` resolve
  // regardless of whether the dependency is hoisted to root or kept only under the
  // package's own node_modules (pnpm isolated linker scenarios).
  const includeFlags = [
    "-l packages/circuits", // local utils
    "-l packages/circuits/node_modules", // package-level deps
    "-l node_modules", // root-level (in case of hoisting)
  ].join(" ");

  await cmd(`circom ${filePath} --sym --r1cs --wasm --O2 -o ${outDir} ${includeFlags}`);
  const packageJsonPath = path.join(outDir, `${fileData.name}_js`, "package.json");
  await cmd(`touch ${packageJsonPath}`);
  writeFileSync(packageJsonPath, JSON.stringify({ type: "commonjs" }, null, 2));
}
