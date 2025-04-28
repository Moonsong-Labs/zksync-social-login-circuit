pragma circom 2.2.0;

include "@zk-email/circuits/lib/base64.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/poseidon.circom";
include "./bytes-to-field.circom";
include "./base64url-to-base64.circom";
include "./constants.circom";

function lengthAfterDecodeBase64(maxB64Length) {
  return (maxB64Length * 3) \ 4;
}


/// @title VerifyNonce
/// @notice Verify content of nonce. Interpret nonce as base64url encoded blob. Check that matches Poseidon(sender_hash || blinding_factor)
/// @dev This template ensures the content of the nonce is the expected one.
///      Our nonce is always 44 characters long. That's why the length of the nonce is not a parameter.
///      It works by:
///      1. Converting base64url to base64.
///      2. Decode base64.
///      3. Calculate expected value (Poseidon(sender_hash || blinding_factor))
///      4. Ensures decoded nonce matches calculated hash
///      The sender hash is calculated as keccak256(abi.encode(auxAddress, targetAddress, newPasskeyHash, recoverNonce, timeLimit))
/// @dev This template assumes that base64url encoded nonce is padded using `=`. A nonce padded using `\0` will fail.
/// @input b64UrlNonce[44] the nonce encoded as base64url.
/// @input blindingFactor Factor used to prevent Google from identifying user's transactions.
/// @input content[2] The content of the jwt nonce are 32 bytes, which are encoded like this:
///        - content[0] contains the first 31 bytes of the content starting from the left interpreted as a single field.
///        - content[1] it's the last byte of the content starting from the left.
template VerifyNonce() {
  // Useful constants
  var maxNonceB64Length = MAX_NONCE_BASE64_LENGTH();
  var bytesInAField = MAX_BYTES_FIELD();
  var maxNonceLength = lengthAfterDecodeBase64(maxNonceB64Length);

  // Inputs
  signal input b64UrlNonce[maxNonceB64Length];
  signal input blindingFactor;
  signal input content[2];

  // Translate from base64Url to base64.
  signal b64Nonce[maxNonceB64Length] <== Base64UrlToBase64(maxNonceB64Length)(b64UrlNonce);

  // Decode base64
  signal nonceBytes[maxNonceLength] <== Base64Decode(maxNonceLength)(b64Nonce);

  // The nonce is expected to include one field. But because it's encoded as base 64, the closest
  // size that can fit a field is 44 characters. This means that there is always extra padding
  // at the end, this padding has to be zero.
  for (var i = bytesInAField; i < maxNonceLength; i++) {
    nonceBytes[i] === 0;
  }

  // Pack nonce into Fields to compare with hash.
  component bytesToField = BytesToFieldBE(bytesInAField);
  for (var i = 0; i < bytesInAField; i++) {
    bytesToField.bytes[i] <== nonceBytes[i];
  }
  // Ensure there was no overflow during conversion
  bytesToField.overflow === 0;
  signal packedNonce <== bytesToField.out;

  // Calculate hash tx_hash and blindingFactor.
  signal recalculatedHash <== Poseidon(3)([content[0], content[1], blindingFactor]);

  // Ensure nonce value is the expected one.
  recalculatedHash === packedNonce;
}
