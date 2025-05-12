import { writeFileSync } from "node:fs";
import path from "node:path";

import type { Hex } from "viem";

import { JwtTxValidationInputs } from "../../lib/index.js";
import { cmd, ROOT_DIR } from "../lib/cmd.js";
import { env } from "../lib/env.js";
import type { AddCmdFn } from "../base-cli.js";
import { MAIN_CIRCUIT_FILE } from "../paths.js";

export function inputFilePath(name: string) {
  return path.join(ROOT_DIR, "inputs", `${name}.input.json`);
}

export async function generateInputCmd() {
  const filePath = path.join(ROOT_DIR, MAIN_CIRCUIT_FILE);
  const circomFileData = path.parse(filePath);

  const rawJWT = env("RAW_JWT");
  const jwkModulus = env("JWK_MODULOUS");
  const salt = env("SALT") as Hex;
  const nonceContent = env("NONCE_CONTENT") as Hex;
  const blindingFactor = BigInt(env("BLINDING_FACTOR"));

  const generator = new JwtTxValidationInputs(
    rawJWT,
    jwkModulus,
    salt,
    nonceContent,
    blindingFactor,
  );

  const input = generator.toObject();
  const serialized = JSON.stringify(input, null, 2);
  const inputDestinationPath = inputFilePath(circomFileData.name);

  const inputFileData = path.parse(inputDestinationPath);

  await cmd(`mkdir -p ${inputFileData.dir}`);
  writeFileSync(inputDestinationPath, Buffer.from(serialized, "utf8"));
}

export const addGenerateInputCmd: AddCmdFn = (cli) => {
  return cli.command("input", "generates input for circuit if it knows how to.", async () => {
    await generateInputCmd();
  });
};
