pragma circom 2.2.0;

include "@zk-email/circuits/lib/base64.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/poseidon.circom";
include "../utils/verify-nonce.circom";

template BlindingFactor(maxNonceLengthBase64) {
  signal input b64Nonce[maxNonceLengthBase64];
  signal input blindingFactor;
  signal input txHash[2];

  VerifyNonce()(b64Nonce, blindingFactor, txHash);
}

component main = BlindingFactor(44);
