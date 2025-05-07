import "dotenv/config";

import { buildCli } from "./base-cli.js";
import { addCallVerifierCmd } from "./commands/call-verifier-cmd.js";
import { addCompileAndExportCmd } from "./commands/compile-and-export-cmd.js";
import { addCompileCmd } from "./commands/compile-cmd.js";
import { addCreateZkeyCmd } from "./commands/create-zkey-cmd.js";
import { addDeployVerifierCmd } from "./commands/deploy-verifier-cmd.js";
import { addDownloadPtauCmd } from "./commands/download-ptau-cmd.js";
import { addExportCircuitCmd } from "./commands/export-circuit-cmd.js";
import { addExportVerifierCmd } from "./commands/export-verifier-cmd.js";
import { addExportVerifierTestCmd } from "./commands/export-verifier-test-cmd.js";
import { addGenerateInputCmd } from "./commands/generate-input-cmd.js";
import { addGenerateNonceCmd } from "./commands/generate-nonce-cmd.js";
import { addGenerateVerifierCmd } from "./commands/generate-verifier-cmd.js";
import { addGenerateVerifierTestCmd } from "./commands/generate-verifier-test-cmd.js";
import { addGenerateWitnessCmd } from "./commands/generate-witness-cmd.js";
import { addGetJwtCmd } from "./commands/get-jwt-cmd.js";
import { addPrepareZkeyCmd } from "./commands/prepare-zkey-cmd.js";
import { addProveCmd } from "./commands/prove-cmd.js";
import { addRunCmd } from "./commands/run-cmd.js";
import { addRunTestCmd } from "./commands/run-test-cmd.js";
import { addVerificationKeyCmd } from "./commands/verification-key-cmd.js";
import { addVerifyCmd } from "./commands/verify-cmd.js";
import { addDigestCommand } from "./lib/digest.js";

const cli = buildCli([
  addCompileCmd,
  addGenerateInputCmd,
  addGenerateWitnessCmd,
  addCreateZkeyCmd,
  addDownloadPtauCmd,
  addPrepareZkeyCmd,
  addDigestCommand,
  addProveCmd,
  addGenerateVerifierCmd,
  addVerificationKeyCmd,
  addVerifyCmd,
  addExportVerifierCmd,
  addExportVerifierTestCmd,
  addDeployVerifierCmd,
  addCallVerifierCmd,
  addExportCircuitCmd,
  addGetJwtCmd,
  addCompileAndExportCmd,
  addRunCmd,
  addRunTestCmd,
  addGenerateVerifierTestCmd,
  addGenerateNonceCmd,
]);

async function runCli() {
  await cli.parseAsync();
}

runCli().catch(console.error);
