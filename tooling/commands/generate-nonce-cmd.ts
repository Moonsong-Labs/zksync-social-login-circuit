import { getAddress, type Hex, pad } from "viem";

import { createNonceV2 } from "../../lib/index.js";
import type { AddCmdFn } from "../base-cli.js";
import { env } from "../lib/env.js";

function assertHex(str: string): Hex {
  if (/0x[0-9a-fA-f]+/.test(str)) {
    return str as Hex;
  } else {
    throw new Error(`Invalid hex: ${str}`);
  }
}

export async function generateNonceCmd(
  rawSender: string,
  rawTarget: string,
  rawPasskeyHash: string,
  contractNonce: number,
) {
  const passkeyHash = assertHex(rawPasskeyHash);
  const [senderHash, jwtNonce] = createNonceV2(
    getAddress(rawSender),
    getAddress(rawTarget),
    pad(passkeyHash),
    BigInt(contractNonce),
    BigInt(env("BLINDING_FACTOR")),
    BigInt(env("TIMESTAMP_LIMIT")),
  );
  console.log(`Sender hash: ${senderHash}`);
  console.log(`JwtNonce: ${jwtNonce}`);
}

export const addGenerateNonceCmd: AddCmdFn = (cli) => {
  return cli.command(
    "create-nonce <sender> <target> <passkeyHash> <nonce>",
    "Creates a nonce for a given address and nonce",
    {
      sender: {
        type: "string",
        demandOption: true,
        description: "Address of the sender of the tx",
      },
      target: {
        type: "string",
        demandOption: true,
        description: "Address of the account to recover",
      },
      passkeyHash: {
        type: "string",
        demandOption: true,
        description: "hash of new passkey",
      },
      nonce: {
        type: "string",
        demandOption: true,
        description: "OidcRecoveryValidator Contract nonce",
      },
    },
    async (argv) => {
      return generateNonceCmd(
        argv.sender,
        argv.target,
        argv.passkeyHash,
        Number(argv.nonce),
      );
    },
  );
};
