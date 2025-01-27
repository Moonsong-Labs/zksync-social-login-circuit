import { cmd } from './lib/cmd.ts';

export async function downloadPtau(size: number) {
  const formatedSize = size.toString().padStart(2, '0');
  await cmd(`curl -o ptaus/ppot_0080_${formatedSize}.ptau https://pse-trusted-setup-ppot.s3.eu-central-1.amazonaws.com/pot28_0080/ppot_0080_${formatedSize}.ptau`)
}