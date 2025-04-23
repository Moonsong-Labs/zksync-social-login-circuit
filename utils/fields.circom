/**
 * Based on @zkemail work.
 * Original: https://github.com/zkemail/jwt-tx-builder/blob/e5d79009fc5d00b97fcdcdeec697e1b9689a46b2/packages/circuits/helpers/fields.circom
 */
pragma circom 2.2.0;

include "@zk-email/circuits/helpers/reveal-substring.circom";
include "./assert-fits-binary.circom";

include "./constants.circom";

/// @title ExtractNonce
/// @notice Extracts and validates nonce from nonce field
/// @dev maxNonceLength length has to be lower or equal maxPayloadLength
/// @dev nonceKeyStartIndex and nonceKeyStartIndex + nonceLength have to be in correct range
/// @param maxPayloadLength Maximum length of JWT payload
/// @param maxNonceLength Maximum length of nonce string
/// @input payload[maxNonceLength] JWT payload bytes
/// @input nonceKeyStartIndex Starting index of nonce field
/// @input nonceLength Length of nonce value
/// @output nonce[maxNonceLength] nonce bytes
template ExtractNonce(maxPayloadLength, maxNonceLength) {
  signal input payload[maxPayloadLength];
  signal input nonceKeyStartIndex;
  signal input nonceLength;

  signal output nonce[maxNonceLength];

  AssertFitsBinary(maxNonceLength)(nonceLength);

  // Verify nonce key
  var nonceKeyLength = NONCE_LENGTH();
  var nonceKey[nonceKeyLength] = NONCE_KEY();
  signal nonceKeyMatch[nonceKeyLength] <== RevealSubstring(maxPayloadLength, nonceKeyLength, 1)(payload, nonceKeyStartIndex, nonceKeyLength);
  for (var i = 0; i < nonceKeyLength; i++) {
    nonceKeyMatch[i] === nonceKey[i];
  }

  // Extract nonce
  signal nonceStartIndex <== nonceKeyStartIndex + nonceKeyLength + 1;

  // `RevealSubstring` asserts nonceStartIndex and nonceStartIndex + nonceLength are in valid range.
  nonce <== RevealSubstring(maxPayloadLength, maxNonceLength, 0)(payload, nonceStartIndex, nonceLength);
}



/// @title ExtractIssuer
/// @notice Extracts and validates the 'iss' (Issuer) from JWT payload
/// @dev maxNonceLength length has to be lower or equal maxPayloadLength
/// @dev issKeyStartIndex and issKeyStartIndex + issLength have to be in correct range
/// @param maxPayloadLength Maximum length of JWT payload
/// @param maxIssLength Maximum length of issuer value in bytes
/// @input payload[maxPayloadLength] JWT payload bytes
/// @input issKeyStartIndex Starting index of 'iss' field
/// @input issLength Length of issuer value
/// @output iss[maxIssLength] iss as array of bytes
template ExtractIssuer(maxPayloadLength, maxIssLength) {
  signal input payload[maxPayloadLength];
  signal input issKeyStartIndex;
  signal input issLength;

  signal output iss[maxIssLength];

  AssertFitsBinary(maxIssLength)(issLength);

  // Verify if the key `iss` in the payload is unique
  var issKeyLength = ISS_KEY_LENGTH();
  var issKey[issKeyLength] = ISS_KEY();
  signal issKeyMatch[issKeyLength] <== RevealSubstring(maxPayloadLength, issKeyLength, 1)(payload, issKeyStartIndex, issKeyLength);
  for (var i = 0; i < issKeyLength; i++) {
    issKeyMatch[i] === issKey[i];
  }

  // Reveal the iss in the payload
  signal issStartIndex <== issKeyStartIndex + issKeyLength + 1;

  // `RevealSubstring` asserts issStartIndex and issStartIndex + issLength are in valid range.
  iss <== RevealSubstring(maxPayloadLength, maxIssLength, 0)(payload, issStartIndex, issLength);
}

/// @title ExtractAud
/// @notice Extracts and validates the 'aud' (Audience) from JWT payload
/// @dev maxNonceLength length has to be lower or equal maxPayloadLength
/// @dev audKeyStartIndex and audKeyStartIndex + audLength have to be in correct range
/// @param maxPayloadLength Maximum length of JWT payload
/// @param maxAudLength Maximum length of aud value in bytes
/// @input payload[maxPayloadLength] JWT payload bytes
/// @input audKeyStartIndex Starting index of 'aud' field
/// @input audLength Length of aud value
/// @output aud[maxAudLength] aud as array of bytes
template ExtractAud(maxPayloadLength, maxAudLength) {
  signal input payload[maxPayloadLength];
  signal input audKeyStartIndex;
  signal input audLength;

  signal output aud[maxAudLength];

  AssertFitsBinary(maxAudLength)(audLength);

  // Verify if the key `aud` in the payload is unique
  var audKeyLength = AUD_KEY_LENGTH();
  var audKey[audKeyLength] = AUD_KEY();
  signal audKeyMatch[audKeyLength] <== RevealSubstring(maxPayloadLength, audKeyLength, 1)(payload, audKeyStartIndex, audKeyLength);
  for (var i = 0; i < audKeyLength; i++) {
    audKeyMatch[i] === audKey[i];
  }

  // Reveal the aud in the payload
  signal audStartIndex <== audKeyStartIndex + audKeyLength + 1;

  // `RevealSubstring` asserts audStartIndex and audStartIndex + audLength are in valid range.
  aud <== RevealSubstring(maxPayloadLength, maxAudLength, 0)(payload, audStartIndex, audLength);
}


/// @title ExtractSub
/// @notice Extracts and validates the 'sub' (Subject) from JWT payload
/// @dev maxNonceLength length has to be lower or equal maxPayloadLength
/// @dev audKeyStartIndex and audKeyStartIndex + audLength have to be in correct range
/// @param maxPayloadLength Maximum length of JWT payload
/// @param maxSubLength Maximum length of sub value in bytes
/// @input payload[maxPayloadLength] JWT payload bytes
/// @input subKeyStartIndex Starting index of 'sub' field
/// @input subLength Length of sub value
/// @output sub[maxSubLength] sub as array of bytes
template ExtractSub(maxPayloadLength, maxSubLength) {
  signal input payload[maxPayloadLength];
  signal input subKeyStartIndex;
  signal input subLength;

  signal output sub[maxSubLength];

  AssertFitsBinary(maxSubLength)(subLength);

  // Verify if the key `sub` in the payload is unique
  var subKeyLength = SUB_KEY_LENGTH();
  var subKey[subKeyLength] = SUB_KEY();
  signal subKeyMatch[subKeyLength] <== RevealSubstring(maxPayloadLength, subKeyLength, 1)(payload, subKeyStartIndex, subKeyLength);
  for (var i = 0; i < subKeyLength; i++) {
    subKeyMatch[i] === subKey[i];
  }

  // Reveal the sub in the payload
  signal subStartIndex <== subKeyStartIndex + subKeyLength + 1;

  // `RevealSubstring` asserts subStartIndex and subStartIndex + subLength are in valid range.
  sub <== RevealSubstring(maxPayloadLength, maxSubLength, 0)(payload, subStartIndex, subLength);
}
