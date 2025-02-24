import { AUD_MAX_LENGTH, ISS_MAX_LENGTH, SUB_MAX_LENGTH } from "../../lib/constants.js";
import { ByteVector, OidcDigest } from "../../lib/index.js";
import type { CircuitInput } from "../../lib/types.js";

type PoseidonTestInput = {
  expectedIss: string[];
  expectedAud: string[];
  expectedSub: string[];
  salt: string;
  oidcDigest: string;
};

export class PoseidonTest implements CircuitInput {
  toObject(): PoseidonTestInput {
    const rawIss = "google.com";
    const expectedIss = ByteVector.fromAsciiString(rawIss)
      .padRight(0, ISS_MAX_LENGTH)
      .toCircomByteArray();
    const rawAud = "866068535821-e9em0h73pee93q4evoajtnnkldsjhqdk.apps.googleusercontent.com";
    // const rawAud = "aa";
    const expectedAud = ByteVector
      .fromAsciiString(rawAud)
      .padRight(0, AUD_MAX_LENGTH)
      .toCircomByteArray();
    const rawSub = "010203101";
    const expectedSub = ByteVector
      .fromAsciiString(rawSub)
      .padRight(0, SUB_MAX_LENGTH)
      .toCircomByteArray();

    const salt = new ByteVector([1]);

    return {
      expectedIss,
      expectedAud,
      expectedSub,
      salt: salt.toBigInt().toString(),
      oidcDigest: new OidcDigest(rawIss, rawAud, rawSub, salt).serialize(),
    };
  }
}
