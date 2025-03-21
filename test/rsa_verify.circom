/**
 * Based on @zkemail original code.
 * Original: https://github.com/zkemail/jwt-tx-builder/blob/e5d79009fc5d00b97fcdcdeec697e1b9689a46b2/packages/circuits/jwt-verifier.circom
 */
pragma circom 2.2.0;

include "@zk-email/circuits/lib/rsa.circom";
include "circomlib/circuits/bitify.circom";


/// @title RsaVerify
/// @dev Verifies `signature` for `msg` using `pubkey` with RSA.
/// @dev `msg` is size 256 because this is meant to be used with RSA-sha256.
/// @dev This uses big number representation in the form of n chunks of k size.
/// @param n Amount of chunks used to represent big numbers.
/// @param k Size of the chunks used to represent big numbers.
/// @input msg[256] Message to verify. Size is 256 because it's meant to be used with sha256.
/// @input pubkey[k] Public key represented as a big number of k chunks of size n.
template RsaVerify(n, k) {
    signal input msg[256];
    signal input pubkey[k]; // pubkey
    signal input signature[k];

    // Pack SHA output bytes to int[] for RSA input message
    var rsaMessageSize = (256 + n) \ n;
    component rsaMessage[rsaMessageSize];

    for (var i = 0; i < rsaMessageSize; i++) {
        rsaMessage[i] = Bits2Num(n);
    }

    for (var i = 0; i < 256; i++) {
        rsaMessage[i \ n].in[i % n] <== msg[255 - i];
    }

    for (var i = 256; i < n * rsaMessageSize; i++) {
        rsaMessage[i \ n].in[i % n] <== 0;
    }

    // Start calculate RSA
    component rsaVerifier = RSAVerifier65537(n, k);
    for (var i = 0; i < rsaMessageSize; i++) {
        rsaVerifier.message[i] <== rsaMessage[i].out;
    }
    for (var i = rsaMessageSize; i < k; i++) {
        rsaVerifier.message[i] <== 0;
    }
    rsaVerifier.modulus <== pubkey;
    rsaVerifier.signature <== signature;
    // End calculate RSA
}
