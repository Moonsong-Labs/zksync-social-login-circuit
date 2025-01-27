import yargs from 'yargs'
import { compileCmd } from './compile.ts';
import { inputCommand } from './generate-input.ts';
import path from 'node:path';
import { witnessCommand } from './witness.ts';
import { zkeyCommand } from './zkey.ts';
import { downloadPtau } from './download-ptau.ts';

const thisDir = import.meta.dir

const baseDir = path.join(thisDir, '..')

let FILE_ARG_DEF = {
  file: {
    type: 'string',
    demandOption: true,
  }
} as const;

await yargs(process.argv.slice(2))
    .scriptName('tooling')
    .command('compile <file>', 'compiles circuit to wasm, sym and r1cs', FILE_ARG_DEF, async (argv) => {
      await compileCmd(argv.file)
    })
    .command('input <file>', 'generates input for circuit if it knows how to.', FILE_ARG_DEF, async (argv) => {
      await inputCommand(argv.file, baseDir)
    })
    .command('witness <file>', 'generate a witness file from an input generated previously', FILE_ARG_DEF, async (argv) => {
      await witnessCommand(argv.file, baseDir)
    })
    .command(
        'zkey <file>',
        'generate a zkey file for a circuit',
        {
          file: FILE_ARG_DEF.file,
          ptau: {
            type: 'string',
            demandOption: false,
            description: 'path to powers of tau file',
            default: 'ptaus/ppot_0080_20.ptau'
          }
        },
        async (argv) => {
          console.warn("For production please use a prepared power of tau.")
          await zkeyCommand(argv.file, argv.ptau)
        })
    .command('download-ptau <size>', 'downloads perpetual power of tau file', {
      size: {
        type: 'number',
        demandOption: true,
        default: 20,
      }
    }, async (argv) => {
      await downloadPtau(argv.size)
    })

    .strictCommands()
    .demandCommand(1)
    .parseAsync()