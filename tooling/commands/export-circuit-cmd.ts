import fs from "node:fs";
import path from "node:path";

import { MAIN_CIRCUIT_NAME, TARGET_DIR } from "../../lib/constants.js";
import { cmd, ROOT_DIR } from "../lib/cmd.js";
import { preparedZkeyFile } from "./prepare-zkey-cmd.js";

export async function exportCircuitCmd(): Promise<void> {
  const publicDir = path.join(ROOT_DIR, "..", "auth-server", "public");
  if (!fs.existsSync(publicDir)) {
    throw new Error(`Dir ${publicDir} does not exist. This command only work when this repo is uses as submodule of zksync-sso.`);
  }

  const outDir = path.join(publicDir, "circuit");

  await cmd(`mkdir -p ${outDir}`);
  const wasmOrigin = path.join(ROOT_DIR, TARGET_DIR, MAIN_CIRCUIT_NAME, `${MAIN_CIRCUIT_NAME}_js`, `${MAIN_CIRCUIT_NAME}.wasm`);
  if (!fs.existsSync(wasmOrigin)) {
    throw new Error("Missing wasm file. Try running running `pnpm tool compile` first");
  }
  const wasmDst = path.join(outDir, "witness.wasm");
  fs.copyFileSync(wasmOrigin, wasmDst);

  const zkOrigin = preparedZkeyFile(MAIN_CIRCUIT_NAME);
  if (!fs.existsSync(zkOrigin)) {
    throw new Error("Missing zkey file. Please generate and prepare it first.");
  }

  const zkDst = path.join(outDir, "circuit.zkey");
  fs.copyFileSync(zkOrigin, zkDst);

  const snarkJsOrigin = path.join(ROOT_DIR, "node_modules", "snarkjs", "build", "snarkjs.min.js");
  const snarkJsDst = path.join(publicDir, "snarkjs.min.js");
  fs.copyFileSync(snarkJsOrigin, snarkJsDst);
}
