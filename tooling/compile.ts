import path from 'node:path';
import { cmd } from './lib/cmd.ts';

export async function compileCmd(filePath: string) {
  const fileData = path.parse(filePath);

  if (fileData.ext !== '.circom') {
    throw new Error("File should be a circom file");
  }

  await cmd(`mkdir -p target/${fileData.name}`)
  await cmd(`circom ${filePath} --sym --r1cs --wasm --O2 -o target/${fileData.name} -l node_modules`)
}