pragma circom 2.2.0;

include "circomlib/circuits/comparators.circom";

/// @title ReplaceAll
/// @notice Replaces all instances of `from` by `to`.
/// @dev Example: `ReplaceAll(3)([1, 4, 1], 1 , 5) === [5, 4, 5]`
/// @param n Length of input array.
/// @input in[n] Array which values are going to be replaced.
/// @input from Value that is going to be replaced.
/// @input to Value used for the replacement
template ReplaceAll(n) {
  signal input in[n];
  signal input from;
  signal input to;
  signal output out[n];

  signal parts[n][2];

  component equals[n];
  for (var i = 0; i < n; i++) {
    equals[i] = IsEqual();
    equals[i].in <== [in[i], from];
    parts[i][0] <== equals[i].out * to;
    parts[i][1] <== (1 - equals[i].out) * in[i];
  }

  for (var i = 0; i < n; i++) {
    out[i] <== parts[i][0] + parts[i][1];
  }
}
