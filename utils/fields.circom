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



/// @title ExtractIssuer
/// @notice Extracts and validates the 'iss' (Issuer) from JWT payload
/// @param maxPayloadLength Maximum length of JWT payload
/// @param maxIssLength Maximum length of issuer value in bytes
/// @input payload[maxPayloadLength] JWT payload bytes
/// @input issKeyStartIndex Starting index of 'iss' field
/// @input issLength Length of issuer value
/// @output iss[compute_ints_size(maxIssLength)] Issuer as array of field elements
template ExtractIssuer(maxPayloadLength, maxIssLength) {
    signal input payload[maxPayloadLength];
    signal input issKeyStartIndex;
    signal input issLength;

    signal output iss[maxIssLength];

    // Verify if the key `iss` in the payload is unique
    var issKeyLength = ISS_KEY_LENGTH();
    var issKey[issKeyLength] = ISS_KEY();
    signal issKeyMatch[issKeyLength] <== RevealSubstring(maxPayloadLength, issKeyLength, 1)(payload, issKeyStartIndex, issKeyLength);
    for (var i = 0; i < issKeyLength; i++) {
        issKeyMatch[i] === issKey[i];
    }

    // Reveal the iss in the payload
    signal issStartIndex <== issKeyStartIndex + issKeyLength + 1;
    iss <== RevealSubstring(maxPayloadLength, maxIssLength, 0)(payload, issStartIndex, issLength);
}
