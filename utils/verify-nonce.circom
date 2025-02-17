pragma circom 2.2.0;

include "@zk-email/circuits/lib/base64.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/poseidon.circom";
include "./bytes-to-field.circom";
include "circomlib/circuits/comparators.circom";

function MAX_NONCE_BASE64_LENGTH() {
  return 44;
}

function MAX_LENGTH_DECODED_NONCE() {
  return (MAX_NONCE_BASE64_LENGTH() * 3) \ 4;
}

function MAX_BYTES_FIELD() {
  return 32;
}

template ReplaceAll(n) {
  signal input in[n];
  signal input from;
  signal input to;
  signal output out[n];

  signal parts[n][2];

  component equals[n];
  for (var i = 0; i < n; i++) {
    equals[i] = IsZero();
    equals[i].in <== in[i] - from;
    parts[i][0] <== equals[i].out * to;
    parts[i][1] <== (1 - equals[i].out) * in[i];
  }

  for (var i = 0; i < n; i++) {
    out[i] <== parts[i][0] + parts[i][1];
  }
}


template VerifyNonce() {
  var maxNonceB64Length = MAX_NONCE_BASE64_LENGTH();
  signal input b64UrlNonce[maxNonceB64Length];
  signal input blindingFactor;
  signal input txHash[2];

  signal b64NoncePartial[maxNonceB64Length] <== ReplaceAll(maxNonceB64Length)(b64UrlNonce, 45, 43);
  signal b64NoncePartial2[maxNonceB64Length] <== ReplaceAll(maxNonceB64Length)(b64NoncePartial, 0, 61);
  signal b64Nonce[maxNonceB64Length] <== ReplaceAll(maxNonceB64Length)(b64NoncePartial2, 95, 47);

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
