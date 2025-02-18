import { ByteVector } from "../../lib/byte-vector.js";
import { CircomBigInt } from "./circom-big-int.js";
import { AUD_MAX_LENGTH, MAX_ISS_LENGTH, MAX_MSG_LENGTH, MAX_NONCE_LENGTH, SUB_MAX_LENGTH } from "../../lib/constants.js";
import type { CircuitInput } from "../../lib/types.js";

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
      message: messagePadded.toCircomByteArray(),
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

  private rawPayload(): string {
    const payload = this.rawJWT.split(".")[1];
    if (payload === undefined) {
      throw new Error("Error parsing JWT.");
    }
    return payload;
  }

  private rawSignature(): string {
    const signature = this.rawJWT.split(".")[2];
    if (signature === undefined) {
      throw new Error("Error parsing JWT.");
    }
    return signature;
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

    // This line is the last step of the sha2 padding
    const paddedMessage = msg.append(encodedL);

    // The circuit takes this length as input
    const byteLength = paddedMessage.byteLength;

    // Pad with zeros
    const finalMessage = paddedMessage.padRight(0, MAX_MSG_LENGTH);
    return [finalMessage, byteLength];
  }

  private pubkey(): string[] {
    return CircomBigInt.fromBase64(this.jwkModulus).serialize();
  }

  private signature(): string[] {
    return CircomBigInt.fromBase64(this.rawSignature()).serialize();
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
    const rawJson = ByteVector.fromBase64String(this.rawPayload()).toAsciiStr();
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
    return ByteVector.fromAsciiString(value)
      .padRight(0, maxLength)
      .toCircomByteArray();
  }

  private buildCircomStringLength(value: string): string {
    return ByteVector.fromAsciiString(value).byteLength.toString();
  }

  private findSubstringIndexForPayload(value: string): string {
    const rawJson = ByteVector.fromBase64String(this.rawPayload()).toAsciiStr();
    const valueIndex = rawJson.indexOf(value);
    if (valueIndex === -1) {
      throw new Error(`Missing ${value} inside JWT payload`);
    }
    return valueIndex.toString();
  }
}
