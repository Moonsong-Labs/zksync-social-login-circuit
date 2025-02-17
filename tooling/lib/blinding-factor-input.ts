import { MAX_B64_NONCE_LENGTH } from "../../lib/constants.js";
import { createNonce } from "../../lib/create-nonce.js";
import { ByteVector } from "../../lib/index.js";
import type { CircuitInput } from "../../lib/types.js";

type BlindingFactorInputData = {
  b64Nonce: string[];
  blindingFactor: string;
  txHash: string[];
};

export class BlindingFactorInputTest implements CircuitInput<BlindingFactorInputData> {
  private blindingFactor: bigint;
  private txHash: string;
  constructor(_rawJWT: string, _jwkModulus: string, _salt: bigint, txHash: string, blinding: bigint) {
    this.txHash = txHash;
    this.blindingFactor = blinding;
  }

  toObject(): BlindingFactorInputData {
    const nonce = createNonce(this.txHash, this.blindingFactor);
    const txHash = ByteVector.fromHex(this.txHash);

    // const b64Nonce = ByteVector.fromAsciiString(nonce).padRight("=".charCodeAt(0), 44).toCircomByteArray();

    const b64Nonce = ByteVector.fromAsciiString(nonce).padRight(0, MAX_B64_NONCE_LENGTH).toCircomByteArray();

    return {
      b64Nonce: b64Nonce,
      blindingFactor: this.blindingFactor.toString(),
      txHash: txHash.toFieldArray().map((n) => n.toString()),
    };
  }
}
