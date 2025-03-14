import { existsSync } from "node:fs";
import { rm } from "node:fs/promises";
import path from "node:path";

import { DEFAULT_PTAU_SIZE } from "../lib/constants.js";
import { compileCmd } from "./compile.js";
import { downloadPtau } from "./download-ptau.js";
import { exportCircuitCmd } from "./export-circuit.js";
import { exportVerifierCmd } from "./export-verifier.js";
import { inputCommand } from "./generate-input.js";
import { defaultVerifierPath, generateVerifier } from "./generate-verifier.js";
import { ROOT_DIR } from "./lib/cmd.js";
import { prepareZkeyCmd } from "./prepare-zkey.js";
import { prove } from "./prove.js";
import { verificationKeyCmd } from "./verification-key.js";
import { verifyCmd } from "./verify.js";
import { witnessCommand } from "./witness.js";
import { DEFAULT_PTAU, zkeyCommand } from "./zkey.js";

export async function allCmd(circuit: string) {
  const fileData = path.parse(circuit);

  const targetDir = path.join(ROOT_DIR, "target", fileData.name);
  if (existsSync(targetDir)) {
    await rm(targetDir, {
      recursive: true,
    });
  }

  await compileCmd(circuit);
  await inputCommand(circuit);
  await witnessCommand(circuit);

  const defaultPtauPath = path.join(ROOT_DIR, DEFAULT_PTAU);

  if (!existsSync(defaultPtauPath)) {
    await downloadPtau(DEFAULT_PTAU_SIZE);
  }

  await zkeyCommand(circuit, DEFAULT_PTAU);
  await prepareZkeyCmd(circuit);
  await prove(circuit);
  await verificationKeyCmd(circuit);
  await verifyCmd(circuit);
  await generateVerifier(circuit, defaultVerifierPath(fileData.name));
  await exportVerifierCmd(circuit);
  await exportCircuitCmd();
}
