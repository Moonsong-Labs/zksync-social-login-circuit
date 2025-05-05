pragma circom 2.2.0;

include "../utils/array.circom";


template Main () {
  signal test01 <== CountCharOccurrencesUpTo(4)([1,1,0,1], 4, 1);
  test01 === 3;

  signal test02 <== CountCharOccurrencesUpTo(4)([1,1,0,1], 1, 1);
  test02 === 1;

  signal test03 <== CountCharOccurrencesUpTo(4)([1,1,0,1], 4, 2);
  test03 === 0;

  signal test04 <== CountCharOccurrencesUpTo(4)([1,1,0,1], 4, 0);
  test04 === 1;

  signal test05 <== CountCharOccurrencesUpTo(4)([1,1,1,1], 2, 1);
  test05 === 2;

  signal test06 <== CountCharOccurrencesUpTo(4)([1,1,1,1], 0, 1);
  test06 === 0;
}

component main = Main();
