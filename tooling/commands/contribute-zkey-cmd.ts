import { randomBytes } from "node:crypto";

import { type AddCmdFn } from "../base-cli.js";
import { cmd } from "../lib/cmd.js";

function contributionFilePath(name: string, n: number): string {
  const formated = n.toString().padStart(3, "0");
  return `target/${name}/${name}.${formated}.zkey`;
}

export async function contributeZkeyCmd(name: string, currentOrder: number, contributor: string) {
  await cmd(`mkdir -p ptaus`);

  const inZkey = contributionFilePath(name, currentOrder);
  const outZkey = contributionFilePath(name, currentOrder + 1);

  const entropy = randomBytes(32).toString("hex");
  await cmd(`snarkjs zkc ${inZkey} ${outZkey} -e="${entropy}" -n="${contributor}" -v`);
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
      })
      .positional("contributor", {
        type: "string",
        demandOption: true,
        description: "Name of the contributor",
      }),
    async (argv) => {
      await contributeZkeyCmd(argv.name, argv.order, argv.contributor);
    });
};
