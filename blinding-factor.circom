pragma circom 2.2.0;

include "@zk-email/circuits/lib/base64.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/poseidon.circom";
include "./utils/bytes-to-field.circom";


template BlindingFactor(maxNonceLengthBase64) {
  signal input b64Nonce[maxNonceLengthBase64];
  signal input blindingFactor;
  signal input txHash[2];

  var maxNonceLength = (maxNonceLengthBase64 * 3) \ 4;

  signal nonce[maxNonceLength] <== Base64Decode(maxNonceLength)(b64Nonce);

  nonce[32] === 0;
  component bytesToField = BytesToField(32);

  for (var i = 0; i < 32; i++) {
    bytesToField.inputs[i] <== nonce[i];
  }

  signal packedNonce <== bytesToField.out;
  signal recalculatedHash <== Poseidon(3)([txHash[0], txHash[1], blindingFactor]);
  recalculatedHash === packedNonce;
}

component main = BlindingFactor(44);
