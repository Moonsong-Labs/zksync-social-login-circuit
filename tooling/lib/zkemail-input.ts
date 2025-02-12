import { ok } from "node:assert";

import { CircomBigInt } from "./circom-big-int.ts";
import { AUD_MAX_LENGTH, MAX_ISS_LENGTH, MAX_NONCE_LENGTH } from "./constants.ts";
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
};

function prepareMessage(
  headerString: string,
  payloadString: string,
  maxMessageLength: number,
): [Uint8Array, number] {
  const message = Buffer.from(`${headerString}.${payloadString}`);
  return sha256Pad(message, maxMessageLength);
}

export function sha256Pad(message: Buffer, maxShaBytes: number): [Uint8Array, number] {
  const msgLen = message.length * 8; // bytes to bits
  const msgLenBytes = Buffer.alloc(8);
  msgLenBytes.writeBigUint64BE(BigInt(msgLen));

  let res = Buffer.concat([message, Buffer.from([2 ** 7])]);

  // let res = mergeUInt8Arrays(message, int8toBytes(2 ** 7)); // Add the 1 on the end, length 505
  // while ((prehash_prepad_m.length * 8 + length_in_bytes.length * 8) % 512 !== 0) {
  while ((res.length * 8 + msgLenBytes.length * 8) % 512 !== 0) {
    res = Buffer.concat([res, Buffer.from([0])]);
  }

  res = Buffer.concat([res, msgLenBytes]);
  ok((res.length * 8) % 512 === 0, "Padding did not complete properly!");
  const messageLen = res.byteLength;
  while (res.length < maxShaBytes) {
    res = Buffer.concat([res, Buffer.from([0])]);
  }

  ok(
    res.length === maxShaBytes,
    `Padding to max length did not complete properly! Your padded message is ${res.length} long but max is ${maxShaBytes}!`,
  );

  return [res, messageLen];
}

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
    const [headerString, payloadString, signature] = this.rawJWT.split(".");

    const periodIndex = this.rawJWT.indexOf(".");
    const maxMessageLength = 1024;
    const [messagePadded, messagePaddedLen] = prepareMessage(headerString, payloadString, maxMessageLength);

    return {
      message: Uint8ArrayToCharArray(messagePadded),
      messageLength: messagePaddedLen.toString(),
      pubkey: CircomBigInt.fromBase64(this.jwkModulus).serialize(),
      signature: CircomBigInt.fromBase64(signature).serialize(),
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
    };
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
