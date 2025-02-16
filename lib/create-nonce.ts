import assert from "node:assert";

import { poseidon3 } from "poseidon-lite";

import { ByteVector } from "./byte-vector.js";

export function createNonce(txHashHex: string, blindingFactor: bigint): bigint {
  const nonceFields = ByteVector.fromHex(txHashHex).padRight(0, 62).toFieldArray();

  assert(nonceFields.length === 2);

  return poseidon3([...nonceFields, blindingFactor]);
}
