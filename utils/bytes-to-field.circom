pragma circom 2.2.0;

include "circomlib/circuits/bitify.circom";
include "@zk-email/circuits/utils/array.circom";

/// @title BytesToFieldBE
/// @notice Transform an array of bytes into a single field. The bytes are interpreted using big endian format.
/// @dev This template assumes that every element of the input array is between 0 and 255.
/// @dev The result might overflow if the input interpreted in big endian is bigger than a field.
/// @param n the size of the array of bytes.
/// @input inputs[n] List of bytes to be transformed into a field.
///        The code assumes each element is a valid byte (0 <= inputs[i] <= 255).
template BytesToFieldBE(n) {
  assert(n <= 32);

  signal input bytes[n];
  signal revert[n];
  signal members[n];
  signal output out;

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
