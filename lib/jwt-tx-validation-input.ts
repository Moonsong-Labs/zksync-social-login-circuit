import type { Hex } from "./byte-vector.js";
import { CircomBigInt } from "./circom-big-int.js";
import { FIELD_BYTES, MAX_B64_NONCE_LENGTH, MAX_MSG_LENGTH } from "./constants.js";
import { ByteVector, OidcDigest } from "./index.js";
import { JWT } from "./jwt.js";
import type { CircuitInput } from "./types.js";

export type JwtTxValidationData = {
  messageBytes: string[];
  messageByteLength: string;
  rsaModulusChunks: string[];
  signatureChunks: string[];
  periodIndex: string;
  nonceKeyStartIndex: string;
  nonceAsciiLength: string;
  issKeyStartIndex: string;
  issAsciiLength: string;
  audKeyStartIndex: string;
  audAsciiLength: string;
  subKeyStartIndex: string;
  subAsciiLength: string;
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
      messageBytes: messagePadded.toCircomByteArray(),
      messageByteLength: messagePaddedLen.toString(),
      rsaModulusChunks: this.rsaModulusChunks(),
      signatureChunks: this.signatureChunks(),
      periodIndex: periodIndex.toString(),
      nonceKeyStartIndex: this.nonceKeyStartIndex(),
      nonceAsciiLength: this.nonceAsciiLength(),
      issKeyStartIndex: this.issKeyStartIndex(),
      issAsciiLength: this.issAsciiLength(),
      audKeyStartIndex: this.audKeyStartIndex(),
      audAsciiLength: this.audAsciiLength(),
      subKeyStartIndex: this.subKeyStartIndex(),
      subAsciiLength: this.subAsciiLength(),
      salt: this.salt.toString(),
      oidcDigest: this.oidcDigest(),
      nonceContentHash: this.serializeNonceContentHash(),
      blindingFactor: this.blinding.toString(),
    };
  }

  private serializeNonceContentHash(): string[] {
    return ByteVector.fromHex(this.rawNonceContentHash).toBnChunks(FIELD_BYTES).map((n) => n.toString());
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

  private rsaModulusChunks(): string[] {
    return CircomBigInt.fromBase64(this.jwkModulus).serialize();
  }

  private signatureChunks(): string[] {
    return CircomBigInt.fromBase64(this.jwt.signature).serialize();
  }

  // nonce

  private nonceKeyStartIndex(): string {
    return this.findSubstringIndexForPayload("\"nonce\":");
  }

  private nonceAsciiLength(): string {
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

  private issAsciiLength(): string {
    return this.buildCircomStringLength(this.jwt.iss);
  }

  // aud

  private audKeyStartIndex(): string {
    return this.findSubstringIndexForPayload("\"aud\":");
  }

  private audAsciiLength(): string {
    return this.buildCircomStringLength(this.jwt.aud);
  }

  // sub

  private subKeyStartIndex(): string {
    return this.findSubstringIndexForPayload("\"sub\":");
  }

  private subAsciiLength(): string {
    return this.buildCircomStringLength(this.jwt.sub);
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
