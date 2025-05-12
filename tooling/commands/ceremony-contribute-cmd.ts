import { readFileSync } from "node:fs";
import path from "node:path";

import type { AddCmdFn } from "../base-cli.js";
import { createS3Client, downloadS3File, getGreatestContribution, uploadFile } from "../lib/buckets.js";
import { ROOT_DIR } from "../lib/cmd.js";
import { writeFile } from "../lib/fs.js";
import { MAIN_CIRCUIT_NAME } from "../paths.js";
import { contributeZkeyCmd, contributionFileName, contributionFilePath } from "./contribute-zkey-cmd.js";

export async function ceremonyContributeCmd(contributorName: string) {
  const client = createS3Client();

  const latestOrder = await getGreatestContribution(client);
  const latest = contributionFileName(MAIN_CIRCUIT_NAME, latestOrder);

  const buf = await downloadS3File(client, latest);
  const targetFile = contributionFilePath(MAIN_CIRCUIT_NAME, latestOrder);
  const file = path.join(ROOT_DIR, targetFile);

  await writeFile(file, buf);

  await contributeZkeyCmd(MAIN_CIRCUIT_NAME, latestOrder, contributorName);
  const newZkey = contributionFilePath(MAIN_CIRCUIT_NAME, latestOrder + 1);
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
