pragma circom 2.2.0;
// include "@zk-email/circuits/lib/sha.circom";
include "circomlib/circuits/sha256/sha256.circom";
include "utils/sha256_unsafe.circom";
include "./utils/rsa_verify.circom";

template Main(nBlocks, n, k) {
    signal input msg[nBlocks][512];
    signal input tBlock;
    signal input pubkey[k];
    signal input signature[k];
    signal sha[256] <== Sha256_unsafe(nBlocks)(msg, tBlock);

    RsaVerify(n, k)(sha, pubkey, signature);
}

component main = Main(16, 121, 17);