import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import type { AddCmdFn } from "../base-cli.js";
import { createS3Client, downloadS3File, getGreatestContribution, uploadFile } from "../lib/buckets.js";
import { MAIN_CIRCUIT_NAME } from "../paths.js";
import { beaconZkeyCmd, finalZkeyPath } from "./beacon-zkey-cmd.js";
import { contributionFileName, contributionFilePath } from "./contribute-zkey-cmd.js";

export async function ceremonyFinishCmd() {
  const client = createS3Client();

  const latestOrder = await getGreatestContribution(client);
  const latestFileName = contributionFileName(MAIN_CIRCUIT_NAME, latestOrder);

  const buf = await downloadS3File(client, latestFileName);
  writeFileSync(contributionFilePath(MAIN_CIRCUIT_NAME, latestOrder), buf);

  await beaconZkeyCmd(MAIN_CIRCUIT_NAME, latestOrder);
  const newZkey = finalZkeyPath(MAIN_CIRCUIT_NAME);
  const newFileContent = readFileSync(newZkey);
  await uploadFile(client, newFileContent, path.parse(newZkey).base);
  console.log("ok");
}

export const addCeremonyFinishCmd: AddCmdFn = (cli) => {
  return cli.command(
    "ceremony-finish",
    "Contributes to ceremony",
    {},
    async () => ceremonyFinishCmd(),
  );
};
