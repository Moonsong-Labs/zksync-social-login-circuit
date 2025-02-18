import { poseidon7 } from "poseidon-lite";

import { ByteVector } from "./byte-vector.js";
import { AUD_MAX_LENGTH, MAX_ISS_LENGTH, SUB_MAX_LENGTH } from "./constants.js";

export class OidcDigest {
  private iss: string;
  private aud: string;
  private sub: string;
  private salt: ByteVector;

  constructor(iss: string, aud: string, sub: string, salt: ByteVector) {
    this.iss = iss;
    this.aud = aud;
    this.sub = sub;
    this.salt = salt;
  }

  serialize(): string {
    return this.toBigInt().toString();
  }

  toBigInt(): bigint {
    const sub = ByteVector.fromAsciiString(this.sub).padRight(0, SUB_MAX_LENGTH).toFieldArray(); // 1 Field
    const aud = ByteVector.fromAsciiString(this.aud).padRight(0, AUD_MAX_LENGTH).toFieldArray(); // 4 Fields
    const iss = ByteVector.fromAsciiString(this.iss).padRight(0, MAX_ISS_LENGTH).toFieldArray(); // 1 Field
    const salt = this.salt.toBigInt(); // 1 Field

    return poseidon7([...sub, ...aud, ...iss, salt]);
  }
}
