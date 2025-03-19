import { poseidon3 } from "poseidon-lite";
import { type Address, encodeAbiParameters, keccak256 } from "viem";

import { ByteVector, type Hex } from "./byte-vector.js";

export function createNonce(txHashHex: string, blindingFactor: bigint): string {
  // Padding to complete 2 fields
  const nonceFields = ByteVector.fromHex(txHashHex).padRight(0, 62).toFieldArray();
  const hash = poseidon3([...nonceFields, blindingFactor]);
  return ByteVector.fromBigInt(hash).toBase64Url();
}

export function createNonceV2(address: Address, contractNonce: bigint, blindingFactor: bigint): [Hex, string] {
  const encoded = encodeAbiParameters(
    [
      {
        type: "address",
      },
      {
        type: "uint256",
      },
    ],
    [address, contractNonce],
  );
  const senderHash = keccak256(encoded);
  const nonceFields = ByteVector.fromHex(senderHash).padRight(0, 62).toFieldArray();
  const hash = poseidon3([...nonceFields, blindingFactor]);
  const nonceBytes = ByteVector.fromBigInt(hash).padLeft(0, 32);
  return [senderHash, nonceBytes.toBase64Url()];
}
