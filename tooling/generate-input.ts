import { writeFileSync } from "node:fs";
import path from "node:path";

import type { CircuitInput } from "../lib/types.js";
import { cmd } from "./lib/cmd.js";
import { env } from "./lib/env.js";
import { MainCircuitInput } from "./lib/main-input.js";
import { PoseidonTest } from "./lib/poseidon-test-input.js";
import { ZkEmailCircuitInput } from "./lib/zkemail-input.js";
import { BlindingFactorInputTest } from "./lib/blinding-factor-input.js";

type InputGenerator = (jwt: string, key: string, salt: bigint, txHash: string, blinding: bigint) => CircuitInput<unknown>;
const INPUT_GENERATORS: Record<string, InputGenerator> = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  main: (jwt: string, key: string, _salt: bigint, _txHash: string, _blinding: bigint) => new MainCircuitInput(jwt, key),
  "zkemail-jwt-verify": (jwt: string, key: string, salt: bigint) => new ZkEmailCircuitInput(jwt, key, salt),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  "poseidon-test": (_a: string, _b: string, _salt: bigint) => new PoseidonTest(),
  "blinding-factor": (jwt, key, salt, txHash: string, blinding: bigint) =>
    new BlindingFactorInputTest(jwt, key, salt, txHash, blinding),
};

export async function inputCommand(filePath: string, root: string) {
  const circomFileData = path.parse(filePath);

  const generator = INPUT_GENERATORS[circomFileData.name];
  if (!generator) {
    throw new Error(`Invalid file name provided: ${circomFileData.name}`);
  }

  const rawJWT = env("RAW_JWT");
  const jwkModulus = env("JWK_MODULOUS");
  const salt = BigInt(env("SALT"));
  const txHash = env("TX_HASH");
  const blindingFactor = BigInt(env("BLINDING_FACTOR"));

  const input = generator(rawJWT, jwkModulus, salt, txHash, blindingFactor).toObject();
  const serialized = JSON.stringify(input, null, 2);
  const inputDestinationPath = path.join(root, "inputs", `${circomFileData.name}.input.json`);

  const inputFileData = path.parse(inputDestinationPath);

  await cmd(`mkdir -p ${inputFileData.dir}`);
  writeFileSync(inputDestinationPath, Buffer.from(serialized, "utf8"));
}
