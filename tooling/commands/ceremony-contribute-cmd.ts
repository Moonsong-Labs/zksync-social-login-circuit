import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { AddCmdFn } from "../base-cli.js";
import { createS3Client, downloadS3File, listObjectKeys, uploadFile } from "../lib/buckets.js";
import { MAIN_CIRCUIT_NAME } from "../paths.js";
import { contributeZkeyCmd } from "./contribute-zkey-cmd.js";

function contributionFilePath(n: number): string {
  const formated = n.toString().padStart(3, "0");
  return `target/${MAIN_CIRCUIT_NAME}/${MAIN_CIRCUIT_NAME}.${formated}.zkey`;
}

export async function ceremonyContributeCmd(contributorName: string) {
  const client = createS3Client();

  const keys = await listObjectKeys(client, MAIN_CIRCUIT_NAME);

  const regex = new RegExp(`^${MAIN_CIRCUIT_NAME}\\.(\\d\\d\\d)\\.zkey$`);
  const previousContributions = keys
    .sort();

  const latest = previousContributions.at(-1);

  if (!latest) {
    throw new Error("Ceremony not started in this bucket");
  }

  const match = latest.match(regex);
  if (match === null) {
    throw new Error("Wrong contribution name");
  }

  const latestOrder = Number(match[1]);

  const buf = await downloadS3File(client, latest);
  writeFileSync(contributionFilePath(latestOrder), buf);

  await contributeZkeyCmd(MAIN_CIRCUIT_NAME, latestOrder, contributorName);
  const newZkey = contributionFilePath(latestOrder + 1);
  const newFileContent = readFileSync(newZkey);
  await uploadFile(client, newFileContent, path.parse(newZkey).base);
  console.log("ok");
}

export const addCeremonyContribute: AddCmdFn = (cli) => {
  return cli.command(
    "ceremony-contribute <name>",
    "Contributes to ceremony",
    (args) => args
      .positional("name", {
        type: "string",
        demandOption: true,
      }),
    async (args) => ceremonyContributeCmd(args.name),
  );
};
