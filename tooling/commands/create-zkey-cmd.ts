import { existsSync } from "node:fs";
import * as path from "node:path";

import { cmd } from "../lib/cmd.js";

export const DEFAULT_PTAU = "ptaus/ppot_0080_20.ptau";

const REPO_ROOT = path.resolve(process.cwd().endsWith("packages/circuits") ? path.join(process.cwd(), "..", "..") : process.cwd());

function resolveExistingPath(primary: string, fallback: string): string {
  const absPrimary = path.join(REPO_ROOT, primary);
  if (existsSync(absPrimary)) return absPrimary;
  const absFallback = path.join(REPO_ROOT, fallback);
  return absFallback;
}

export function r1csFilePath(name: string) {
  // Support legacy output (target/...) and new namespaced output (packages/circuits/target/...)
  return resolveExistingPath(`packages/circuits/target/${name}/${name}.r1cs`, `target/${name}/${name}.r1cs`);
}

export function rawZkeyFilePath(name: string): string {
  return resolveExistingPath(`packages/circuits/target/${name}/${name}.zkey`, `target/${name}/${name}.zkey`);
}

export async function createZkeyCmd(filePath: string, ptauPath: string) {
  const fileData = path.parse(filePath);

  if (!existsSync(ptauPath)) {
    // Try fallback relative to repo root if executed from within packages/circuits
    const cwd = process.cwd();
    let adjusted = ptauPath;
    if (cwd.endsWith("packages/circuits")) {
      adjusted = path.join(cwd, "..", "..", ptauPath);
      if (existsSync(adjusted)) {
        console.warn(`[zkey] Using fallback ptau path: ${adjusted}`);
        ptauPath = adjusted; // reassign for subsequent command
      }
    }
    if (!existsSync(ptauPath)) {
      console.error(`[zkey] DEBUG: Provided ptau path='${ptauPath}', original='${ptauPath}', existsSync=false, cwd='${cwd}'`);
      throw new Error(`Missing ptau file: ${ptauPath}. Maybe you want to download with 'tooling download-ptau'`);
    }
  }

  const r1cs = r1csFilePath(fileData.name);
  const out = rawZkeyFilePath(fileData.name);
  await cmd(`snarkjs g16s ${r1cs} ${ptauPath} ${out}`);
}
