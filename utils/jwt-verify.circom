/**
 * Based on @zkemail original code.
 * source: https://github.com/zkemail/jwt-tx-builder/blob/e5d79009fc5d00b97fcdcdeec697e1b9689a46b2/packages/circuits/jwt-verifier.circom
 */
pragma circom 2.2.0;

include "circomlib/circuits/bitify.circom";
include "@zk-email/circuits/utils/array.circom";
include "@zk-email/circuits/utils/hash.circom";
include "@zk-email/circuits/lib/sha.circom";
include "@zk-email/circuits/lib/rsa.circom";
include "@zk-email/circuits/lib/base64.circom";
include "./bytes.circom";
include "./array.circom";

function ASCII_DOT() {
  return 46;
}

/// @title JwtVerify
/// @notice Verifies JWT signatures and extracts payload
/// @dev This template verifies RSA-SHA256 signed JWTs and decodes Base64 encoded components.
///      It works by:
///      1. Verifying message length and padding
///      2. Computing SHA256 hash of `<header>.<payload>`
///      3. Verifying RSA signature against public key
///      4. Extracting and decoding Base64 payload
/// @param n RSA chunk size in bits (n < 127 for field arithmetic)
/// @param k Number of RSA chunks (n*k > 2048 for RSA-2048)
/// @param maxMessageLength Maximum JWT byte length (must be multiple of 64 for SHA256)
/// @param maxB64PayloadLength Maximum Base64 payload length (must be multiple of 4)
template JwtVerify (
  n,
  k,
  maxMessageLength,
  maxB64PayloadLength
) {
  signal input message[maxMessageLength]; // JWT message (header + payload)
  signal input messageLength; // Length of the message signed in the JWT
  signal input pubkey[k]; // RSA public key split into k chunks
  signal input signature[k]; // RSA signature split into k chunks
  signal input periodIndex; // Index of the period in the JWT message

  var maxPayloadLength = (maxB64PayloadLength * 3) \ 4;
  signal output payload[maxPayloadLength];

  // Assert message length fits in ceil(log2(maxMessageLength))
  component n2bMessageLength = Num2Bits(log2Ceil(maxMessageLength));
  n2bMessageLength.in <== messageLength;

  // Assert message data after messageLength are zeros
  AssertZeroPadding(maxMessageLength)(message, messageLength);

  // Calculate SHA256 hash of the JWT message
  signal sha[256] <== Sha256Bytes(maxMessageLength)(message, messageLength);

  // Pack SHA output bytes to int[] for RSA input message
  var rsaMessageSize = (256 + n) \ n; // Adjust based on RSA chunk size
  component rsaMessage[rsaMessageSize];
  for (var i = 0; i < rsaMessageSize; i++) {
    rsaMessage[i] = Bits2Num(n);
  }
  for (var i = 0; i < 256; i++) {
    rsaMessage[i \ n].in[i % n] <== sha[255 - i];
  }
  for (var i = 256; i < n * rsaMessageSize; i++) {
    rsaMessage[i \ n].in[i % n] <== 0;
  }

  // Verify RSA signature
  component rsaVerifier = RSAVerifier65537(n, k);
  for (var i = 0; i < rsaMessageSize; i++) {
    rsaVerifier.message[i] <== rsaMessage[i].out;
  }
  for (var i = rsaMessageSize; i < k; i++) {
    rsaVerifier.message[i] <== 0;
  }
  rsaVerifier.modulus <== pubkey;
  rsaVerifier.signature <== signature;

  // Assert that period exists at periodIndex
  signal period <== ItemAtIndex(maxMessageLength)(message, periodIndex);
  period === 46;

  // Find the real message length
  signal realMessageLength <== FindRealMessageLength(maxMessageLength)(message);

  // Assert that period is unique
  signal periodCount <== CountCharOccurrencesUpTo(maxMessageLength)(message, realMessageLength, ASCII_DOT());
  periodCount === 1;

  signal b64HeaderLength <== periodIndex;
  signal b64PayloadLength <== realMessageLength - b64HeaderLength - 1;
  signal b64Payload[maxB64PayloadLength] <== SelectSubArrayBase64(maxMessageLength, maxB64PayloadLength)(message, b64HeaderLength + 1, b64PayloadLength);

  payload <== Base64Decode(maxPayloadLength)(b64Payload);
}
