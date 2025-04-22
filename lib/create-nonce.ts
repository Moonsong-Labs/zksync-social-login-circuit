import { poseidon3 } from "poseidon-lite";
import { type Address, encodeAbiParameters, keccak256 } from "viem";

import { ByteVector, type Hex } from "./byte-vector.js";
import { FIELD_BYTES } from "./constants.js";

export function createNonce(contentHex: string, blindingFactor: bigint): string {
  // Padding to complete 2 fields
  const nonceFields = ByteVector.fromHex(contentHex).toBnChunks(FIELD_BYTES);
  const hash = poseidon3([...nonceFields, blindingFactor]);
  return ByteVector.fromBigIntLE(hash).padLeft(0, 32).toBase64Url();
}

export function createNonceV2(
  senderAddress: Address,
  targetAddress: Address,
  passkeyHash: Hex,
  contractNonce: bigint,
  blindingFactor: bigint,
  timestampLimit: bigint,
): [Hex, string] {
  const encoded = encodeAbiParameters(
    [
      {
        type: "address",
      },
      {
        type: "address",
      },
      {
        type: "bytes32",
      },
      {
        type: "uint256",
      },
      {
        type: "uint256",
      },
    ],
    [senderAddress, targetAddress, passkeyHash, contractNonce, timestampLimit],
  );
  const senderHash = keccak256(encoded);
  const nonce = createNonce(senderHash, blindingFactor);

  return [senderHash, nonce];
}
