pragma circom 2.1.6;

function NONCE_LENGTH() {
  // len("nonce":)
  return 8;
}

function ISS_KEY_LENGTH() {
  // len("iss":)
  return 6;
}

function SUB_KEY_LENGTH() {
  // len("sub":)
  return 6;
}

function AUD_KEY_LENGTH() {
  // len("aud":)
  return 6;
}

function NONCE_KEY() {
  // "nonce":
  return [34, 110, 111, 110, 99, 101, 34, 58];
}

function ISS_KEY() {
  // "iss":
  return [34, 105, 115, 115, 34, 58];
}

function AUD_KEY() {
  // "aud":
  return [ 34, 97, 117, 100, 34, 58 ];
}

function SUB_KEY() {
  // "sub":
  return [34, 115, 117, 98, 34, 58];
}
