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
  kid: string;

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
    const rawHeader = ByteVector.fromBase64String(payload).toAsciiStr();
    const jsonPayload = JSON.parse(rawJson);
    const jsonHeader = JSON.parse(rawHeader);

    for (const prop of ["nonce", "iss", "aud", "sub"]) {
      if (!Object.hasOwn(jsonPayload, prop)) {
        throw new Error(`Missing '${prop}' inside JWT payload`);
      }

      if (typeof jsonPayload.nonce !== "string") {
        throw new Error(`Property '${prop}' inside JWT is not a string`);
      }
    }

    for (const prop of ["kid"]) {
      if (!Object.hasOwn(jsonHeader, prop)) {
        throw new Error(`Missing '${prop}' inside JWT payload`);
      }

      if (typeof jsonHeader.nonce !== "string") {
        throw new Error(`Property '${prop}' inside JWT is not a string`);
      }
    }

    this.nonce = jsonPayload.nonce;
    this.iss = jsonPayload.iss;
    this.aud = jsonPayload.aud;
    this.sub = jsonPayload.sub;
    this.kid = jsonHeader.kid;
  }
}
