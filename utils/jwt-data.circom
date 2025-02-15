pragma circom 2.2.0;

include "./fields.circom";

template JwtData(
  maxPayloadLength,
  maxNonceLength,
  maxIssLength,
  maxAudLength,
  maxSubLength
) {
  // Payload (after decode base64);
  signal input payload[maxPayloadLength];

  // nonce data
  signal input nonceKeyStartIndex;
  signal input nonceLength;
  // iss data
  signal input issKeyStartIndex;
  signal input issLength;
  // aud data
  signal input audKeyStartIndex;
  signal input audLength;
  // sub data
  signal input subKeyStartIndex;
  signal input subLength;

  signal output nonce[maxNonceLength];
  signal output iss[maxIssLength];
  signal output aud[maxAudLength];
  signal output sub[maxSubLength];

  nonce <== ExtractNonce(maxPayloadLength, maxNonceLength)(payload, nonceKeyStartIndex, nonceLength);
  iss <== ExtractIssuer(maxPayloadLength, maxIssLength)(payload, issKeyStartIndex, issLength);
  aud <== ExtractAud(maxPayloadLength, maxAudLength)(payload, audKeyStartIndex, audLength);
  sub <== ExtractSub(maxPayloadLength, maxSubLength)(payload, subKeyStartIndex, subLength);
}
