export type BinStr = "0" | "1";
import type {
  CircuitSignals,
  Groth16Proof,
  PublicSignals,
} from "snarkjs";

export type { CircuitSignals, Groth16Proof, PublicSignals };

export interface CircuitInput {
  toObject(): CircuitSignals;
}
