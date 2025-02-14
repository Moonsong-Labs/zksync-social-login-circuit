import path from "node:path";

import { cmd } from "./lib/cmd.js";

export async function generateVerifier(circuit: string, outFile: string | null): Promise<void> {
  const fileData = path.parse(circuit);
  const name = fileData.name;
  const outPath = outFile === null
    ? `target/${name}/verifier.sol`
    : outFile;
  const zkey = `target/${name}/${name}.zkey`;

  await cmd(`snarkjs zkey export solidityverifier ${zkey} ${outPath}`);
}
