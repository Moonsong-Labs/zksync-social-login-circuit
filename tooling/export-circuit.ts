import fs from "node:fs";
import path from "node:path";

import { cmd, ROOT_DIR } from "./lib/cmd.js";

export async function exportCircuitCmd(): Promise<void> {
  const publicDir = path.join(ROOT_DIR, "..", "auth-server", "public");
  if (!fs.existsSync(publicDir)) {
    throw new Error(`Dir ${publicDir} does not exist. This command only work when this repo is uses as submodule of zksync-sso.`);
  }

  const outDir = path.join(publicDir, "circuit");

  await cmd(`mkdir -p ${outDir}`);

  const mainName = "jwt-tx-validation";

  const wasmOrigin = path.join(ROOT_DIR, "target", mainName, `${mainName}_js`, `${mainName}.wasm`);
  if (!fs.existsSync(wasmOrigin)) {
    throw new Error("Missing wasm file. Try running running `pnpm tool compile` first");
  }
  const wasmDst = path.join(outDir, "witness.wasm");
  fs.copyFileSync(wasmOrigin, wasmDst);

  const zkOrigin = path.join(ROOT_DIR, "target", mainName, `${mainName}.prepared.zkey`);
  if (!fs.existsSync(zkOrigin)) {
    throw new Error("Missing wasm file. Try running running `pnpm tool compile` first");
  }

  const zkDst = path.join(outDir, "circuit.zkey");
  fs.copyFileSync(zkOrigin, zkDst);

  const snarkJsOrigin = path.join(ROOT_DIR, "node_modules", "snarkjs", "build", "snarkjs.min.js");
  const snarkJsDst = path.join(publicDir, "snarkjs.min.js");
  fs.copyFileSync(snarkJsOrigin, snarkJsDst);
}
