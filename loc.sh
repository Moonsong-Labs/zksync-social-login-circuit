

function ownCode() {
  find utils -iname "*.circom" | xargs wc -l --total=never | awk '{total += $1}END{print total}';
  find . -iname "jwt*.circom" | xargs wc -l --total=never | awk '{total += $1}END{print total}';
}


function depsCode() {
  find node_modules/circomlib/circuits -iname "poseidon.circom" | xargs wc -l --total=never | awk '{total += $1}END{print total}';
  find node_modules/circomlib/circuits -iname "comparators.circom" | xargs wc -l --total=never | awk '{total += $1}END{print total}';
  find node_modules/circomlib/circuits -iname "bitify.circom" | xargs wc -l --total=never | awk '{total += $1}END{print total}';
  find node_modules/circomlib/circuits/sha256 -iname "*.circom" | xargs wc -l --total=never | awk '{total += $1}END{print total}';

  find node_modules/@zk-email/circuits/utils/bytes.circom -iname "*.circom" | xargs wc -l --total=never | awk '{total += $1}END{print total}';
  find node_modules/@zk-email/circuits/lib/base64.circom -iname "*.circom" | xargs wc -l --total=never | awk '{total += $1}END{print total}';
  find node_modules/@zk-email/circuits/utils/array.circom -iname "*.circom" | xargs wc -l --total=never | awk '{total += $1}END{print total}';
  find node_modules/@zk-email/circuits/helpers/reveal-substring.circom -iname "*.circom" | xargs wc -l --total=never | awk '{total += $1}END{print total}';
  find node_modules/@zk-email/circuits/utils/hash.circom -iname "*.circom" | xargs wc -l --total=never | awk '{total += $1}END{print total}';
  find node_modules/@zk-email/circuits/lib/rsa.circom -iname "*.circom" | xargs wc -l --total=never | awk '{total += $1}END{print total}';
}

OWN_LOCS=`ownCode | awk '{total += $1}END{print total}'`;
DEP_LOCS=`depsCode | awk '{total += $1}END{print total}'`;

echo "Own code locs: $OWN_LOCS"
echo "Dependencies locs: $DEP_LOCS"
