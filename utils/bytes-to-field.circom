pragma circom 2.2.0;

include "@zk-email/circuits/utils/array.circom";

template BytesToField(n) {
  assert(n <= 32);

  signal input inputs[n];
  signal revert[n];
  signal members[n];
  signal output out;

  for (var i = 0; i < n; i++) {
    revert[n - i - 1] <== inputs[i];
  }

  for (var i = 0; i < n; i++) {
    var shifts = i * 8;
    members[i] <== (1 << shifts) * revert[i];
  }

  out <== CalculateTotal(n)(members);
}
