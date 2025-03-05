import { ByteVector, OidcDigest } from "../../lib/index.js";
import { JWT } from "../../lib/jwt.js";
import { env } from "./env.js";

export async function digestCommand() {
  const jwt = new JWT(env("RAW_JWT"));
  const payload = JSON.parse(Buffer.from(jwt.payload, "base64url").toString());

  const digest = new OidcDigest(payload.iss, payload.aud, payload.sub, ByteVector.fromAsciiString("salt"));
  console.log(digest.serialize());
}
