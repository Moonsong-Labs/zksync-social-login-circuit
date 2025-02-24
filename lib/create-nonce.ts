import { poseidon3 } from "poseidon-lite";

import { ByteVector } from "./byte-vector.js";

export function createNonce(txHashHex: string, blindingFactor: bigint): string {
  // Padding to complete 2 fields
  const nonceFields = ByteVector.fromHex(txHashHex).padRight(0, 62).toFieldArray();
  const hash = poseidon3([...nonceFields, blindingFactor]);
  return ByteVector.fromBigInt(hash).toBase64Url();
}
