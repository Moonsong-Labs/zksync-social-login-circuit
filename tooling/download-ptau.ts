import path from "node:path";

import { cmd } from "./lib/cmd.js";

export function ptauPath(size: number): string {
  return path.join("ptaus", `ppot_0080_${size}.ptau`);
}

export function defaultPtauPath(): string {
  return ptauPath(20);
}

export async function downloadPtau(size: number) {
  const formatedSize = size.toString().padStart(2, "0");
  await cmd(`mkdir -p ptaus`);
  await cmd(`curl -o ptaus/ppot_0080_${formatedSize}.ptau https://pse-trusted-setup-ppot.s3.eu-central-1.amazonaws.com/pot28_0080/ppot_0080_${formatedSize}.ptau`);
}
