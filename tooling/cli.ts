import { config } from "dotenv";
import { getAddress } from "viem";
import yargs from "yargs";

import { DEFAULT_PTAU_SIZE } from "../lib/constants.js";
import { createNonceV2 } from "../lib/index.js";
import { allCmd } from "./all.js";
import { callVerifierCmd } from "./call-verifier.js";
import { compileCmd } from "./compile.js";
import { deployVerifier } from "./deploy-verifier.js";
import { downloadPtau } from "./download-ptau.js";
import { exportCircuitCmd } from "./export-circuit.js";
import { exportVerifierCmd } from "./export-verifier.js";
import { exportVerifierTestCmd } from "./export-verifier-test.js";
import { inputCommand } from "./generate-input.js";
import { generateVerifier } from "./generate-verifier.js";
import { getJwtCmd } from "./get-jwt-cmd.js";
import { digestCommand } from "./lib/digest.js";
import { env } from "./lib/env.js";
import { prepareZkeyCmd } from "./prepare-zkey.js";
import { prove } from "./prove.js";
import { runCmd } from "./run-cmd.js";
import { verificationKeyCmd } from "./verification-key.js";
import { verifierTestCmd } from "./verifier-test.js";
import { verifyCmd } from "./verify.js";
import { witnessCommand } from "./witness.js";
import { DEFAULT_PTAU, zkeyCommand } from "./zkey.js";

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
  .command("input <file>", "generates input for circuit if it knows how to.", FILE_ARG_DEF, async (argv) => {
    await inputCommand(argv.file);
  })
  .command("witness <file>", "generate a witness file from an input generated previously", FILE_ARG_DEF, async (argv) => {
    await witnessCommand(argv.file);
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
      await zkeyCommand(argv.file, argv.ptau);
    })
  .command("download-ptau <size>", "downloads perpetual power of tau file", {
    size: {
      type: "number",
      demandOption: true,
      default: DEFAULT_PTAU_SIZE,
    },
  }, async (argv) => {
    await downloadPtau(argv.size);
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
      await prove(argv.file);
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
      await generateVerifier(argv.file, argv.out);
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
    "calculates oidc_digest for jwt in env var",
    FILE_ARG_DEF,
    async (argv) => {
      await exportVerifierCmd(argv.file);
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
      await deployVerifier(argv.file);
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
    FILE_ARG_DEF,
    async (argv) => allCmd(argv.file),
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
    "verifier-for-test <file>",
    "Generates a verifier to be use in testing environments",
    FILE_ARG_DEF,
    async (argv) => {
      await verifierTestCmd(argv.file);
    },
  )
  .command(
    "create-nonce <address> <nonce>",
    "Creates a nonce for a given address and nonce",
    {
      address: {
        type: "string",
        demandOption: true,
        description: "Address to create nonce for",
      },
      nonce: {
        type: "string",
        demandOption: true,
        description: "OidcRecoveryValidator Contract nonce",
      },
    },
    async (argv) => {
      const nonce = createNonceV2(
        getAddress(argv.address),
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
