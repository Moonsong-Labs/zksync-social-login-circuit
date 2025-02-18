export function intoChunks<T>(arr: T[], chunkSize: number): T[][] {
  const res: T[][] = [];

  arr.forEach((t: T, index: number) => {
    if (index % chunkSize === 0) {
      res.push([]);
    }

    res.at(-1)!.push(t);
  });

  return res;
}

export function base64UrlDecode(base64UrlString: string) {
  // 1. Replace URL-unsafe characters with standard base64 characters
  let base64 = base64UrlString.replace(/-/g, "+").replace(/_/g, "/");

  // 2. Add padding if necessary (atob() requires correctly padded input)
  while (base64.length % 4) {
    base64 += "=";
  }

  // 3. Decode the base64 string
  const binaryString = atob(base64);

  // 4. Convert the binary string to a Uint8Array
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}
