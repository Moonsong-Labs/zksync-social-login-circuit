import { randomBytes } from "node:crypto";

import { type AddCmdFn } from "../base-cli.js";
import { cmd } from "../lib/cmd.js";
import { contributionFilePath } from "./contribute-zkey-cmd.js";

export function finalZkeyPath(name: string): string {
  return `target/${name}/${name}.final.zkey`;
}

export async function beaconZkeyCmd(name: string, currentOrder: number) {
  const phase2Zkey = contributionFilePath(name, currentOrder);
  const finalZkey = finalZkeyPath(name);
  const beacon = randomBytes(32).toString("hex");
  await cmd(`snarkjs zkb ${phase2Zkey} ${finalZkey} ${beacon} 10 -v`);
}

export const addContributeZkeyCmd: AddCmdFn = (cli) => {
  return cli.command("prepare-zkey <circuit> <order> <contributor>", "downloads perpetual power of tau file",
    (args) => args
      .positional("name", {
        type: "string",
        demandOption: true,
      })
      .positional("order", {
        type: "number",
        demandOption: true,
        description: "zkey file number to apply contribution",
      }),
    async (argv) => {
      await beaconZkeyCmd(argv.name, argv.order);
    });
};
