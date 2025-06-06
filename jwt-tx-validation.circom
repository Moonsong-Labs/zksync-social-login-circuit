pragma circom 2.1.6;

include "./utils/fields.circom";
include "./utils/jwt-verify.circom";
include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/poseidon.circom";
include "./utils/jwt-data.circom";
include "./utils/verify-oidc-digest.circom";
include "./utils/verify-nonce.circom";

/// @title JwtTxValidation
/// @notice Verifies JWT signatures and extracts header/payload components
/// @dev This template verifies RSA-SHA256 signed JWTs and decodes Base64 encoded components.
///      It works by:
///      1. Verifying message length and padding
///      2. Computing SHA256 hash of `header.payload`
///      3. Verifying RSA signature against public key
///      4. Extracting and decoding Base64 header/payload
///      5. Computing public key hash for external reference
/// @param n RSA chunk size in bits (n < 127 for field arithmetic)
/// @param k Number of RSA chunks (n*k > 2048 for RSA-2048)
/// @param maxMessageByteLength Maximum raw JWT string length (This is header.payload,
///        where both are base64url encoded) (must be multiple of 64 for SHA256)
/// @param maxB64PayloadLength Maximum Base64 payload length (must be multiple of 4)
/// @param maxNonceAsciiLength
/// @param maxIssAsciiLength
/// @param maxAudAsciiLength
/// @param maxSubAsciiLength
/// @input messageBytes[maxMessageByteLength] JWT string (header.payload) with sha256 pad
/// @input messageByteLength Actual length of JWT string
/// @input rsaModulusChunks[k] RSA public key modulus in k chunks of n bits
/// @input signatureChunks[k] RSA signature in k chunks
/// @input periodIndex Location of period separating header.payload
/// @input issKeyStartIndex Index for '"iss":' substring in payload
/// @input issAsciiLength Length of the iss counted as ascii characters
/// @input audKeyStartIndex Index for '"aud":' substring in payload
/// @input audAsciiLength Length of the aud counted as ascii characters
/// @input subKeyStartIndex Index for '"sub":' substring in payload
/// @input subAsciiLength Length of the sub counted as ascii characters
/// @input salt Salt used to generate oidcDigest
/// @input oidcDigest Result of doing Poseidon(iss, aud, sub, salt)
///        The circuit recalculates this value and checks that the provided
///        one is correct.
/// @input nonceKeyStartIndex Index for '"nonce":' substring in payload
/// @input nonceAsciiLength Length of the nonce counted as ascii characters
/// @input nonceContentHash Value expected for nonce hash.
///        Even when this circuit works with any 44 charecter base64url nonce, it's
///        meant to be used wit a nonce calculated as `Poseidon3(sender_hash[0..31], sender_hash.subarray[31..32], blinding_factor)`
///        where sender_hash is calculated as `keccak256(abi.encode(auxAddress, targetAddress, newPasskeyHash, recoverNonce, timeLimit))`

template JwtTxValidation(
  n,
  k,
  maxMessageByteLength,
  maxB64PayloadLength,
  maxNonceAsciiLength,
  maxIssAsciiLength,
  maxAudAsciiLength,
  maxSubAsciiLength
) {
  assert(n*k >= 2048); // n*k has to fit a 2048 bit public key.
  assert(n < 127); // Each field needs enough room to fit carry on during big int operations.
  assert(maxMessageByteLength % 64 == 0); // message it's already sha256 padded. That means it has to be a multiple of 512 bits (64 bytes).
  assert(maxB64PayloadLength % 4 == 0); // Because it's b64 encoded.

  signal input messageBytes[maxMessageByteLength]; // JWT message (header + payload)
  signal input messageByteLength; // Length of the message signed in the JWT
  signal input rsaModulusChunks[k]; // RSA public key modulus split into k chunks
  signal input signatureChunks[k]; // RSA signature split into k chunks
  signal input periodIndex; // Index of the period in the JWT message

  signal input issKeyStartIndex; // Index for '"iss":' substring in payload
  signal input issAsciiLength; // Real length for iss value.

  signal input audKeyStartIndex; // Index for '"aud":' substring in payload
  signal input audAsciiLength; // Real length for aud value.

  signal input subKeyStartIndex; // Index for '"sub":' substring in payload
  signal input subAsciiLength; // Real length for sub value.

  signal input salt; // Salt used to generate oidcDigest
  signal input oidcDigest; // Poseidon(iss, aud, sub, salt)

  signal input nonceKeyStartIndex; // Index for '"nonce":' substring in payload
  signal input nonceAsciiLength; // Length for nonce.

  signal input nonceContentHash[2];
  signal input blindingFactor;

  var maxPayloadLength = (maxB64PayloadLength * 3) \ 4;

  signal payload[maxPayloadLength];
  signal nonceAscii[maxNonceAsciiLength];
  signal issAscii[maxIssAsciiLength];
  signal audAscii[maxAudAsciiLength];
  signal subAscii[maxSubAsciiLength];

  // Check signature over JWT and extract payload
  payload <== JwtVerify(
    n,
    k,
    maxMessageByteLength,
    maxB64PayloadLength
  )(
    messageBytes,
    messageByteLength,
    rsaModulusChunks,
    signatureChunks,
    periodIndex
  );


  (nonceAscii, issAscii, audAscii, subAscii) <== JwtData(
    maxPayloadLength,
    maxNonceAsciiLength,
    maxIssAsciiLength,
    maxAudAsciiLength,
    maxSubAsciiLength
  )(
    payload,
    nonceKeyStartIndex,
    nonceAsciiLength,
    issKeyStartIndex,
    issAsciiLength,
    audKeyStartIndex,
    audAsciiLength,
    subKeyStartIndex,
    subAsciiLength
  );

  VerifyOidcDigest(
    maxIssAsciiLength,
    maxAudAsciiLength,
    maxSubAsciiLength
  )(
    issAscii,
    audAscii,
    subAscii,
    salt,
    oidcDigest
  );

  VerifyNonce()(nonceAscii, blindingFactor, nonceContentHash);
}

component main{public [rsaModulusChunks, oidcDigest, nonceContentHash]} = JwtTxValidation(
  121,
  17,
  1024,
  1024,
  44,
  31,
  100,
  31
);
