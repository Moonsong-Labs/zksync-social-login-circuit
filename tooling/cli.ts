import { config } from "dotenv";
import { getAddress, type Hex, pad } from "viem";
import yargs from "yargs";

import { DEFAULT_PTAU_SIZE } from "../lib/constants.js";
import { createNonceV2 } from "../lib/index.js";
import { callVerifierCmd } from "./commands/call-verifier-cmd.js";
import { compileAndExportCmd } from "./commands/compile-and-export-cmd.js";
import { compileCmd } from "./commands/compile-cmd.js";
import { createZkeyCmd, DEFAULT_PTAU } from "./commands/create-zkey-cmd.js";
import { deployVerifierCmd } from "./commands/deploy-verifier-cmd.js";
import { downloadPtauCmd } from "./commands/download-ptau-cmd.js";
import { exportCircuitCmd } from "./commands/export-circuit-cmd.js";
import { exportVerifierCmd } from "./commands/export-verifier-cmd.js";
import { exportVerifierTestCmd } from "./commands/export-verifier-test.js";
import { generateInputCmd } from "./commands/generate-input-cmd.js";
import { generateVerifierCmd } from "./commands/generate-verifier-cmd.js";
import { generateWitnessCmd } from "./commands/generate-witness-cmd.js";
import { getJwtCmd } from "./commands/get-jwt-cmd.js";
import { prepareZkeyCmd } from "./commands/prepare-zkey-cmd.js";
import { proveCmd } from "./commands/prove-cmd.js";
import { runCmd } from "./commands/run-cmd.js";
import { runTestCmd } from "./commands/run-test-cmd.js";
import { verificationKeyCmd } from "./commands/verification-key-cmd.js";
import { verifierTestCmd } from "./commands/verifier-test-cmd.js";
import { verifyCmd } from "./commands/verify-cmd.js";
import { digestCommand } from "./lib/digest.js";
import { env } from "./lib/env.js";

config();

const FILE_ARG_DEF = {
  file: {
    type: "string",
    demandOption: true,
  },
} as const;

const args = yargs(process.argv.slice(2))
  .scriptName("tooling")
  .command("compile <file>", "compiles circuit to wasm, sym and r1cs", FILE_ARG_DEF, async (argv) => {
    await compileCmd(argv.file);
  })
  .command("input", "generates input for circuit if it knows how to.", async () => {
    await generateInputCmd();
  })
  .command("witness <file>", "generate a witness file from an input generated previously", FILE_ARG_DEF, async (argv) => {
    await generateWitnessCmd(argv.file);
  })
  .command(
    "zkey <file>",
    "generate a zkey file for a circuit",
    {
      file: FILE_ARG_DEF.file,
      ptau: {
        type: "string",
        demandOption: false,
        description: "path to powers of tau file",
        default: DEFAULT_PTAU,
      },
    },
    async (argv) => {
      console.warn("For production please use a prepared power of tau.");
      await createZkeyCmd(argv.file, argv.ptau);
    })
  .command("download-ptau <size>", "downloads perpetual power of tau file", {
    size: {
      type: "number",
      demandOption: true,
      default: DEFAULT_PTAU_SIZE,
    },
  }, async (argv) => {
    await downloadPtauCmd(argv.size);
  })
  .command("prepare-zkey <file>", "downloads perpetual power of tau file",
    FILE_ARG_DEF,
    async (argv) => {
      await prepareZkeyCmd(argv.file);
    })
  .command(
    "oidc-digest",
    "calculates oidc_digest for jwt in env var",
    {},
    async () => {
      await digestCommand();
    })
  .command(
    "prove <file>",
    "Calculates a proof using default inputs",
    FILE_ARG_DEF,
    async (argv) => {
      await proveCmd(argv.file);
    },
  )
  .command(
    "verifier <file>",
    "calculates oidc_digest for jwt in env var",
    {
      ...FILE_ARG_DEF,
      out: {
        type: "string",
        demandOption: false,
        description: "where to save the contract.",
        default: null,
        alias: ["o"],
      },
    },
    async (argv) => {
      await generateVerifierCmd(argv.file, argv.out);
    })
  .command(
    "vkey <file>",
    "exports verification key for a circuit",
    FILE_ARG_DEF,
    async (argv) => {
      await verificationKeyCmd(argv.file);
    })
  .command(
    "verify <file>",
    "exports verification key for a circuit",
    FILE_ARG_DEF,
    async (argv) => {
      await verifyCmd(argv.file);
    })
  .command(
    "export-verifier <file>",
    "exports verifier into right contracts folder",
    async () => {
      await exportVerifierCmd();
    })
  .command(
    "export-verifier-test <file>",
    "calculates oidc_digest for jwt in env var",
    FILE_ARG_DEF,
    async (argv) => {
      await exportVerifierTestCmd(argv.file);
    })
  .command(
    "deploy-verifier <file>",
    "deploys verifier to local anvil",
    FILE_ARG_DEF,
    async (argv) => {
      await deployVerifierCmd(argv.file);
    },
  )
  .command(
    "call-verifier <file>",
    "cast calls verifier",
    FILE_ARG_DEF,
    async (argv) => {
      await callVerifierCmd(argv.file);
    },
  )
  .command(
    "export-circuit",
    "Exports circuit files directly into Auth Server public folder",
    {},
    async () => {
      await exportCircuitCmd();
    },
  )
  .command(
    "get-jwt <nonce>",
    "Helps to perform oidc flow with given nonce. Prints resulting JWT.",
    {
      nonce: {
        type: "string",
        demandOption: true,
        description: "Nonce used to obtain jwt",
      },
    },
    async (argv) => {
      await getJwtCmd(argv.nonce);
    },
  )
  .command(
    "all <file>",
    "Performs all neded tasks to export verifier and prepared zkey",
    {},
    async () => compileAndExportCmd(),
  )
  .command(
    "run <file>",
    "Generates inputs, wasm and witness for a circuit",
    FILE_ARG_DEF,
    async (argv) => {
      await runCmd(argv.file);
    },
  )
  .command(
    "run-test <file>",
    "Generates inputs, wasm and witness for a test circuit",
    FILE_ARG_DEF,
    async (argv) => {
      await runTestCmd(argv.file);
    },
  )
  .command(
    "verifier-for-test <file>",
    "Generates a verifier to be use in testing environments",
    FILE_ARG_DEF,
    async (argv) => {
      await verifierTestCmd(argv.file);
    },
  )
  .command(
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
      const nonce = createNonceV2(
        getAddress(argv.sender),
        getAddress(argv.target),
        pad(argv.passkeyHash as Hex),
        BigInt(argv.nonce),
        BigInt(env("BLINDING_FACTOR")),
        BigInt(env("TIMESTAMP_LIMIT")),
      );
      console.log(nonce);
    },
  )
  .strictCommands()
  .demandCommand(1);

async function cli() {
  await args.parseAsync();
}

cli().catch(console.error);
