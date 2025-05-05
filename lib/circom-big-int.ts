import { ByteVector } from "./byte-vector.js";
import { CIRCOM_BIGINT_K, CIRCOM_BIGINT_N } from "./constants.js";

export class CircomBigInt {
  private value: bigint;

  constructor(value: bigint) {
    this.value = value;
  }

  static fromBase64(base64Str: string): CircomBigInt {
    const vector = ByteVector.fromBase64UrlString(base64Str);
    return this.fromByteVector(vector);
  }

  static fromByteVector(buf: ByteVector): CircomBigInt {
    return new CircomBigInt(buf.toBigIntBE());
  }

  serialize(): string[] {
    const num = this.value;
    const res = [];
    const msk = (1n << BigInt(CIRCOM_BIGINT_N)) - 1n;
    for (let i = 0; i < CIRCOM_BIGINT_K; ++i) {
      res.push(((num >> BigInt(i * CIRCOM_BIGINT_N)) & msk).toString());
    }
    return res;
  }
}
