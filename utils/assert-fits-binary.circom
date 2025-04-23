pragma circom  2.2.0;

include "circomlib/circuits/bitify.circom";

/// @title AssertFitsBinary
/// @notice ensures a field fits in the binary representation of a max boundry
/// @dev this is useful to ensure that LessThan behaves as espected
/// @dev notice Num2Bits performs the assertions inside
/// @param maxLength this parameter is used to calculate the max number of bits
/// @input realLength value to check that does not overflow the binary representation
template AssertFitsBinary(maxLength) {
  signal input realLength;
  component n2b = Num2Bits(log2Ceil(maxLength));
  n2b.in <== realLength;
}
