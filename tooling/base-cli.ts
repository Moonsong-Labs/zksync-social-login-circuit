import yargs from "yargs";

export const baseCli = yargs(process.argv.slice(2))
  .scriptName("tooling")
  .strictCommands()
  .demandCommand(1);

export type BaseCli = typeof baseCli;

export type AddCmdFn = (cli: BaseCli) => BaseCli;

export const FILE_ARG_DEF = {
  file: {
    type: "string",
    demandOption: true,
  },
} as const;

export const buildCli = (fns: AddCmdFn[]): BaseCli => {
  return fns.reduce((old, fn) => fn(old), baseCli);
};
