import yargs from "yargs";
import path from "node:path";
import { ROOT_DIR } from "./lib/cmd.js";

export const baseCli = yargs(process.argv.slice(2))
  .scriptName("tooling")
  .strictCommands()
  .demandCommand(1);

export type BaseCli = typeof baseCli;

export type AddCmdFn = (cli: BaseCli) => BaseCli;

export const FILE_ARG_DEF = {
  file: {
    type: "string",
    demandOption: false,
    default: path.join(ROOT_DIR, 'jwt-tx-validation.circom')
  },
} as const;

export const buildCli = (fns: AddCmdFn[]): BaseCli => {
  return fns.reduce((old, fn) => fn(old), baseCli);
};
