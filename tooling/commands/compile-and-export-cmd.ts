import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";

import { DEFAULT_PTAU_SIZE } from "../../lib/constants.js";
import { ROOT_DIR } from "../lib/cmd.js";
import { compileCmd } from "./compile-cmd.js";
import { createZkeyCmd, DEFAULT_PTAU } from "./create-zkey-cmd.js";
import { downloadPtauCmd } from "./download-ptau-cmd.js";
import { exportCircuitCmd } from "./export-circuit-cmd.js";
import { exportVerifierCmd } from "./export-verifier-cmd.js";
import { exportVerifierTestCmd } from "./export-verifier-test-cmd.js";
import { defaultVerifierPath, generateVerifierCmd } from "./generate-verifier-cmd.js";
import { prepareZkeyCmd } from "./prepare-zkey-cmd.js";
import { generateVerifierTestCmd } from "./generate-verifier-test-cmd.js";
import type { AddCmdFn } from "../base-cli.js";
import { MAIN_CIRCUIT_FILE } from "../paths.js";

export async function compileAndExportCmd() {
  const circuit = path.join(ROOT_DIR, MAIN_CIRCUIT_FILE);
  const fileData = path.parse(circuit);

  const targetDir = path.join(ROOT_DIR, "target", fileData.name);
  if (existsSync(targetDir)) {
    await rm(targetDir, {
      recursive: true,
    });
  }

  await compileCmd(circuit);

  const defaultPtauPath = path.join(ROOT_DIR, DEFAULT_PTAU);

  if (!existsSync(defaultPtauPath)) {
    await downloadPtauCmd(DEFAULT_PTAU_SIZE);
  }

  await createZkeyCmd(circuit, DEFAULT_PTAU);
  await prepareZkeyCmd(circuit);
  await generateVerifierCmd(circuit, defaultVerifierPath(fileData.name));
  await exportVerifierCmd();
  await generateVerifierTestCmd();
  await exportVerifierTestCmd(circuit);
  await exportCircuitCmd();
}

export const addCompileAndExportCmd: AddCmdFn = (cli) => {
  return cli.command(
    "all",
    "Performs all needed tasks to export verifier and prepared zkey",
    {},
    async () => compileAndExportCmd(),
  );
};
