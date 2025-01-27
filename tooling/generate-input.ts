import path from 'node:path';
import { writeFileSync } from 'node:fs'
import { env } from './lib/env.ts';
import { MainCircuitInput } from './lib/main-input.ts';
import { ZkEmailCircuitInput } from './lib/zkemail-input.ts';
import type { CircuitInput } from './lib/types.ts';

type InputGenerator = (jwt: string, key: string) => CircuitInput<any>
const INPUT_GENERATORS: Record<string, InputGenerator> = {
  main: (jwt: string, key: string) => new MainCircuitInput(jwt, key),
  zkemail: (jwt: string, key: string) => new ZkEmailCircuitInput(jwt, key),
}

export async function inputCommand(filePath: string, root: string) {
  const fileData = path.parse(filePath);

  const generator = INPUT_GENERATORS[fileData.name]
  if (!generator) {
    throw new Error(`Invalid file name provided: ${fileData.name}`);
  }

  const rawJWT = env('RAW_JWT')
  const jwkModulus = env('JWK_MODULOUS');

  const input = generator(rawJWT, jwkModulus).toObject();
  const serialized = JSON.stringify(input, null, 2);
  const inputDestinationPath = path.join(root, 'inputs', `${fileData.name}.input.json`);
  writeFileSync(inputDestinationPath, Buffer.from(serialized, 'utf8'));
}