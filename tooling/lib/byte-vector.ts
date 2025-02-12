import { intoChunks } from "./utils.ts";

export class ByteVector {
  private vec: number[];

  constructor(data: number[]) {
    const someOverflow = data.some((byte) => byte > 255);
    if (someOverflow) {
      throw new Error("Array of bytes contains a number bigger than 255");
    }
    const someUnderflow = data.some((byte) => byte < 0);
    if (someUnderflow) {
      throw new Error("Array of bytes contains a number lower than 0");
    }

    this.vec = data;
  }

  static fromAsciiString(data: string): ByteVector {
    const asciiCodes = data.split("").map((char) => char.charCodeAt(0));
    return new ByteVector(asciiCodes);
  }

  toFieldArray(): bigint[] {
    const chunks = intoChunks(this.vec, 31)
      .map((chunk) => new ByteVector(chunk))
      .map((chunk) => chunk.toBigInt());
    return chunks;
  }

  toBigInt(): bigint {
    // Because we cansider this was read from left to right, the result number is "big endian"-ish.
    const parts = this.vec.reverse().map((byte, i) => {
      return BigInt(byte) << 8n * BigInt(i);
    });

    return parts.reduce((a, b) => a + b);
  }
}
