import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { AddCmdFn } from "../base-cli.js";
import { createS3Client, uploadFile } from "../lib/buckets.js";
import { ROOT_DIR } from "../lib/cmd.js";
import { MAIN_CIRCUIT_FILE, MAIN_CIRCUIT_NAME } from "../paths.js";
import { compileCmd, compiledWasmFile } from "./compile-cmd.js";
import { createZkeyCmd, DEFAULT_PTAU } from "./create-zkey-cmd.js";
import { downloadPtauCmd } from "./download-ptau-cmd.js";
import { preparedZkeyFile, prepareZkeyCmd } from "./prepare-zkey-cmd.js";

export async function uploadPreparedZkeyCmd(forceRecreate: boolean) {
  const wasmPath = compiledWasmFile(MAIN_CIRCUIT_NAME);
  const zkeyPath = preparedZkeyFile(MAIN_CIRCUIT_NAME);
  const ptauPath = path.join(ROOT_DIR, DEFAULT_PTAU);

  if (!existsSync(wasmPath) || forceRecreate) {
    await compileCmd(MAIN_CIRCUIT_FILE);
  }

  const haveToRecreate = !existsSync(zkeyPath) || forceRecreate;
  if (haveToRecreate && !existsSync(ptauPath)) {
    await downloadPtauCmd(20);
  }

  if (haveToRecreate) {
    await createZkeyCmd(MAIN_CIRCUIT_FILE, DEFAULT_PTAU);
    await prepareZkeyCmd(MAIN_CIRCUIT_FILE);
  }

  const zkeyBuffer = readFileSync(zkeyPath);
  const wasmBuffer = readFileSync(wasmPath);

  const client = createS3Client();

  await uploadFile(client, wasmBuffer, `${MAIN_CIRCUIT_NAME}.wasm`);
  await uploadFile(client, zkeyBuffer, `${MAIN_CIRCUIT_NAME}-final.zkey`);

  console.log("Ok!");
}

export const addUploadedPreparedZkeyCmd: AddCmdFn = (cli) => {
  return cli.command(
    "upload-final-zkey",
    "Uploads the prepared zkey file to the given s3 compatible bucket",
    (args) => args
      .option("forceRecreate", {
        alias: ["f", "force-recreate"],
        describe: "Force to recreate the collaboration and the beacon with new random values",
        type: "boolean",
        default: false,
      }),
    async (args) => {
      return uploadPreparedZkeyCmd(args.forceRecreate);
    },
  );
};
