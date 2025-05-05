/**
 * author: @zkemail
 * https://github.com/zkemail/jwt-tx-builder/blob/e5d79009fc5d00b97fcdcdeec697e1b9689a46b2/packages/circuits/utils/array.circom
 */
pragma circom 2.1.6;

include "@zk-email/circuits/utils/array.circom";

/// @title SelectSubArrayBase64
/// @notice Select sub array from an array and pad with 'A' for Base64
/// @notice This is similar to `SelectSubArray` but pads with 'A' (ASCII 65) instead of zero
/// @notice Useful for preparing Base64 encoded data for decoding
/// @param maxArrayLen: the maximum number of bytes in the input array
/// @param maxSubArrayLen: the maximum number of integers in the output array
/// @input in: the input array
/// @input startIndex: the start index of the sub array; assumes a valid index
/// @input length: the length of the sub array; assumes to fit in `ceil(log2(maxArrayLen))` bits
/// @output out: array of `maxSubArrayLen` size, items starting from `startIndex`, and items after `length` set to 'A' (ASCII 65)
template SelectSubArrayBase64(maxArrayLen, maxSubArrayLen) {
    assert(maxSubArrayLen <= maxArrayLen);

    signal input in[maxArrayLen];
    signal input startIndex;
    signal input length;

    signal output out[maxSubArrayLen];

    component shifter = VarShiftLeft(maxArrayLen, maxSubArrayLen);
    shifter.in <== in;
    shifter.shift <== startIndex;

    component gts[maxSubArrayLen];
    for (var i = 0; i < maxSubArrayLen; i++) {
        gts[i] = GreaterThan(log2Ceil(maxSubArrayLen));
        gts[i].in[0] <== length;
        gts[i].in[1] <== i;

        // Pad with 'A' (ASCII 65) instead of zero
        out[i] <== gts[i].out * shifter.out[i] + (1 - gts[i].out) * 65;
    }
}


/// @title CountCharOccurrencesUpTo
/// @notice Counts the number of occurrences of a specified character in an array up to a certain position
/// @dev This template iterates through the input array and counts how many times the specified character appears in
///      the first "upTo" elements.
/// @input in[maxLength] The input array in which to count occurrences of the character
/// @input upTo Max index used to count occurrences
/// @input char The character to count within the input array
/// @output count The number of times the specified character appears in the input array
template CountCharOccurrencesUpTo(maxLength) {
    signal input in[maxLength];
    signal input upTo;
    signal input char;
    signal output count;

    signal match[maxLength];
    signal inRange[maxLength];
    signal counter[maxLength];

    match[0] <== IsEqual()([in[0], char]);
    inRange[0] <== LessThan(log2Ceil(maxLength))([0, upTo]);
    counter[0] <== match[0] * inRange[0];

    for (var i = 1; i < maxLength; i++) {
        match[i] <== IsEqual()([in[i], char]);
        inRange[i] <== LessThan(log2Ceil(maxLength))([i, upTo]);
        counter[i] <== counter[i-1] + match[i] * inRange[i];
    }

    count <== counter[maxLength-1];
}
