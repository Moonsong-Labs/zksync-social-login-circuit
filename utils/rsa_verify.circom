pragma circom 2.2.0;

include "@zk-email/circuits/lib/rsa.circom";
include "circomlib/circuits/bitify.circom";

/**
 * Verifies the result of a sha256 using RSA.
 */
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