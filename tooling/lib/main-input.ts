import { NUM_BLOCKS } from './constants.ts';
import type { BinStr, CircuitInput } from './types.ts';
import { CircomBigInt } from './circom-big-int.ts';

type MainInputData = {
  msg: string[][],
  msgBytes: string[],
  msgBytesLength: string,
  tBlock: string,
  pubkey: string[],
  signature: string[],
}

function binaryfy(str: string): asserts str is BinStr {
  if (str !== "0" && str !== "1") {
    throw new Error("String is not '0' or '1'")
  }
}

export class MainCircuitInput implements CircuitInput<MainInputData>{
  private headers: string;
  private payload: string;
  private signature: string;
  private pubkey: string;
  private msg: Buffer;


  constructor(rawJWT: string, jwkModulus: string) {
    const [headers, payload, signature] = rawJWT.split(".");
    this.headers = headers;
    this.payload = payload;
    this.signature = signature;
    this.pubkey = jwkModulus;
    this.msg = Buffer.from(`${this.headers}.${this.payload}`, 'utf8')
  }


  toObject(): MainInputData {
    const blocks = this.buildBlocksFromMsg()
    const tBlock = this.sha2Pad(blocks)

    return {
      msg: blocks,
      msgBytes: this.formatMsgBytes(),
      msgBytesLength: this.msg.byteLength.toString(),
      tBlock,
      pubkey: CircomBigInt.fromBase64(this.pubkey).serialize(),
      signature: CircomBigInt.fromBase64(this.signature).serialize()
    }
  }

  private formatMsgBytes(): string[] {
    return Array.from(this.msg).map(byte => byte.toString())
  }

  private buildBlocksFromMsg(): BinStr[][] {
    if (this.msg.byteLength * 8 / 512 > NUM_BLOCKS) {
      throw new Error('Message is too long for the block size.');
    }

    const blocks: BinStr[][] = this.emptyMsg();

    Array.from(this.msg).forEach((byte, byteN) => {
      let blockN = Math.floor(byteN / 64);
      let start = byteN % 64;

      let digits = byte.toString(2).padStart(8, '0').split("");

      digits.forEach((digit, j) => {
        binaryfy(digit)
        blocks[blockN][start * 8 + j] = digit;
      })
    })

    return blocks;
  }

  private emptyMsg(): BinStr[][] {
    return [...Array(NUM_BLOCKS).keys()].map(_ => '0'.repeat(512).split("") as BinStr[]);
  }

  // This implments this part of the standard: https://www.rfc-editor.org/rfc/rfc4634
  private sha2Pad(blocks: BinStr[][]): string {
    // rfc4634 4.1
    // Here we want to append a "1" just after the message.
    const lastBlock = Math.floor(this.msg.byteLength / 64)
    const firstEmptyBit = (this.msg.byteLength % 64) * 8
    blocks[lastBlock][firstEmptyBit] = "1";

    // L is the length of the message
    // K is an amount of zeros
    // We want to add a 64 bit number at the end. That's the reason for the 448 (512 - 65 === 558)
    // L + 1 + K = 448 (mod 512)

    // L is a 64 bit number
    const L = Buffer.alloc(8)
    L.writeBigUint64BE(BigInt(this.msg.byteLength * 8))
    const encodedL = Array.from(L).flatMap(byte => this.byteTo8digits(byte));
    const finalBlock = firstEmptyBit % 512 < 448 ? lastBlock : lastBlock + 1;

    // We append the length at the end of the final block.
    encodedL.forEach((bit, bitN) => {
      blocks[finalBlock][448 + bitN] = bit;
    })

    // We need the final block with 1 based notation as another input of the circuit
    return (finalBlock + 1).toString()
  }

  private byteTo8digits(byte: number): BinStr[] {
    return byte.toString(2).padStart(8, '0').split("") as BinStr[];
  }
}