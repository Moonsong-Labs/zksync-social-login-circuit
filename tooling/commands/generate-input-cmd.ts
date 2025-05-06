import { writeFileSync } from "node:fs";
import path from "node:path";

import type { Hex } from "viem";

import { type CircuitInput, JwtTxValidationInputs } from "../../lib/index.js";
import { FrozenFireSha2Input } from "../inputs/frozen-fire-sha2-input.js";
import { PoseidonTest } from "../inputs/poseidon-test-input.js";
import { VerifyNonceTestInput } from "../inputs/verify-nonce-test-input.js";
import { cmd, ROOT_DIR } from "../lib/cmd.js";
import { env } from "../lib/env.js";

type InputGenerator = (jwt: string, key: string, salt: Hex, nonceContent: Hex, blinding: bigint) => CircuitInput;
const INPUT_GENERATORS: Record<string, InputGenerator> = {
  "frozen-fire-sha2": (jwt: string, key: string, _salt: Hex, _txHash: Hex, _blinding: bigint) => new FrozenFireSha2Input(jwt, key),
  "jwt-tx-validation": (jwt: string, key: string, salt: Hex, nonceContent: Hex, blinding: bigint) => new JwtTxValidationInputs(jwt, key, salt, nonceContent, blinding),
  "poseidon-test": () => new PoseidonTest(),
  "verify-nonce-test": (jwt, key, salt, nonceContent, blinding) => new VerifyNonceTestInput(jwt, key, salt, nonceContent, blinding),
};

export function inputFilePath(name: string) {
  return path.join(ROOT_DIR, "inputs", `${name}.input.json`);
}

export async function generateInputCmd(filePath: string) {
  const circomFileData = path.parse(filePath);

  const generator = INPUT_GENERATORS[circomFileData.name];
  if (!generator) {
    throw new Error(`Invalid file name provided: ${circomFileData.name}`);
  }

  const rawJWT = env("RAW_JWT");
  const jwkModulus = env("JWK_MODULOUS");
  const salt = env("SALT") as Hex;
  const nonceContent = env("NONCE_CONTENT") as Hex;
  const blindingFactor = BigInt(env("BLINDING_FACTOR"));

  const input = generator(rawJWT, jwkModulus, salt, nonceContent, blindingFactor).toObject();
  const serialized = JSON.stringify(input, null, 2);
  const inputDestinationPath = inputFilePath(circomFileData.name);

  const inputFileData = path.parse(inputDestinationPath);

  await cmd(`mkdir -p ${inputFileData.dir}`);
  writeFileSync(inputDestinationPath, Buffer.from(serialized, "utf8"));
}
