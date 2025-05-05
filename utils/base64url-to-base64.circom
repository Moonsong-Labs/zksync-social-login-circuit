pragma circom 2.2.0;

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
/// @dev This template validares that original array does not have any of the non base64url specific characters. This avoids non-determinism.
/// @param n Length of the array to re encode.
/// @input b64Url Array of base64url characters.
template Base64UrlToBase64(n) {
  signal input b64Url[n];
  signal output b64[n];

  // First we ensure that thera are no '+' or '/';
  signal countAsciiPlus <== CountCharOccurrencesUpTo(n)(b64Url, ASCII_PLUS(), n);
  countAsciiPlus === 0;
  signal countAsciiSlash <== CountCharOccurrencesUpTo(n)(b64Url, ASCII_SLASH(), n);
  countAsciiSlash === 0;

  // replace '-' with '+';
  signal partial1[n] <== ReplaceAll(n)(b64Url, ASCII_MINUS(), ASCII_PLUS());
  // replace '_' with '/';
  signal partial2[n] <== ReplaceAll(n)(partial1, ASCII_UNDERSCORE(), ASCII_SLASH());
  // replace '\0' with '=' (to recreate the padding back);
  b64 <== ReplaceAll(n)(partial2, 0, ASCII_EQUAL());
}
