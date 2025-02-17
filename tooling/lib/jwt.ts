import { ByteVector } from "../../lib/index.js";

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
  nonce: string;
  iss: string;
  aud: string;
  sub: string;

  constructor(raw: string) {
    this.raw = raw;
    const [header, payload, signature] = raw.split(".");
    assertDef(header);
    assertDef(payload);
    assertDef(signature);
    this.header = header;
    this.payload = payload;
    this.signature = signature;

    const rawJson = ByteVector.fromBase64String(payload).toAsciiStr();
    const json = JSON.parse(rawJson);

    for (const prop of ["nonce", "iss", "aud", "sub"]) {
      if (!Object.hasOwn(json, prop)) {
        throw new Error(`Missing '${prop}' inside JWT payload`);
      }

      if (typeof json.nonce !== "string") {
        throw new Error(`Property '${prop}' inside JWT is not a string`);
      }
    }

    this.nonce = json.nonce;
    this.iss = json.iss;
    this.aud = json.aud;
    this.sub = json.sub;
  }
}
