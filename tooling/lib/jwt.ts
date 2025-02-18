function assertDef<T>(input: T | undefined): asserts input is T {
  if (input === undefined) {
    throw new Error(`Unexpected undefined value.`);
  }
}

export class JWT {
  raw: string;
  header: string;
  payload: string;
  signature: string;

  constructor(raw: string) {
    this.raw = raw;
    const [header, payload, signature] = raw.split(".");
    assertDef(header);
    assertDef(payload);
    assertDef(signature);
    this.header = header;
    this.payload = payload;
    this.signature = signature;
  }
}
