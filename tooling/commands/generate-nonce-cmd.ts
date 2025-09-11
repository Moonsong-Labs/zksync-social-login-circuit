import { ByteVector, createNonceV2 } from "../../lib/index.js";
import type { AddCmdFn } from "../base-cli.js";
import { env } from "../lib/env.js";

export async function generateNonceCmd() {
  const passkeyHash = ByteVector.fromHex(env('PASSKEY_HASH')).padLeft(0, 32).toHex();
  const contractNonce = env('CONTRACT_NONCE');
  const blindingFactor = env('BLINDING_FACTOR');
  const timestampLimit = env('TIMESTAMP_LIMIT');


  const senderAddress = ByteVector.fromHex(env('SENDER_ADDRESS')).toHex();
  const targetAddress = ByteVector.fromHex(env('TARGET_ADDRESS')).toHex();

  const [ senderHash, nonce ] = createNonceV2(
    senderAddress,
    targetAddress,
    passkeyHash,
    BigInt(contractNonce),
    BigInt(blindingFactor),
    BigInt(timestampLimit)
  );

  console.log(`senderHash (nonce content): ${senderHash}`);
  console.log(`packed nonce: ${nonce}`);
}

export const addGenerateNonceCmd: AddCmdFn = (cli) => {
  return cli.command(
    "create-nonce",
    "Creates a nonce for a given address and nonce",
    {},
    async (argv) => {
      return generateNonceCmd();
    },
  );
};
