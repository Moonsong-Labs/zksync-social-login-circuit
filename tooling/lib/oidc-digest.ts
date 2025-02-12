import { poseidon4, poseidon9 } from "poseidon-lite";

import { ByteVector } from "./byte-vector.ts";

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
    const iss = this.hashJwtField(this.iss);
    const aud = this.hashJwtField(this.aud);
    const sub = this.hashJwtField(this.sub);

    return poseidon4([iss, aud, sub, this.salt.toBigInt()]);
  }

  private hashJwtField(value: string): bigint {
    const nums = ByteVector.fromAsciiString(value).toFieldArray();

    while (nums.length < 9) {
      nums.push(0n);
    }

    // We use poseidon 9 because the max length for these fields is 255 bytes. That packed
    // into fields makes an array of size 9.
    return poseidon9(nums);
  }
}
