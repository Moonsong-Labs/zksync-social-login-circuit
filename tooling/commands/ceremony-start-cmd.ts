import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { AddCmdFn } from "../base-cli.js";
import { createS3Client, uploadFile } from "../lib/buckets.js";
import { ROOT_DIR } from "../lib/cmd.js";
import { MAIN_CIRCUIT_FILE, MAIN_CIRCUIT_NAME } from "../paths.js";
import { compileCmd, compiledWasmFile } from "./compile-cmd.js";
import { createZkeyCmd, DEFAULT_PTAU, rawZkeyFilePath } from "./create-zkey-cmd.js";
import { downloadPtauCmd } from "./download-ptau-cmd.js";

export async function ceremonyStartCmd(forceRecreate: boolean) {
  const wasmPath = compiledWasmFile(MAIN_CIRCUIT_NAME);
  const zkeyPath = rawZkeyFilePath(MAIN_CIRCUIT_NAME);
  const ptauPath = path.join(ROOT_DIR, DEFAULT_PTAU);

  if (!existsSync(wasmPath) || forceRecreate) {
    await compileCmd(MAIN_CIRCUIT_FILE);
  }

  const haveToRecreate = !existsSync(zkeyPath) || forceRecreate;
  if (haveToRecreate && !existsSync(ptauPath)) {
    console.log("Downloading ptau file.");
    await downloadPtauCmd(20);
  }

  if (haveToRecreate) {
    console.log("Generating zkey file");
    await createZkeyCmd(MAIN_CIRCUIT_FILE, DEFAULT_PTAU);
  }

  const body = readFileSync(zkeyPath);

  const client = createS3Client();
  await uploadFile(client, body, `${MAIN_CIRCUIT_NAME}.000.zkey`);
}

export const addCeremonyStartCmd: AddCmdFn = (cli) => {
  return cli.command(
    "ceremony-start",
    "",
    (args) => args
      .option("forceRecreate", {
        alias: ["f", "force-recreate"],
        describe: "Force to recreate the collaboration and the beacon with new random values",
        type: "boolean",
        default: false,
      }),
    async (args) => ceremonyStartCmd(args.forceRecreate),
  );
};
