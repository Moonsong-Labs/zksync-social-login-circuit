pragma circom 2.2.0;

include "./fields.circom";


/// @title JwtData
/// @notice Extract important data from JWT payload
/// @dev This template used to extract the attributes of the payload needed to verify
///      the validity of the transaction: nonce, iss, aud, sub.
/// @param maxPayloadLength maximum length allowed for payload.
/// @param maxNonceLength maximum length allowed for nonce attribute of payload.
/// @param maxIssLength maximum length allowed for iss attribute of payload.
/// @param maxAudLength maximum length allowed for aud attribute of payload.
/// @param maxSubLength maximum length allowed for sub attribute of payload.
/// @input payload[maxPayloadLength] entire payload already decoded (ascii).
/// @input nonceKeyStartIndex index o '"nonce":' substring inside payload.
/// @input nonceLength actual length of nonce.
/// @input issKeyStartIndex index of '"iss":' substring inside payload.
/// @input issLength actual length of iss.
/// @input audKeyStartIndex index of '"aud":' substring inside payload.
/// @input audLength actual length of aud.
/// @input subKeyStartIndex index of '"sub":' substring inside payload.
/// @input subLength actual length of sub.
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
