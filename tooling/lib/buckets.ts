import { GetObjectCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

import { env, envOrDefault } from "./env.js";
import type { Readable } from "stream";
import { MAIN_CIRCUIT_NAME } from "../paths.js";

export async function uploadFile(client: S3Client, body: Buffer, key: string): Promise<void> {
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
    queueSize: Number(envOrDefault("BUCKET_UPLOAD_QUEUE_SIZE", "1")),
    partSize: 1024 * 1024 * 5, // 5MB
  });

  upload.on("httpUploadProgress", (progress) => {
    console.log(`${progress.loaded} / ${progress.total}`);
  });

  await upload.done();
}

export const BUCKET_NAME = env("BUCKET_ENDPOINT");

export function createS3Client(): S3Client {
  return new S3Client({
    forcePathStyle: false,
    endpoint: env("BUCKET_ENDPOINT"),
    bucketEndpoint: true,
    region: envOrDefault("BUCKET_REGION", "us-east-1"),
    credentials: {
      accessKeyId: env("BUCKET_KEY"),
      secretAccessKey: env("BUCKET_SECRET"),
    },
  });
}

export async function readStreamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", () => reject(new Error("Error reading stram")));
  });
}

export async function downloadS3File(client: S3Client, key: string): Promise<Buffer> {
  console.log(`Downloading ${key} from bucket...`);
  const getObjCmd = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });
  const getObjResponse = await client.send(getObjCmd);
  return readStreamToBuffer(getObjResponse.Body as Readable);
}

export async function listObjectKeys(client: S3Client, prefix: string): Promise<string[]> {
  const searchObjects = new ListObjectsV2Command({
    Bucket: BUCKET_NAME,
    Prefix: prefix,
  });

  const objs = await client.send(searchObjects);

  if (!objs.Contents) {
    throw new Error("Ceremony not started in current bucket");
  }

  return objs
    .Contents
    .filter((obj) => obj !== undefined)
    .map((obj) => obj.Key!);
}

export async function getGreatestContribution(client: S3Client): Promise<number> {
  const keys = await listObjectKeys(client, MAIN_CIRCUIT_NAME);
  const regex = new RegExp(`^${MAIN_CIRCUIT_NAME}\\.(\\d\\d\\d)\\.zkey$`);
  const previousContributions = keys
    .filter((key) => regex.test(key))
    .sort();

  const latest = previousContributions.at(-1);

  if (!latest) {
    throw new Error("Ceremony not started in this bucket");
  }

  const match = latest.match(regex);
  if (match === null) {
    throw new Error("Wrong contribution name");
  }

  return Number(match[1]);
}
