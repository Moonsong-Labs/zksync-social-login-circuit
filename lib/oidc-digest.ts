import { poseidon7 } from "poseidon-lite";

import { ByteVector, type Hex } from "./byte-vector.js";
import { AUD_MAX_LENGTH, ISS_MAX_LENGTH, SUB_MAX_LENGTH } from "./constants.js";

export class OidcDigest {
  private iss: string;
  private aud: string;
  private sub: string;
  public salt: ByteVector;

  constructor(iss: string, aud: string, sub: string, salt: string) {
    this.iss = iss;
    this.aud = aud;
    this.sub = sub;
    this.salt = ByteVector.fromHex(salt);
  }

  serialize(): string {
    return this.toBigInt().toString();
  }

  toHex(): Hex {
    return ByteVector.fromBigInt(this.toBigInt()).toHex();
  }

  toBigInt(): bigint {
    const iss = ByteVector.fromAsciiString(this.iss).padRight(0, ISS_MAX_LENGTH).toFieldArray(); // 1 Field
    const aud = ByteVector.fromAsciiString(this.aud).padRight(0, AUD_MAX_LENGTH).toFieldArray(); // 4 Fields
    const sub = ByteVector.fromAsciiString(this.sub).padRight(0, SUB_MAX_LENGTH).toFieldArray(); // 1 Field
    const salt = this.salt.toBigInt(); // 1 Field

    return poseidon7([...iss, ...aud, ...sub, salt]);
  }
}
