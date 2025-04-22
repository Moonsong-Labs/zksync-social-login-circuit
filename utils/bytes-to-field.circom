pragma circom 2.2.0;

include "@zk-email/circuits/utils/array.circom";

/// @title BytesToFieldLE
/// @notice Transform an array of bytes into a single field. The bytes are interpreted using little endian format.
/// @dev This template assumes that every element of the input array is between 0 and 255.
/// @dev The result might overflow if the input interpreted in little endian is bigger than a field.
/// @param n the size of the array of bytes.
/// @input inputs[n] List of bytes to be transformed into a field.
///        The code assumes each element is a valid byte (0 <= inputs[i] <= 255).
template BytesToFieldLE(n) {
  assert(n <= 32);

  signal input bytes[n];
  signal members[n];
  signal output out;

  // Iterate each byte.
  // Each byte is shifted to the right position
  for (var i = 0; i < n; i++) {
    var shifts = i * 8;
    members[i] <== (1 << shifts) * bytes[i];
  }

  // Last, add each component to get the final value.
  out <== CalculateTotal(n)(members);
}
