import { writeFileSync } from "node:fs";
import path from "node:path";

import { cmd } from "./lib/cmd.ts";
import { env } from "./lib/env.ts";
import { MainCircuitInput } from "./lib/main-input.ts";
import type { CircuitInput } from "./lib/types.ts";
import { ZkEmailCircuitInput } from "./lib/zkemail-input.ts";

type InputGenerator = (jwt: string, key: string) => CircuitInput<unknown>;
const INPUT_GENERATORS: Record<string, InputGenerator> = {
  main: (jwt: string, key: string) => new MainCircuitInput(jwt, key),
  "zkemail-jwt-verify": (jwt: string, key: string) => new ZkEmailCircuitInput(jwt, key),
};

export async function inputCommand(filePath: string, root: string) {
  const circomFileData = path.parse(filePath);

  const generator = INPUT_GENERATORS[circomFileData.name];
  if (!generator) {
    throw new Error(`Invalid file name provided: ${circomFileData.name}`);
  }

  const rawJWT = env("RAW_JWT");
  const jwkModulus = env("JWK_MODULOUS");

  const input = generator(rawJWT, jwkModulus).toObject();
  const serialized = JSON.stringify(input, null, 2);
  const inputDestinationPath = path.join(root, "inputs", `${circomFileData.name}.input.json`);

  const inputFileData = path.parse(inputDestinationPath);

  await cmd(`mkdir -p ${inputFileData.dir}`);
  writeFileSync(inputDestinationPath, Buffer.from(serialized, "utf8"));
}
