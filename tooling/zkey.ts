import { cmd } from './lib/cmd.ts';
import path from 'node:path';
import { existsSync } from 'node:fs';

export async function zkeyCommand(filePath: string, ptauPath: string) {
  const fileData = path.parse(filePath);

  if (!existsSync(ptauPath)) {
    throw new Error(`Missing ptau file: ${filePath}. Maybe you want to download with 'tooling download-ptau'`);
  }

  const r1cs = `target/${fileData.name}/${fileData.name}.r1cs`;

  const out = `target/${fileData.name}/${fileData.name}.zkey`
  await cmd(`snarkjs g16s ${r1cs} ${ptauPath} ${out}`);
}