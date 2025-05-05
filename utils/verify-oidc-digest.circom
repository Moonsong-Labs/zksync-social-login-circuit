pragma circom 2.2.0;

include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/poseidon.circom";

/// @title VerifyOidcDigest
/// @notice Recalculates oidc_digest and checks that it matches the one provided.
/// @dev Takes the values of iss, aud and sub extracted from valid JWT. Salt is provided by user.
///      It recreates oidc_digest ( Poseidon(iss || aud || sub || salt) ) and then ensures matches
///      with provided one.
/// @param maxIssAsciiLength Max length in characters for iss.
/// @param maxAudAsciiLength Max length in characters for aud.
/// @param maxSubAsciiLength Max length in characters for sub.
/// @input issAscii[maxIssAsciiLength] value for iss extracted from jwt.
/// @input audAscii[maxAudAsciiLength] value for aud extracted from jwt.
/// @input subAscii[maxSubAsciiLength] value for sub extracted from jwt.
/// @input salt salt used to anonymize the result.
/// @input expectedDigest Expected value for oidc_digest. This value is built by the user
///        when the proof is generated, and then reconstructed by the smart contract when the proof
///        is verified.
template VerifyOidcDigest(
  maxIssAsciiLength,
  maxAudAsciiLength,
  maxSubAsciiLength
) {
  signal input issAscii[maxIssAsciiLength];
  signal input audAscii[maxAudAsciiLength];
  signal input subAscii[maxSubAsciiLength];
  signal input salt;
  signal input expectedDigest;

  var issFieldLength = computeIntChunkLength(maxIssAsciiLength);
  var audFieldLength = computeIntChunkLength(maxAudAsciiLength);
  var subFieldLength = computeIntChunkLength(maxSubAsciiLength);

  // These values are spread across the rest of the components. That's
  // Why we assert the precise value.
  assert(issFieldLength == 1);
  assert(audFieldLength == 4);
  assert(subFieldLength == 1);

  signal packedIss[issFieldLength] <== PackBytes(maxIssAsciiLength)(issAscii);
  signal packedAud[audFieldLength] <== PackBytes(maxAudAsciiLength)(audAscii);
  signal packedSub[subFieldLength] <== PackBytes(maxSubAsciiLength)(subAscii);

  signal calculatedDigest <== Poseidon(7)([
    packedIss[0],
    packedAud[0],
    packedAud[1],
    packedAud[2],
    packedAud[3],
    packedSub[0],
    salt
  ]);

  calculatedDigest === expectedDigest;
}
