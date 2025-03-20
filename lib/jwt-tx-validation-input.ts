import type { Hex } from "./byte-vector.js";
import { CircomBigInt } from "./circom-big-int.js";
import { AUD_MAX_LENGTH, ISS_MAX_LENGTH, MAX_B64_NONCE_LENGTH, MAX_MSG_LENGTH } from "./constants.js";
import { ByteVector, OidcDigest } from "./index.js";
import { JWT } from "./jwt.js";
import type { CircuitInput } from "./types.js";

export type JwtTxValidationData = {
  message: string[];
  messageLength: string;
  pubkey: string[];
  signature: string[];
  periodIndex: string;
  nonceKeyStartIndex: string;
  nonceLength: string;
  issKeyStartIndex: string;
  issLength: string;
  expectedIss: string[];
  audKeyStartIndex: string;
  audLength: string;
  expectedAud: string[];
  subKeyStartIndex: string;
  subLength: string;
  salt: string;
  oidcDigest: string;
  nonceContentHash: string[];
  blindingFactor: string;
};

export class JwtTxValidationInputs implements CircuitInput {
  private jwt: JWT;
  private jwkModulus: string;
  private salt: Hex;
  private rawNonceContentHash: Hex;
  private blinding: bigint;

  constructor(rawJWT: string, jwkModulus: string, salt: Hex, nonceContentHash: Hex, blinding: bigint) {
    this.jwt = new JWT(rawJWT);
    this.jwkModulus = jwkModulus;
    this.salt = salt;
    this.rawNonceContentHash = nonceContentHash;
    this.blinding = blinding;
  }

  toObject(): JwtTxValidationData {
    const periodIndex = this.jwt.raw.indexOf(".");
    const [messagePadded, messagePaddedLen] = this.message();

    return {
      message: messagePadded.toCircomByteArray(),
      messageLength: messagePaddedLen.toString(),
      pubkey: this.pubkey(),
      signature: this.signature(),
      periodIndex: periodIndex.toString(),
      nonceKeyStartIndex: this.nonceKeyStartIndex(),
      nonceLength: this.nonceLength(),
      issKeyStartIndex: this.issKeyStartIndex(),
      issLength: this.issLength(),
      expectedIss: this.expectedIss(),
      audKeyStartIndex: this.audKeyStartIndex(),
      audLength: this.audLength(),
      expectedAud: this.expectedAud(),
      subKeyStartIndex: this.subKeyStartIndex(),
      subLength: this.subLength(),
      salt: this.salt.toString(),
      oidcDigest: this.oidcDigest(),
      nonceContentHash: this.serializeNonceContentHash(),
      blindingFactor: this.blinding.toString(),
    };
  }

  private serializeNonceContentHash(): string[] {
    return ByteVector.fromHex(this.rawNonceContentHash).toFieldArray().map((n) => n.toString());
  }

  private oidcDigest(): string {
    const digest = new OidcDigest(this.jwt.iss, this.jwt.aud, this.jwt.sub, this.salt);
    return digest.serialize();
  }

  private message(): [ByteVector, number] {
    const msg = ByteVector.fromAsciiString(this.jwt.message());
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
    return CircomBigInt.fromBase64(this.jwt.signature).serialize();
  }

  // nonce

  private nonceKeyStartIndex(): string {
    return this.findSubstringIndexForPayload("\"nonce\":");
  }

  private nonceLength(): string {
    const length = this.buildCircomStringLength(this.jwt.nonce);
    if (Number(length) > MAX_B64_NONCE_LENGTH) {
      throw new Error("Nonce too long");
    }
    return length;
  }

  // iss

  private issKeyStartIndex() {
    return this.findSubstringIndexForPayload("\"iss\":");
  }

  private issLength(): string {
    return this.buildCircomStringLength(this.jwt.iss);
  }

  private expectedIss(): string[] {
    return this.buildCircomExpectedValue(this.jwt.iss, ISS_MAX_LENGTH);
  }

  // aud

  private audKeyStartIndex(): string {
    return this.findSubstringIndexForPayload("\"aud\":");
  }

  private audLength(): string {
    return this.buildCircomStringLength(this.jwt.aud);
  }

  private expectedAud(): string[] {
    return this.buildCircomExpectedValue(this.jwt.aud, AUD_MAX_LENGTH);
  }

  // sub

  private subKeyStartIndex(): string {
    return this.findSubstringIndexForPayload("\"sub\":");
  }

  private subLength(): string {
    return this.buildCircomStringLength(this.jwt.sub);
  }

  // Helpers
  private buildCircomExpectedValue(value: string, maxLength: number): string[] {
    return ByteVector.fromAsciiString(value)
      .padRight(0, maxLength)
      .toCircomByteArray();
  }

  private buildCircomStringLength(value: string): string {
    return ByteVector.fromAsciiString(value).byteLength.toString();
  }

  private findSubstringIndexForPayload(value: string): string {
    const rawJson = ByteVector.fromBase64UrlString(this.jwt.payload).toAsciiStr();
    const valueIndex = rawJson.indexOf(value);
    if (valueIndex === -1) {
      throw new Error(`Missing ${value} inside JWT payload`);
    }
    return valueIndex.toString();
  }
}
