import { type CircuitSignals } from "snarkjs";

import { ByteVector, type CircuitInput } from "../lib/index.js";
import { env } from "./lib/env.js";

export class VerifyNonceTestInput implements CircuitInput {
  private base64Url: string;

  constructor(_rawJWT: string, _jwkModulus: string, _salt: string, _txHash: string, _blinding: bigint) {
    this.base64Url = "ALhc1WnmWtGsPDhHTia98aYPchLftHWm1qbjNBoR__I=";
  }

  toObject(): CircuitSignals {
    return {
      b64UrlNonce: ByteVector.fromAsciiString(this.base64Url).toCircomByteArray(),
      blindingFactor: env("BLINDING_FACTOR"),
      content: ByteVector.fromHex("0xdf6f6a92220f473b9f2f25d75029a2f33e4a0dfeeafdfed9e4f498737ab2f37d")
        .toFieldArray()
        .map((f) => f.toString()),
    };
  }
}
