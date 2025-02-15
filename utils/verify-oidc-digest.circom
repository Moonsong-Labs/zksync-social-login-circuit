pragma circom 2.2.0;

include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/poseidon.circom";

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
  assert(issFieldLength == 1);
  assert(audFieldLength == 4);
  assert(subFieldLength == 1);

  signal packedIss[computeIntChunkLength(issFieldLength)] <== PackBytes(maxIssLength)(iss);
  signal packedAud[computeIntChunkLength(maxAudLength)] <== PackBytes(maxAudLength)(aud);
  signal packedSub[computeIntChunkLength(maxSubLength)] <== PackBytes(maxSubLength)(sub);

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
