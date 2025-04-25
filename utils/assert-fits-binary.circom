pragma circom  2.2.0;

include "circomlib/circuits/bitify.circom";

/// @title AssertFitsBinary
/// @notice Ensures a field fits in the binary representation of a max boundary
/// @dev This is useful to ensure that LessThan behaves as expected
/// @dev Notice Num2Bits performs the assertions inside
/// @param maxLength This parameter is used to calculate the max number of bits
/// @input realLength Value to check that does not overflow the binary representation
template AssertFitsBinary(maxLength) {
  signal input realLength;
  component n2b = Num2Bits(log2Ceil(maxLength));
  n2b.in <== realLength;
}
