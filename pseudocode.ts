import * as crypto from "crypto";
import { poseidon3, poseidon7 } from "poseidon-lite";

import { ByteVector } from "./lib";
import { AUD_MAX_LENGTH, ISS_MAX_LENGTH, SUB_MAX_LENGTH } from "./lib/constants";

function JwtTxValidation(
  message: string, // header.body of hwt
  pubkey: string,
  signature: string, // signature part of jwt
  expectedIss: string,
  expectedAud: string,
  salt: bigint,
  oidcDigest: bigint,
  nonceContentHash: bigint, // In reality, this is the "senderHash"
  blindingFactor: bigint,
) {
  // Verify jwt
  const publicKeyBuf = new Buffer(pubkey, "ascii");
  const verifier = crypto.createVerify("RSA-SHA256");
  verifier.update(Buffer.from(message));
  const isValidSig = verifier.verify(publicKeyBuf, Buffer.from(signature, "base64url"));
  if (!isValidSig) {
    throw new Error("Invalid signature");
  }

  // Extract relevant data from jwt
  const jwtBody = message.split(".")[1]!;
  const jsonJwt = JSON.parse(Buffer.from(jwtBody, "base64url").toString());
  const aud = jsonJwt.aud;
  const iss = jsonJwt.iss;
  const sub = jsonJwt.sub;
  const nonce = jsonJwt.nonce;

  // Validate jwt data
  if (iss !== expectedIss) {
    throw new Error("Invalid Iss");
  }

  // Validate jwt data
  if (aud !== expectedAud) {
    throw new Error("Invalid Aud");
  }

  // Recalculate digest;
  const encodedIss = ByteVector.fromAsciiString(iss).padRight(0, ISS_MAX_LENGTH).toFieldArray(); // always 1 field
  const encodedAud = ByteVector.fromAsciiString(aud).padRight(0, AUD_MAX_LENGTH).toFieldArray(); // always 4 fields
  const encodedSub = ByteVector.fromAsciiString(sub).padRight(0, SUB_MAX_LENGTH).toFieldArray(); // always 1 field
  const reconstructedDigest = poseidon7([
    encodedIss[0],
    encodedAud[0],
    encodedAud[1],
    encodedAud[2],
    encodedAud[3],
    encodedSub[0],
    salt,
  ]);

  if (reconstructedDigest !== oidcDigest) {
    throw new Error("Invalid digest");
  }

  // Verify Nonce
  const nonceAsFields = BigInt(`0x${Buffer.from(nonce, "base64url").toString("hex")}`);

  // Remember that this is actually the sender hash.
  const reconstructedNonceContent = poseidon3([nonceContentHash[0], nonceContentHash[1], blindingFactor[3]]);

  if (nonceAsFields !== reconstructedNonceContent) {
    throw new Error("Invalid nonce content");
  }
}
