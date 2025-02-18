pragma circom 2.1.6;

include "@zk-email/circuits/utils/bytes.circom";
include "circomlib/circuits/poseidon.circom";

template PoseidonTest(
    maxIssLength,
    maxAudLength,
    maxSubLength
) {

    signal input expectedIss[maxIssLength]; // Expected value for iss.
    signal input expectedAud[maxAudLength]; // Expected value for aud.
    signal input expectedSub[maxSubLength]; // Expected value for sub.

    signal input salt;
    signal input oidcDigest;

    signal packedIss[computeIntChunkLength(maxIssLength)] <== PackBytes(maxIssLength)(expectedIss);
    signal packedAud[computeIntChunkLength(maxAudLength)] <== PackBytes(maxAudLength)(expectedAud);
    signal packedSub[computeIntChunkLength(maxSubLength)] <== PackBytes(maxSubLength)(expectedSub);

    signal calculatedDigest <== Poseidon(7)([
      packedIss[0],
      packedAud[0],
      packedAud[1],
      packedAud[2],
      packedAud[3],
      packedSub[0],
      salt
    ]);

    calculatedDigest === oidcDigest;
}

component main{public [expectedIss, expectedAud, oidcDigest]} = PoseidonTest(
    31,
    100,
    31
);
