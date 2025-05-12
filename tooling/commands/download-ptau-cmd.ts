import { cmd } from "../lib/cmd.js";
import type { AddCmdFn } from "../base-cli.js";
import { DEFAULT_PTAU_SIZE } from "../../lib/constants.js";

export async function downloadPtauCmd(size: number) {
  const formatedSize = size.toString().padStart(2, "0");
  await cmd(`mkdir -p ptaus`);
  await cmd(`curl -o ptaus/ppot_0080_${formatedSize}.ptau https://pse-trusted-setup-ppot.s3.eu-central-1.amazonaws.com/pot28_0080/ppot_0080_${formatedSize}.ptau`);
}

export const addDownloadPtauCmd: AddCmdFn = (cli) => {
  return cli.command("download-ptau <size>", "downloads perpetual power of tau file", {
    size: {
      type: "number",
      demandOption: true,
      default: DEFAULT_PTAU_SIZE,
    },
  }, async (argv) => {
    await downloadPtauCmd(argv.size);
  });
};
