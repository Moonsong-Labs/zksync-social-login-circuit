import { ok } from "node:assert";

import { ByteVector } from "./byte-vector.ts";
import { CircomBigInt } from "./circom-big-int.ts";
import { AUD_MAX_LENGTH, MAX_ISS_LENGTH, MAX_NONCE_LENGTH, SUB_MAX_LENGTH } from "./constants.ts";
import type { CircuitInput } from "./types.ts";

type Payload = {
  nonce: string;
  iss: string;
  aud: string;
  sub: string;
};

type ZkEmailInputData = {
  message: string[];
  messageLength: string;
  pubkey: string[];
  signature: string[];
  periodIndex: string;
  nonceKeyStartIndex: string;
  nonceLength: string;
  expectedNonce: string[];
  issKeyStartIndex: string;
  issLength: string;
  expectedIss: string[];
  audKeyStartIndex: string;
  audLength: string;
  expectedAud: string[];
  subKeyStartIndex: string;
  subLength: string;
  expectedSub: string[];
};

// export function sha256Pad(message: ByteVector, maxShaBytes: number): [Uint8Array, number] {
//   const msgLen = message.length * 8; // bytes to bits
//   const msgLenBytes = Buffer.alloc(8);
//   msgLenBytes.writeBigUint64BE(BigInt(msgLen));
//
//   let res = Buffer.concat([message, Buffer.from([2 ** 7])]);
//
//   // let res = mergeUInt8Arrays(message, int8toBytes(2 ** 7)); // Add the 1 on the end, length 505
//   // while ((prehash_prepad_m.length * 8 + length_in_bytes.length * 8) % 512 !== 0) {
//   while ((res.length * 8 + msgLenBytes.length * 8) % 512 !== 0) {
//     res = Buffer.concat([res, Buffer.from([0])]);
//   }
//
//   res = Buffer.concat([res, msgLenBytes]);
//   ok((res.length * 8) % 512 === 0, "Padding did not complete properly!");
//   const messageLen = res.byteLength;
//   while (res.length < maxShaBytes) {
//     res = Buffer.concat([res, Buffer.from([0])]);
//   }
//
//   ok(
//     res.length === maxShaBytes,
//     `Padding to max length did not complete properly! Your padded message is ${res.length} long but max is ${maxShaBytes}!`,
//   );
//
//   return [res, messageLen];
// }

export function Uint8ArrayToCharArray(a: Uint8Array): string[] {
  return Array.from(a).map((x) => x.toString());
}

export class ZkEmailCircuitInput implements CircuitInput<ZkEmailInputData> {
  private rawJWT: string;
  private jwkModulus: string;

  constructor(rawJWT: string, jwkModulus: string) {
    this.rawJWT = rawJWT;
    this.jwkModulus = jwkModulus;
  }

  toObject(): ZkEmailInputData {
    const periodIndex = this.rawJWT.indexOf(".");
    const [messagePadded, messagePaddedLen] = this.message();

    return {
      message: messagePadded.toCircomNumberArray(),
      messageLength: messagePaddedLen.toString(),
      pubkey: this.pubkey(),
      signature: this.signature(),
      periodIndex: periodIndex.toString(),
      nonceKeyStartIndex: this.nonceKeyStartIndex(),
      nonceLength: this.nonceLength(),
      expectedNonce: this.expectedNonce(),
      issKeyStartIndex: this.issKeyStartIndex(),
      issLength: this.issLength(),
      expectedIss: this.expectedIss(),
      audKeyStartIndex: this.audKeyStartIndex(),
      audLength: this.audLength(),
      expectedAud: this.expectedAud(),
      subKeyStartIndex: this.subKeyStartIndex(),
      subLength: this.subLength(),
      expectedSub: this.expectedSub(),
    };
  }

  private message(): [ByteVector, number] {
    const [header, payload] = this.rawJWT.split(".");
    const msg = ByteVector.fromAsciiString(`${header}.${payload}`);
    const L = BigInt(msg.byteLength * 8);

    // rfc4634 4.1
    // Here we want to append a "1" just after the message.
    msg.pushLast(128); // Push

    // L is the length of the message
    // L is a 64-bit number
    const encodedL = ByteVector.fromBigInt(L)
      .padLeft(0, 8);

    // K is an amount of zeros
    // We want to add a 64-bit number at the end. That's the reason for the 448 (512 - 65 === 558)
    // L + 1 + K = 448 (mod 512) -- Translated to bytes -> L + 1 + K = 56 (64)
    while (msg.byteLength % 64 !== 56) {
      msg.pushLast(0);
    }

    const finalMessage = msg.append(encodedL);

    // const finalBlock = firstEmptyBit % 512 < 448 ? lastBlock : lastBlock + 1;

    return [finalMessage, finalMessage.byteLength / 512];
  }

  private pubkey(): string[] {
    return CircomBigInt.fromBase64(this.jwkModulus).serialize();
  }

  private signature(): string[] {
    const signature = this.rawJWT.split(".")[2];
    return CircomBigInt.fromBase64(signature).serialize();
  }

  // nonce

  private nonceKeyStartIndex(): string {
    return this.findSubstringIndexForPayload("\"nonce\":");
  }

  private nonceLength(): string {
    return this.buildCircomStringLength(this.payload().nonce);
  }

  private expectedNonce(): string[] {
    return this.buildCircomExpectedValue(this.payload().nonce, MAX_NONCE_LENGTH);
  }

  // iss

  private issKeyStartIndex() {
    return this.findSubstringIndexForPayload("\"iss\":");
  }

  private issLength(): string {
    return this.buildCircomStringLength(this.payload().iss);
  }

  private expectedIss(): string[] {
    return this.buildCircomExpectedValue(this.payload().iss, MAX_ISS_LENGTH);
  }

  // aud

  private audKeyStartIndex(): string {
    return this.findSubstringIndexForPayload("\"aud\":");
  }

  private audLength(): string {
    return this.buildCircomStringLength(this.payload().aud);
  }

  private expectedAud(): string[] {
    return this.buildCircomExpectedValue(this.payload().aud, AUD_MAX_LENGTH);
  }

  // sub

  private subKeyStartIndex(): string {
    return this.findSubstringIndexForPayload("\"sub\":");
  }

  private subLength(): string {
    return this.buildCircomStringLength(this.payload().sub);
  }

  private expectedSub(): string[] {
    return this.buildCircomExpectedValue(this.payload().sub, SUB_MAX_LENGTH);
  }

  // Helpers

  private payload(): Payload {
    const payload = this.rawJWT.split(".")[1];
    const rawJson = Buffer.from(payload, "base64url").toString("utf8");
    const json = JSON.parse(rawJson);

    for (const prop of ["nonce", "iss", "aud", "sub"]) {
      if (!Object.hasOwn(json, prop)) {
        throw new Error(`Missing '${prop}' inside JWT payload`);
      }

      if (typeof json.nonce !== "string") {
        throw new Error(`Property '${prop}' inside JWT is not a string`);
      }
    }

    return json;
  }

  private buildCircomExpectedValue(value: string, maxLength: number): string[] {
    const res = Buffer.alloc(maxLength);
    res.write(value, "ascii");
    return Array.from(res).map((byte) => byte.toString());
  }

  private buildCircomStringLength(value: string): string {
    return Buffer.from(value, "ascii").byteLength.toString();
  }

  private findSubstringIndexForPayload(value: string): string {
    const payload = this.rawJWT.split(".")[1];
    const rawJson = Buffer.from(payload, "base64url").toString("utf8");
    const valueIndex = rawJson.indexOf(value);
    if (valueIndex === -1) {
      throw new Error(`Missing ${value} inside JWT payload`);
    }
    return valueIndex.toString();
  }
}
