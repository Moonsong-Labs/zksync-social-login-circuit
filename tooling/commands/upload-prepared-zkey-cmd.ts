import { existsSync, readFileSync } from "node:fs";

import {
  S3Client,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import type { AddCmdFn } from "../base-cli.js";
import { env, envOrDefault } from "../lib/env.js";
import { MAIN_CIRCUIT_FILE, MAIN_CIRCUIT_NAME } from "../paths.js";
import { preparedZkeyFile, prepareZkeyCmd } from "./prepare-zkey-cmd.js";
import { compileCmd, compiledWasmFile } from "./compile-cmd.js";
import { createZkeyCmd, DEFAULT_PTAU } from "./create-zkey-cmd.js";

async function uploadFile(client: S3Client, body: Buffer, key: string): Promise<void> {
  console.log(`Starting with ${key} upload.`);
  const upload = new Upload({
    client,
    params: {
      Bucket: env("BUCKET_ENDPOINT"),
      Body: body,
      Key: key,
      ContentType: "application/octet-stream",
      ACL: "public-read",
    },
    queueSize: 1,
    partSize: 1024 * 1024 * 5, // 5MB
  });

  upload.on("httpUploadProgress", (progress) => {
    console.log(`${progress.loaded} / ${progress.total}`);
  });

  await upload.done();
}

export async function uploadPreparedZkeyCmd() {
  const wasmPath = compiledWasmFile(MAIN_CIRCUIT_NAME);
  const zkeyPath = preparedZkeyFile(MAIN_CIRCUIT_NAME);

  if (!existsSync(wasmPath)) {
    await compileCmd(MAIN_CIRCUIT_FILE);
  }

  if (!existsSync(zkeyPath)) {
    await createZkeyCmd(MAIN_CIRCUIT_FILE, DEFAULT_PTAU);
    await prepareZkeyCmd(MAIN_CIRCUIT_FILE);
  }

  const zkeyBuffer = readFileSync(zkeyPath);
  const wasmBuffer = readFileSync(wasmPath);
  const endpoint = env("BUCKET_ENDPOINT");

  const client = new S3Client({
    forcePathStyle: false,
    endpoint,
    bucketEndpoint: true,
    region: envOrDefault("BUCKET_REGION", "us-east-1"),
    credentials: {
      accessKeyId: env("BUCKET_KEY"),
      secretAccessKey: env("BUCKET_SECRET"),
    },
  });

  await uploadFile(client, wasmBuffer, `${MAIN_CIRCUIT_NAME}.wasm`);
  await uploadFile(client, zkeyBuffer, `${MAIN_CIRCUIT_NAME}-final.zkey`);

  console.log("Ok!");
}

export const addUploadedPreparedZkeyCmd: AddCmdFn = (cli) => {
  return cli.command(
    "upload-zkey",
    "Uploads the prepared zkey file to the given s3 compatible bucket",
    {},
    async () => {
      return uploadPreparedZkeyCmd();
    },
  );
};
