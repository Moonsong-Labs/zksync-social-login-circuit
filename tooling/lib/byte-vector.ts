import { FIELD_BYTES } from "./constants.ts";
import type { BinStr } from "./types.ts";
import { intoChunks } from "./utils.ts";

function base64UrlDecode(base64UrlString: string) {
  // 1. Replace URL-unsafe characters with standard base64 characters
  let base64 = base64UrlString.replace(/-/g, "+").replace(/_/g, "/");

  // 2. Add padding if necessary (atob() requires correctly padded input)
  while (base64.length % 4) {
    base64 += "=";
  }

  // 3. Decode the base64 string
  const binaryString = atob(base64);

  // 4. Convert the binary string to a Uint8Array
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}

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

  static fromBase64String(data: string): ByteVector {
    const decoded = base64UrlDecode(data);
    return new ByteVector(Array.from(decoded));
  }

  static fromBigInt(n: bigint): ByteVector {
    let current = n;
    const mask = 255n;
    const data = [];
    while (current > 0n) {
      const byte = current & mask;
      data.push(Number(byte));
      current = current >> 8n;
    }
    return new ByteVector(data.reverse());
  }

  padLeft(filling: number, finalSize: number): ByteVector {
    if (finalSize < this.vec.length) {
      throw new Error("Trying to pad to shorter length");
    }

    const newSize = finalSize - this.vec.length;
    const arr = new Array<number>(newSize);
    arr.fill(filling);
    return new ByteVector([...arr, ...this.vec]);
  }

  padRight(filling: number, finalSize: number): ByteVector {
    if (finalSize < this.vec.length) {
      throw new Error("Trying to pad to shorter length");
    }

    const newSize = finalSize - this.vec.length;
    const arr = new Array<number>(newSize);
    arr.fill(filling);
    return new ByteVector([...this.vec, ...arr]);
  }

  toCircomBinary(): BinStr[] {
    return this.vec.flatMap((byte) => this.byteTo8digits(byte));
  }

  private byteTo8digits(byte: number): BinStr[] {
    return byte.toString(2).padStart(8, "0").split("") as BinStr[];
  }

  toFieldArray(): bigint[] {
    const chunks = intoChunks(this.vec, FIELD_BYTES)
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

  get byteLength(): number {
    return this.vec.length;
  }

  get length(): number {
    return this.byteLength;
  }

  toCircomByteArray(): string[] {
    return this.vec.map((byte) => byte.toString());
  }

  bytes(): number[] {
    return [...this.vec];
  }

  toAsciiStr(): string {
    const buf = new Uint8Array(this.vec.length);
    for (let i = 0; i < this.vec.length; i++) {
      buf[i] = this.vec[i];
    }
    return new TextDecoder("ascii").decode(buf);
  }

  pushLast(newElement: number): void {
    this.vec.push(newElement);
  }

  append(encodedL: ByteVector): ByteVector {
    const vec = [...this.vec, ...encodedL.vec];
    return new ByteVector(vec);
  }
}
