export type BinStr = "0" | "1";

export interface CircuitInput<T> {
  toObject(): T;
}
