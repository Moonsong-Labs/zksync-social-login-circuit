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
/// @param maxMessageByteLength Maximum JWT byte length (must be multiple of 64 for SHA256)
/// @param maxB64PayloadLength Maximum Base64 payload length (must be multiple of 4)
/// @input messageBytes[maxMessageByteLength] JWT string (header.payload) with sha256 pad
/// @input messageByteLength Real length in bytes for `messageBytes`.
/// @input rsaModulusChunks Rsa pub key modulus expressed in k chunks of n bits each.
/// @input signatureChunks Rsa signature expressed in k chunks of n bits each.
/// @input periodIndex The format of the message is `<headers>.<payload`. This is the index of the dot in the middle.
template JwtVerify (
  n,
  k,
  maxMessageByteLength,
  maxB64PayloadLength
) {
  signal input messageBytes[maxMessageByteLength]; // JWT message in plain ascii (header + payload)
  signal input messageByteLength; // Length of the message signed in the JWT measured in bytes characters
  signal input rsaModulusChunks[k]; // RSA public key split into k chunks
  signal input signatureChunks[k]; // RSA signature split into k chunks
  signal input periodIndex; // Index of the period in the JWT message

  var maxPayloadLength = (maxB64PayloadLength * 3) \ 4;
  signal output payload[maxPayloadLength];

  // Assert message length fits in ceil(log2(maxMessageByteLength)) bits
  component n2bMessageLength = Num2Bits(log2Ceil(maxMessageByteLength));
  n2bMessageLength.in <== messageByteLength;

  // Assert message data after messageLength are zeros
  AssertZeroPadding(maxMessageByteLength)(messageBytes, messageByteLength);

  // Calculate SHA256 hash of the JWT message
  signal shaBits[256] <== Sha256Bytes(maxMessageByteLength)(messageBytes, messageByteLength);

  // Pack SHA output bytes to int[] for RSA input message
  var rsaMessageSizeChunks = (256 + n) \ n; // Adjust based on RSA chunk size
  component rsaMessage[rsaMessageSizeChunks];
  for (var i = 0; i < rsaMessageSizeChunks; i++) {
    rsaMessage[i] = Bits2Num(n);
  }
  for (var i = 0; i < 256; i++) {
    rsaMessage[i \ n].in[i % n] <== shaBits[255 - i];
  }
  for (var i = 256; i < n * rsaMessageSizeChunks; i++) {
    rsaMessage[i \ n].in[i % n] <== 0;
  }

  // Verify RSA signature
  component rsaVerifier = RSAVerifier65537(n, k);
  for (var i = 0; i < rsaMessageSizeChunks; i++) {
    rsaVerifier.message[i] <== rsaMessage[i].out;
  }
  for (var i = rsaMessageSizeChunks; i < k; i++) {
    rsaVerifier.message[i] <== 0;
  }
  rsaVerifier.modulus <== rsaModulusChunks;
  rsaVerifier.signature <== signatureChunks;

  // Assert that period exists at periodIndex
  signal period <== ItemAtIndex(maxMessageByteLength)(messageBytes, periodIndex);
  period === 46;

  // Find the real message length
  signal realMessageLength <== FindRealMessageLengthInBytes(maxMessageByteLength)(messageBytes);

  // Assert that period is unique
  signal periodCount <== CountCharOccurrencesUpTo(maxMessageByteLength)(messageBytes, realMessageLength, ASCII_DOT());
  periodCount === 1;

  signal b64HeaderLength <== periodIndex;
  signal b64PayloadLength <== realMessageLength - b64HeaderLength - 1;
  signal b64Payload[maxB64PayloadLength] <== SelectSubArrayBase64(maxMessageByteLength, maxB64PayloadLength)(messageBytes, b64HeaderLength + 1, b64PayloadLength);

  payload <== Base64Decode(maxPayloadLength)(b64Payload);
}
