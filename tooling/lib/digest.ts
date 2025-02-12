import { ByteVector } from "./byte-vector.ts";
import { env } from "./env.ts";
import { OidcDigest } from "./oidc-digest.ts";

export async function digestCommand() {
  const payload = JSON.parse(Buffer.from(env("RAW_JWT").split(".")[1], "base64url").toString());

  const digest = new OidcDigest(payload.iss, payload.aud, payload.sub, ByteVector.fromAsciiString("salt"));
  console.log(digest.serialize());
}
