pragma circom 2.2.0;

include "@zk-email/circuits/lib/base64.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/poseidon.circom";
include "./bytes-to-field.circom";
include "./base64url-to-base64.circom";

function MAX_NONCE_BASE64_LENGTH() {
  return 44;
}

function MAX_LENGTH_DECODED_NONCE() {
  return (MAX_NONCE_BASE64_LENGTH() * 3) \ 4;
}

function MAX_BYTES_FIELD() {
  return 32;
}

/// @title VerifyNonce
/// @notice Verify content of nonce. Interpret nonce as base64url encoded blob. Check that matches Poseidon(tx_hash || blinding_factor)
/// @dev This template ensures the content of the nonce is the expected one.
///      Our nonce are always 44 characters long. That's why the length of the nonce is not a parameter.
///      It works by:
///      1. Converting base64url to base64.
///      2. Decide base64.
///      3. Calculate expected value (Poseidon(tx_hash || blinding_factor))
///      4. Ensures decoded nonce matches calculated hash
/// @input b64UrlNonce[44] the nonce encoded as base64url.
/// @input blindingFactor Factor used to prevent google to identify user's transactions.
/// @input txHash[2] Hash of the current transaction. It's encoded as 2 Fields because it's 32 bytes long (each Field is 31)
template VerifyNonce() {
  var maxNonceB64Length = MAX_NONCE_BASE64_LENGTH();
  signal input b64UrlNonce[maxNonceB64Length];
  signal input blindingFactor;
  signal input txHash[2];

  // Translate from base64Url to base64.
  signal b64Nonce[maxNonceB64Length] <== Base64UrlToBase64(maxNonceB64Length)(b64UrlNonce);

  var maxNonceLength = MAX_LENGTH_DECODED_NONCE();
  assert(maxNonceLength == 33);

  // Decode base64
  signal nonce[maxNonceLength] <== Base64Decode(maxNonceLength)(b64Nonce);

  // The result of the hash is always 32 bytes long. Last byte it's always going to be 0.
  nonce[32] === 0;

  // Pack nonce into Fields to compare with hash.
  component bytesToField = BytesToField(MAX_BYTES_FIELD());
  for (var i = 0; i < 32; i++) {
    bytesToField.inputs[i] <== nonce[i];
  }
  signal packedNonce <== bytesToField.out;

  // Calculate hash tx_hash and blindingFactor.
  signal recalculatedHash <== Poseidon(3)([txHash[0], txHash[1], blindingFactor]);

  // Ensure nonce value is the expected one.
  recalculatedHash === packedNonce;
}
