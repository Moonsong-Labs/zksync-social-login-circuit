import { existsSync } from "node:fs";
import path from "node:path";

import { compileCmd } from "./compile.js";
import { defaultPtauPath } from "./download-ptau.js";
import { defaultVerifierPath, generateVerifier } from "./generate-verifier.js";
import { cmd, ROOT_DIR } from "./lib/cmd.js";
import { preparedZkeyFile } from "./prepare-zkey.js";
import { r1csFilePath } from "./zkey.js";

export async function recreateCmd() {
  const circuitName = "jwt-tx-validation";
  const circuitPath = `./${circuitName}.circom`;

  const r1cs = r1csFilePath(circuitName);
  if (!existsSync(r1cs)) {
    await compileCmd(circuitPath);
  }

  // snarkjs zkv target/jwt-tx-validation/jwt-tx-validation.r1cs ptaus/ppot_0080_20.ptau exports/jwt-tx-validation.final.zkey
  const exported = path.join(ROOT_DIR, "exports", "jwt-tx-validation.final.zkey");

  try {
    await cmd(`snarkjs zkv ${r1cs} ${defaultPtauPath()} ${exported}`);
  } catch (_e) {
    throw new Error("Failed to validate zkey file against r1cs");
  }

  const target = preparedZkeyFile(circuitName);
  await cmd(`cp ${exported} ${target}`);

  await generateVerifier(circuitPath, defaultVerifierPath(circuitName));
}
