import fs from "node:fs";
import path from "node:path";

import type { AddCmdFn } from "../base-cli.js";
import { cmd, ROOT_DIR } from "../lib/cmd.js";
import { writeFile } from "../lib/fs.js";
import { MAIN_CIRCUIT_NAME, MAIN_CIRCUIT_PATH } from "../paths.js";
import { finalZkeyPath } from "./beacon-zkey-cmd.js";
import { compileCmd } from "./compile-cmd.js";
import { DEFAULT_PTAU, r1csFilePath } from "./create-zkey-cmd.js";

export async function zkeyRecreateCmd(url: string) {
  await compileCmd(MAIN_CIRCUIT_PATH);
  const name = MAIN_CIRCUIT_NAME;
  const response = await fetch(url);
  const zkeyContent = await response.arrayBuffer();
  const ptauPath = path.join(ROOT_DIR, DEFAULT_PTAU);
  const r1csPath = path.join(ROOT_DIR, r1csFilePath(name));
  const zkeyPath = path.join(ROOT_DIR, finalZkeyPath(name));

  const zkeyBuf = Buffer.from(zkeyContent);

  await writeFile(zkeyPath, zkeyBuf);

  try {
    await cmd(`snarkjs zkey verify ${r1csPath} ${ptauPath} ${zkeyPath}`);
  } catch (_e) {
    console.warn("Verification for zkey file failed.");
    fs.rmSync(zkeyPath);
  }
}

export const addZkeyRecreateCmd: AddCmdFn = (cli) => {
  return cli.command(
    "zkey-recreate <url>",
    "Downloads zkey from provided url and verifies that matches with circuit",
    (args) => args.positional("url", {
      type: "string",
      demandOption: true,
    }),
    async (args) => zkeyRecreateCmd(args.url),
  );
};
