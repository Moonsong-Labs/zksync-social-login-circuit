pragma circom 2.2.0;

include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/poseidon.circom";

/// @title VerifyOidcDigest
/// @notice Recalculate oidc_digest and checks matches with provided one.
/// @dev Takes the values of iss, aud and sub extracted from valid JWT. Salt is provided by user.
///      It recreates oidc_digest ( Poseidon(iss || aud || sub || salt) ) and then ensures matches
///      with provided one.
/// @param maxIssLength Max length if characters for iss.
/// @param maxAudLength Max length if characters for aud.
/// @param maxSubLength Max length if characters for sub.
/// @input iss[maxIssLength] value for iss extracted from jwt.
/// @input aud[maxAudLength] value for aud extracted from jwt.
/// @input sub[maxSubLength] value for sub extracted from jwt.
/// @input salt salt used to anonymize the result.
/// @input expectedDigest Expected value for oidc_digest. This value is built by the user
///        when the proof is generated, and then reconstructed by the smart contract when the proof
///        is verified.
template VerifyOidcDigest(
  maxIssLength,
  maxAudLength,
  maxSubLength
) {
  signal input iss[maxIssLength];
  signal input aud[maxAudLength];
  signal input sub[maxSubLength];
  signal input salt;
  signal input expectedDigest;

  var issFieldLength = computeIntChunkLength(maxIssLength);
  var audFieldLength = computeIntChunkLength(maxAudLength);
  var subFieldLength = computeIntChunkLength(maxSubLength);

  // These values are spread across the rest of the components. That's
  // Why we assert the precise value.
  assert(issFieldLength == 1);
  assert(audFieldLength == 4);
  assert(subFieldLength == 1);

  signal packedIss[issFieldLength] <== PackBytes(maxIssLength)(iss);
  signal packedAud[audFieldLength] <== PackBytes(maxAudLength)(aud);
  signal packedSub[subFieldLength] <== PackBytes(maxSubLength)(sub);

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
