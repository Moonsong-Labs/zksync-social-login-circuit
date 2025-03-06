import path from "node:path";

import { cmd } from "./lib/cmd.js";
import { proofPath, publicInputPath } from "./prove.js";
import { verificationKeyPath } from "./verification-key.js";

export async function verifyCmd(filePath: string) {
  const fileData = path.parse(filePath);

  const vkey = verificationKeyPath(fileData.name);
  const pubInputs = publicInputPath(fileData.name);
  const proof = proofPath(fileData.name);

  await cmd(`snarkjs g16v ${vkey} ${pubInputs} ${proof} -v`);
}
