import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";

import { DEFAULT_PTAU_SIZE, MAIN_CIRCUIT_FILE } from "../../lib/constants.js";
import { ROOT_DIR } from "../lib/cmd.js";
import { compileCmd } from "./compile-cmd.js";
import { createZkeyCmd, DEFAULT_PTAU } from "./create-zkey-cmd.js";
import { downloadPtauCmd } from "./download-ptau-cmd.js";
import { exportCircuitCmd } from "./export-circuit-cmd.js";
import { exportVerifierCmd } from "./export-verifier-cmd.js";
import { exportVerifierTestCmd } from "./export-verifier-test.js";
import { generateInputCmd } from "./generate-input-cmd.js";
import { defaultVerifierPath, generateVerifierCmd } from "./generate-verifier-cmd.js";
import { generateWitnessCmd } from "./generate-witness-cmd.js";
import { prepareZkeyCmd } from "./prepare-zkey-cmd.js";
import { proveCmd } from "./prove-cmd.js";
import { verificationKeyCmd } from "./verification-key-cmd.js";
import { verifierTestCmd } from "./verifier-test-cmd.js";
import { verifyCmd } from "./verify-cmd.js";

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
  await generateInputCmd(circuit);
  await generateWitnessCmd(circuit);

  const defaultPtauPath = path.join(ROOT_DIR, DEFAULT_PTAU);

  if (!existsSync(defaultPtauPath)) {
    await downloadPtauCmd(DEFAULT_PTAU_SIZE);
  }

  await createZkeyCmd(circuit, DEFAULT_PTAU);
  await prepareZkeyCmd(circuit);
  await proveCmd(circuit);
  await verificationKeyCmd(circuit);
  await verifyCmd(circuit);
  await generateVerifierCmd(circuit, defaultVerifierPath(fileData.name));
  await exportVerifierCmd();
  await verifierTestCmd(circuit);
  await exportVerifierTestCmd(circuit);
  await exportCircuitCmd();
}
