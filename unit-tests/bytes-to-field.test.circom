pragma circom 2.2.0;

include "../utils/bytes-to-field.circom";

template Main () {
  signal test01 <== BytesToField(1)([42]);
  test01 === 42;

  signal test02 <== BytesToField(2)([42, 0]);
  test02 === 42;

  signal test03 <== BytesToField(2)([0, 42]);
  test03 === 10752;
}

component main = Main();
