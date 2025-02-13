import { ByteVector } from "./byte-vector.js";
import { env } from "./env.js";
import { JWT } from "./jwt.js";
import { OidcDigest } from "./oidc-digest.js";

export async function digestCommand() {
  const jwt = new JWT(env("RAW_JWT"));
  const payload = JSON.parse(Buffer.from(jwt.payload, "base64url").toString());

  const digest = new OidcDigest(payload.iss, payload.aud, payload.sub, ByteVector.fromAsciiString("salt"));
  console.log(digest.serialize());
}
