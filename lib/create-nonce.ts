import { poseidon3 } from "poseidon-lite";
import { type Address, encodeAbiParameters, keccak256 } from "viem";

import { ByteVector, type Hex } from "./byte-vector.js";

export function createNonce(contentHex: string, blindingFactor: bigint): string {
  // Padding to complete 2 fields
  const nonceFields = ByteVector.fromHex(contentHex).padRight(0, 62).toFieldArray();
  const hash = poseidon3([...nonceFields, blindingFactor]);
  return ByteVector.fromBigInt(hash).padLeft(0, 32).toBase64Url();
}

export function createNonceV2(address: Address, contractNonce: bigint, blindingFactor: bigint, timestampLimit: bigint): [Hex, string] {
  const encoded = encodeAbiParameters(
    [
      {
        type: "address",
      },
      {
        type: "uint256",
      },
      {
        type: "uint256",
      },
    ],
    [address, contractNonce, timestampLimit],
  );
  const senderHash = keccak256(encoded);
  const nonce = createNonce(senderHash, blindingFactor);

  return [senderHash, nonce];
}
