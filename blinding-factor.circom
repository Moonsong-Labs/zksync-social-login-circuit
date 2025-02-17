pragma circom 2.2.0;

include "@zk-email/circuits/lib/base64.circom";

template BlindingFactor(maxNonceLengthBase64) {
  signal input b64Nonce[maxNonceLengthBase64];
  signal input blindingFactor;
  signal input txHash[2];

  var maxNonceLength = (maxNonceLengthBase64 * 3) \ 4;

  signal nonce[maxNonceLength];

  nonce <== Base64Decode(maxNonceLength)(b64Nonce);
}

component main = BlindingFactor(44);
