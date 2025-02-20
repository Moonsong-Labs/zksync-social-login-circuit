import assert from "node:assert";

import express from "express";

import { createNonce } from "../lib/create-nonce.js";
import { ByteVector } from "./lib.js";
import { env } from "./lib/env.js";
import { JWT } from "../lib/jwt.js";

function waitForJwt(): Promise<string> {
  const app = express();

  return new Promise((resolve) => {
    app.get("/finish", async (req, res) => {
      if (!req.query.url || typeof req.query.url !== "string") {
        throw new Error("missing url");
      }
      const a = URL.parse(req.query.url);

      if (a === null) {
        throw new Error("Error parsing url");
      }

      const hash = a.hash.replace(/^#/, "");

      const parts = hash.split("&");

      const idTokenParam = parts.find((part) => part.startsWith("id_token="));

      if (!idTokenParam) {
        throw new Error("missing id_token");
      }

      const jwt = idTokenParam.replace("id_token=", "");

      resolve(jwt);
      res.send("ok!");
      server.close();
    });

    app.get("/oauth/plain", async (_req, res) => {
      res.contentType("text/html");
      res.send("<script>const a = encodeURIComponent(location.href); fetch('/finish/?url=' + a)</script>");
    });

    const server = app.listen(3000, () => console.log("Listening..."));
  });
}

export async function getJwtCmd(txHash: string) {
  const rawBlindingFactor = env("BLINDING_FACTOR");

  if (!rawBlindingFactor) {
    throw new Error("missing BLINDING_FACTOR env var");
  }

  const nonceFields = ByteVector.fromHex(txHash).padRight(0, 62).toFieldArray();

  assert(nonceFields.length === 2);

  const blindingFactor = BigInt(rawBlindingFactor);

  const nonce = createNonce(txHash, blindingFactor);
  console.log(`Nonce: ${nonce}`);
  const clientId = encodeURIComponent("866068535821-e9em0h73pee93q4evoajtnnkldsjhqdk.apps.googleusercontent.com");
  const responseType = "id_token";
  const scope = encodeURIComponent("openid");
  const redirectUri = encodeURI("http://localhost:3000/oauth/plain");
  const query = `?client_id=${clientId}&response_type=${responseType}&scope=${scope}&redirect_uri=${redirectUri}&nonce=${nonce}`;

  console.log(`https://accounts.google.com/o/oauth2/v2/auth${query}`);

  const rawJwt = await waitForJwt();

  const res = await fetch("https://www.googleapis.com/oauth2/v3/certs");
  const jwks = await res.json() as { keys: { kid: string; n: string } [] };
  const parsed = new JWT(rawJwt);
  const jwk = jwks.keys.find((jwk) => jwk.kid === parsed.kid);

  if (jwk === undefined) {
    throw new Error("Unable to get jwk");
  }

  console.log(`${rawJwt}\n\n${jwk.n}`);
}
