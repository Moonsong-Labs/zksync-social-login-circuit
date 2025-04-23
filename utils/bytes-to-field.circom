pragma circom 2.2.0;

include "circomlib/circuits/bitify.circom";
include "circomlib/circuits/gates.circom";
include "@zk-email/circuits/utils/array.circom";
include "./constants.circom";

function P_MINUS_ONE_AS_BYTES() {
  return [
      48, 100,  78, 114, 225,  49, 160,  41,
     184,  80,  69, 182, 129, 129,  88,  93,
      40,  51, 232,  72, 121, 185, 112, 145,
      67, 225, 245, 147, 240,   0,   0,   0
   ];
}

// [
//   48, 100,  78, 114, 224,  49, 160,  41,
//  184,  80,  69, 182, 129, 129,  88,  93,
//   40,  51, 232,  72, 121, 185, 112, 145,
//   67, 225, 245, 147, 240,   0,   0,   1
// ]


/// @title OverflowCheck
/// @notice Returns a boolean (0 or 1) indicating if a given array of bytes
///         interpreted as a big endian number represents a number bigger than p.
/// @dev this is meant to be used only with bn128
/// @dev The algorithm is like a reverse carry over. It iterates byte by byte
///      from the most significant to the less. The idea is check if there is room for
///      carry over.
/// @dev we avoid using LessThan with big numbers, because it doesn't behave well over 252 bits (p is 244 bits).
/// @dev the case where the bytes decode to exactly p is also considered overflow.
/// @input in[32] array of bytes to be interpreted as a big endian number
/// @ouput out 0 if the number is under p, 1 otherwise.
template OverflowCheck() {
  var n = MAX_NONCE_BASE64_LENGTH();
  var pAsBytes[32] = P_MINUS_ONE_AS_BYTES();

  signal input in[32];
  signal output out;

  // Used to compare each byte between the given number and p.
  signal lowers[32];
  signal equals[32];
  signal partials[32];
  signal anyLowerUpTo[32];

  for (var i = 0; i < 32; i++) {
    lowers[i] <== LessThan(8)([in[i], pAsBytes[i]]);
    equals[i] <== IsEqual()([in[i], pAsBytes[i]]);
  }

  anyLowerUpTo[0] <== lowers[0];
  for (var i = 1; i < 32; i++) {
    anyLowerUpTo[i] <== OR()(anyLowerUpTo[i - 1], lowers[i]);
  }

  partials[0] <== OR()(anyLowerUpTo[0], equals[0]);
  for (var i = 1; i < 32; i++) {
    // Partials for the current element is only true if the previous partial was true and
    // There is room for carry over. If any byte at the left was lower than the corresponding
    // byte in p, then there is room for carry over. Another option is that the inmediate byte at the left
    // was equal than the corresponding byte in p, in that case the current element has to be equal or lower than p.
    partials[i] <== AND()(
      partials[i - 1],
      OR()(anyLowerUpTo[i], equals[i])
    );
  }

  // There was carry over if the last partial is false (0) or if the number was exactly equal to p.
  out <== IsEqual()([partials[31], 0]);
}

/// @title BytesToFieldBE
/// @notice Transform an array of bytes into a single field. The bytes are interpreted using big endian format.
/// @dev This template assumes that every element of the input array is between 0 and 255.
/// @dev This template is meant to be used using bn128.
/// @param n the size of the array of bytes. It has to be lower or equal to 32
/// @input inputs[n] List of bytes to be transformed into a field.
///        The code assumes each element is a valid byte (0 <= inputs[i] <= 255).
/// @output out the decoded value
/// @overflow if the number being decoded is bigger than p, this value is 1, otherwise is 0.
template BytesToFieldBE(n) {
  assert(n <= 32);

  signal input bytes[n];
  signal revert[n];
  signal members[n];
  signal output out;
  signal output overflow;

  if (n == 32) {
    overflow <== OverflowCheck()(bytes);
  } else {
    overflow <== 0;
  }

  // First revert bytes.
  for (var i = 0; i < n; i++) {
    revert[n - i - 1] <== bytes[i];
  }

  // Then multiply each number for the right factor.
  for (var i = 0; i < n; i++) {
    var shifts = i * 8;
    members[i] <== (1 << shifts) * revert[i];
  }

  // Last, add each component to get the final value.
  out <== CalculateTotal(n)(members);
}
