import { ByteVector } from "./byte-vector.ts";
import { CircomBigInt } from "./circom-big-int.ts";
import { NUM_BLOCKS } from "./constants.ts";
import type { BinStr, CircuitInput } from "./types.ts";

type MainInputData = {
  msg: string[][];
  msgBytes: string[];
  msgBytesLength: string;
  tBlock: string;
  pubkey: string[];
  signature: string[];
  nonceKeyStartIndex: string;
  nonceLength: string;
};

function binaryfy(str: string): asserts str is BinStr {
  if (str !== "0" && str !== "1") {
    throw new Error("String is not '0' or '1'");
  }
}

export class MainCircuitInput implements CircuitInput<MainInputData> {
  private headers: string;
  private payload: string;
  private signature: string;
  private pubkey: string;
  private msg: ByteVector;

  constructor(rawJWT: string, jwkModulus: string) {
    const [headers, payload, signature] = rawJWT.split(".");
    this.headers = headers;
    this.payload = payload;
    this.signature = signature;
    this.pubkey = jwkModulus;
    this.msg = ByteVector.fromAsciiString(`${this.headers}.${this.payload}`);
  }

  toObject(): MainInputData {
    const blocks = this.buildBlocksFromMsg();
    const tBlock = this.sha2Pad(blocks);

    return {
      msg: blocks,
      msgBytes: this.formatMsgBytes(),
      msgBytesLength: this.msg.byteLength.toString(),
      tBlock,
      pubkey: CircomBigInt.fromBase64(this.pubkey).serialize(),
      signature: CircomBigInt.fromBase64(this.signature).serialize(),
      nonceKeyStartIndex: this.nonceKeyStartIndex(),
      nonceLength: this.nonceLength(),
    };
  }

  private formatMsgBytes(): string[] {
    return this.msg.toCircomNumberArray();
  }

  private buildBlocksFromMsg(): BinStr[][] {
    if (this.msg.byteLength * 8 / 512 > NUM_BLOCKS) {
      throw new Error("Message is too long for the block size.");
    }

    const blocks: BinStr[][] = this.emptyMsg();

    this.msg.bytes().forEach((byte, byteN) => {
      const blockN = Math.floor(byteN / 64);
      const start = byteN % 64;

      const digits = byte.toString(2).padStart(8, "0").split("");

      digits.forEach((digit, j) => {
        binaryfy(digit);
        blocks[blockN][start * 8 + j] = digit;
      });
    });

    return blocks;
  }

  private emptyMsg(): BinStr[][] {
    return [...Array(NUM_BLOCKS).keys()].map(() => "0".repeat(512).split("") as BinStr[]);
  }

  // This implments this part of the standard: https://www.rfc-editor.org/rfc/rfc4634
  private sha2Pad(blocks: BinStr[][]): string {
    // rfc4634 4.1
    // Here we want to append a "1" just after the message.
    const lastBlock = Math.floor(this.msg.byteLength / 64);
    const firstEmptyBit = (this.msg.byteLength % 64) * 8;
    blocks[lastBlock][firstEmptyBit] = "1";

    // L is the length of the message
    // K is an amount of zeros
    // We want to add a 64 bit number at the end. That's the reason for the 448 (512 - 65 === 558)
    // L + 1 + K = 448 (mod 512)
    // L is a 64 bit number
    const L = BigInt(this.msg.byteLength * 8);
    const encodedL = ByteVector.fromBigInt(L)
      .padLeft(0, 8)
      .toCircomBinary();

    const finalBlock = firstEmptyBit % 512 < 448 ? lastBlock : lastBlock + 1;

    // We append the length at the end of the final block.
    encodedL.forEach((bit, bitN) => {
      blocks[finalBlock][448 + bitN] = bit;
    });

    // We need the final block with 1 based notation as another input of the circuit
    return (finalBlock + 1).toString();
  }

  private nonceKeyStartIndex(): string {
    const rawJson = ByteVector.fromBase64String(this.payload).toAsciiStr();
    const nonceIndex = rawJson.indexOf("\"nonce\":");
    if (nonceIndex !== -1) {
      throw new Error("Missing nonce key inside JWT payload");
    }

    return nonceIndex.toString();
  }

  private nonceLength(): string {
    const rawJson = ByteVector.fromBase64String(this.payload).toAsciiStr();
    const json = JSON.parse(rawJson);

    if (!Object.hasOwn(json, "nonce")) {
      throw new Error("Missing nonce insidde JWT payload");
    }

    if (typeof json.nonce !== "string") {
      throw new Error("nonce inside JWT is not a string");
    }

    return json.nonce;
  }
}
