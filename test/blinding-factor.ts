import "dotenv/config";

import { writeFileSync } from "node:fs";
import * as path from "node:path";

import type { Hex } from "viem";

import { ByteVector, createNonce } from "../lib";
import { FIELD_BYTES } from "../lib/constants";
import { inputFilePath } from "../tooling/commands/generate-input-cmd";
import { runCmd } from "../tooling/commands/run-cmd";
import { cmd } from "../tooling/lib/cmd";
import { env } from "../tooling/lib/env.js";

async function main() {
  const thisNonceContent = env("NONCE_CONTENT") as Hex;
  const thisBlindingFactor = BigInt(env("BLINDING_FACTOR"));

  const nonce = createNonce(
    thisNonceContent,
    thisBlindingFactor,
  );

  const nonceContent = ByteVector.fromHex(thisNonceContent).toBnChunks(FIELD_BYTES).map((n) => n.toString());

  const inputs = {
    b64Nonce: ByteVector.fromAsciiString(nonce).toCircomByteArray(),
    blindingFactor: thisBlindingFactor.toString(),
    nonceContent: nonceContent,
  };

  const inputPath = inputFilePath("test/blinding-factor");
  const inputFile = path.parse(inputPath);
  await cmd(`mkdir -p ${inputFile.dir}`);
  writeFileSync(inputPath, Buffer.from(JSON.stringify(inputs, null, 2), "utf8"));

  await runCmd("test/blinding-factor.circom", false);
}

main().catch(console.error);
