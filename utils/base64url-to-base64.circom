pragma circom 2.2.0;


include "@zk-email/circuits/utils/array.circom";
include "./array.circom";
include "./replace-all.circom";


function ASCII_MINUS() {
  return 45;
}

function ASCII_PLUS() {
  return 43;
}

function ASCII_UNDERSCORE() {
  return 95;
}

function ASCII_SLASH() {
  return 47;
}

function ASCII_EQUAL() {
  return 61;
}

/// @title Base64UrlToBase64
/// @notice Assumes input is encoded as base64url and translates to regular base64.
/// @dev We use this to translate from a base64url array of bytes a to a base64 formated array of bytes.
/// @dev This can be used as a middle step to later on use zkemail's base64 decoder.
/// @dev This template validates that original array does not have any of the non base64url specific characters. This avoids non-determinism.
/// @dev We always use this template before using `Base64Decode` from zkemail, which validates null characters. That's why we don't check the here.
/// @param n Length of the array to re encode.
/// @input b64Url Array of base64url characters.
template Base64UrlToBase64(n) {
  signal input b64Url[n];
  signal output b64[n];

  // First we ensure that there are no '+' or '/' in b64url
  signal matchesPlus[n];
  signal matchesSlash[n];

  // Save all positions where is '+' or '/'.
  for (var i = 0; i < n; i++) {
    matchesPlus[i] <== IsEqual()([b64Url[i], ASCII_PLUS()]);
    matchesSlash[i] <== IsEqual()([b64Url[i], ASCII_SLASH()]);
  }

  signal totalPlus <== CalculateTotal(n)(matchesPlus);
  totalPlus === 0;
  signal totalSlash <== CalculateTotal(n)(matchesSlash);
  totalSlash === 0;

  // replace '-' with '+';
  signal partial1[n] <== ReplaceAll(n)(b64Url, ASCII_MINUS(), ASCII_PLUS());
  // replace '_' with '/';
  b64 <== ReplaceAll(n)(partial1, ASCII_UNDERSCORE(), ASCII_SLASH());
}
