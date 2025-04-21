import { FIELD_BYTES } from "./constants.js";
import type { BinStr } from "./types.js";
import { base64UrlDecode, base64UrlEncode, decodeHex, encodeHex, intoChunks } from "./utils.js";

export type Hex = `0x${string}`;

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

  static fromBase64UrlString(data: string): ByteVector {
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

  static fromHex(hex: string): ByteVector {
    const decoded = decodeHex(hex);
    return new ByteVector(Array.from(decoded));
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

  toBnChunks(chunkSizeBytes: number): bigint[] {
    return intoChunks(this.vec, chunkSizeBytes)
      .map((chunk) => new ByteVector(chunk).toBigInt());
  }

  toFieldArray(): bigint[] {
    return intoChunks(this.vec, FIELD_BYTES)
      .map((chunk) => new ByteVector(chunk).reverse())
      .map((chunk) => chunk.toBigInt());
  }

  toBigInt(): bigint {
    // Because we consider this was read from left to right, the result number is "big endian"-ish.
    // We need to copy the array because javascript "reverse" changes the array.
    const parts = [...this.vec].reverse().map((byte, i) => {
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
      buf[i] = this.vec[i]!;
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

  private byteTo8digits(byte: number): BinStr[] {
    return byte.toString(2).padStart(8, "0").split("") as BinStr[];
  }

  reverse(): ByteVector {
    return new ByteVector(this.vec.reverse());
  }

  toBase64Url(): string {
    const buf = new Uint8Array(this.vec.length);
    this.vec.forEach((byte, i) => buf[i] = byte);
    return base64UrlEncode(buf);
  }

  toHex(): Hex {
    const buf = new Uint8Array(this.vec.length);
    this.vec.forEach((byte, i) => buf[i] = byte);
    return encodeHex(buf) as Hex;
  }
}
