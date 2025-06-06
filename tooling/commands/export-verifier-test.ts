import fs from "node:fs";
import path from "node:path";

import { pascalCase } from "change-case";

import { cmd, ROOT_DIR } from "../lib/cmd.js";
import { createZkeyCmd, DEFAULT_PTAU, rawZkeyFilePath } from "./create-zkey-cmd.js";
import { testVerifierPath, verifierTestCmd } from "./verifier-test-cmd.js";

export async function exportVerifierTestCmd(circuitPath: string): Promise<void> {
  const fileData = path.parse(circuitPath);

  const contractsDir = path.join(ROOT_DIR, "..", "contracts", "src");
  if (!fs.existsSync(contractsDir)) {
    throw new Error(`Dir ${contractsDir} does not exist. This command only work when this repo is uses as submodule od zksync-sso.`);
  }

  const zkey = rawZkeyFilePath(fileData.name);
  const testPath = testVerifierPath(fileData.name);
  const fullPZkeyPath = path.join(ROOT_DIR, zkey);
  if (!fs.existsSync(fullPZkeyPath)) {
    await createZkeyCmd(circuitPath, DEFAULT_PTAU);
  }

  const fullTestPath = path.join(ROOT_DIR, testPath);
  if (!fs.existsSync(fullTestPath)) {
    await verifierTestCmd(circuitPath);
  }

  const outDir = path.join(contractsDir, "autogenerated");
  await cmd(`mkdir -p ${outDir}`);

  const fileName = pascalCase(`${fileData.name}-verifier-test`) + ".sol";
  const out = path.join(outDir, fileName);

  fs.copyFileSync(fullTestPath, out);
  console.log(`Generated verifier at: ${out}`);
}
