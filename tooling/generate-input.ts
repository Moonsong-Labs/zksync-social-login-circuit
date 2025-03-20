import { writeFileSync } from "node:fs";
import path from "node:path";

import type { Hex } from "../lib/byte-vector.js";
import { JwtTxValidationInputs } from "../lib/index.js";
import type { CircuitInput } from "../lib/types.js";
import { BlindingFactorInputTest } from "./lib/blinding-factor-input.js";
import { cmd, ROOT_DIR } from "./lib/cmd.js";
import { env } from "./lib/env.js";
import { FrozenFireSha2Input } from "./lib/frozen-fire-sha2-input.js";
import { PoseidonTest } from "./lib/poseidon-test-input.js";
import { VerifyNonceTestInput } from "./verify-nonce-test-input.js";

type InputGenerator = (jwt: string, key: string, salt: Hex, nonceContent: Hex, blinding: bigint) => CircuitInput;
const INPUT_GENERATORS: Record<string, InputGenerator> = {
  "frozen-fire-sha2": (jwt: string, key: string, _salt: Hex, _txHash: Hex, _blinding: bigint) => new FrozenFireSha2Input(jwt, key),
  "jwt-tx-validation": (jwt: string, key: string, salt: Hex, nonceContent: Hex, blinding: bigint) => new JwtTxValidationInputs(jwt, key, salt, nonceContent, blinding),
  "poseidon-test": () => new PoseidonTest(),
  "blinding-factor": (jwt, key, salt, nonceContent: Hex, blinding: bigint) =>
    new BlindingFactorInputTest(jwt, key, salt, nonceContent, blinding),
  "verify-nonce-test": (jwt, key, salt, nonceContent, blinding) => new VerifyNonceTestInput(jwt, key, salt, nonceContent, blinding),
};

export async function inputCommand(filePath: string) {
  const circomFileData = path.parse(filePath);

  const generator = INPUT_GENERATORS[circomFileData.name];
  if (!generator) {
    throw new Error(`Invalid file name provided: ${circomFileData.name}`);
  }

  const rawJWT = env("RAW_JWT");
  const jwkModulus = env("JWK_MODULOUS");
  const salt = env("SALT") as Hex;
  const nonceContent = env("TX_HASH") as Hex;
  const blindingFactor = BigInt(env("BLINDING_FACTOR"));

  const input = generator(rawJWT, jwkModulus, salt, nonceContent, blindingFactor).toObject();
  const serialized = JSON.stringify(input, null, 2);
  const inputDestinationPath = path.join(ROOT_DIR, "inputs", `${circomFileData.name}.input.json`);

  const inputFileData = path.parse(inputDestinationPath);

  await cmd(`mkdir -p ${inputFileData.dir}`);
  writeFileSync(inputDestinationPath, Buffer.from(serialized, "utf8"));
}
