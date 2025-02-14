import path from "node:path";

import { config } from "dotenv";
import yargs from "yargs";

import { compileCmd } from "./compile.js";
import { downloadPtau } from "./download-ptau.js";
import { inputCommand } from "./generate-input.js";
import { digestCommand } from "./lib/digest.js";
import { witnessCommand } from "./witness.js";
import { DEFAULT_PTAU, zkeyCommand } from "./zkey.js";
import { generateVerifier } from "./generate-verifier.js";

config();

const thisDir = import.meta.dirname;

const baseDir = path.join(thisDir, "..");

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
    await inputCommand(argv.file, baseDir);
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
      default: 20,
    },
  }, async (argv) => {
    await downloadPtau(argv.size);
  })
  .command(
    "oidc-digest",
    "calculates oidc_digest for jwt in env var",
    {},
    async () => {
      await digestCommand();
    })
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

  .strictCommands()
  .demandCommand(1);

// .parseAsync()

async function cli() {
  await args.parseAsync();
}

cli().catch(console.error);
