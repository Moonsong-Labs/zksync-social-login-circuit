import { MAX_B64_NONCE_LENGTH } from "../../lib/constants.js";
import { createNonce } from "../../lib/create-nonce.js";
import { ByteVector } from "../../lib/index.js";
import type { CircuitInput } from "../../lib/types.js";

type BlindingFactorInputData = {
  b64Nonce: string[];
  blindingFactor: string;
  nonceContent: string[];
};

export class BlindingFactorInputTest implements CircuitInput {
  private blindingFactor: bigint;
  private nonceContent: string;
  constructor(_rawJWT: string, _jwkModulus: string, _salt: string, nonceContent: string, blinding: bigint) {
    this.nonceContent = nonceContent;
    this.blindingFactor = blinding;
  }

  toObject(): BlindingFactorInputData {
    const nonce = createNonce(this.nonceContent, this.blindingFactor);
    const nonceContent = ByteVector.fromHex(this.nonceContent);

    const b64Nonce = ByteVector.fromAsciiString(nonce).padRight(0, MAX_B64_NONCE_LENGTH).toCircomByteArray();

    return {
      b64Nonce: b64Nonce,
      blindingFactor: this.blindingFactor.toString(),
      nonceContent: nonceContent.toFieldArray().map((n) => n.toString()),
    };
  }
}
