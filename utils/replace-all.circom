pragma circom 2.2.0;

include "circomlib/circuits/comparators.circom";

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
