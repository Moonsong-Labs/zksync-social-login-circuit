pragma circom 2.1.6;

include "@zk-email/circuits/helpers/reveal-substring.circom";

include "./constants.circom";

/// @title ExtractNonce
/// @notice Extracts and validates nonce from nonce field
/// @param maxNonceLength Maximum length of JWT payload
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

    // Verify nonce key
    var nonceKeyLength = NONCE_LENGTH();
    var nonceKey[nonceKeyLength] = NONCE();
    signal nonceKeyMatch[nonceKeyLength] <== RevealSubstring(maxPayloadLength, nonceKeyLength, 1)(payload, nonceKeyStartIndex, nonceKeyLength);
    for (var i = 0; i < nonceKeyLength; i++) {
        nonceKeyMatch[i] === nonceKey[i];
    }

    // Extract nonce
    signal nonceStartIndex <== nonceKeyStartIndex + nonceKeyLength + 1;
    nonce <== RevealSubstring(maxPayloadLength, maxNonceLength, 0)(payload, nonceStartIndex, nonceLength);
}
