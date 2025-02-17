pragma circom 2.2.0;

include "@zk-email/circuits/lib/base64.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/poseidon.circom";
include "./bytes-to-field.circom";

function MAX_NONCE_BASE64_LENGTH() {
  return 44;
}

function MAX_LENGTH_DECODED_NONCE() {
  return (MAX_NONCE_BASE64_LENGTH() * 3) \ 4;
}

function MAX_BYTES_FIELD() {
  return 32;
}


template VerifyNonce() {
  var maxNonceB64Length = MAX_NONCE_BASE64_LENGTH();
  signal input b64Nonce[maxNonceB64Length];
  signal input blindingFactor;
  signal input txHash[2];

  var maxNonceLength = MAX_LENGTH_DECODED_NONCE();
  assert(maxNonceLength == 33);

  signal nonce[maxNonceLength] <== Base64Decode(maxNonceLength)(b64Nonce);

  nonce[32] === 0;

  component bytesToField = BytesToField(MAX_BYTES_FIELD());
  for (var i = 0; i < 32; i++) {
    bytesToField.inputs[i] <== nonce[i];
  }
  signal packedNonce <== bytesToField.out;

  signal recalculatedHash <== Poseidon(3)([txHash[0], txHash[1], blindingFactor]);
  recalculatedHash === packedNonce;
}
