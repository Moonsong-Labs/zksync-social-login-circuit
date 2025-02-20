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
  let base64 = base64UrlString.replaceAll("-", "+").replaceAll("_", "/");

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

export function decodeHex(hexString: string): Uint8Array {
  // Remove any leading/trailing whitespace and ensure even number of hex characters
  if (hexString.startsWith("0x")) {
    hexString = hexString.substring(2);
  }

  hexString = hexString.trim();
  if (hexString.length % 2 !== 0) {
    throw new Error("Invalid hex string: must have an even number of characters");
  }

  const len = hexString.length / 2;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    const hexByte = hexString.substring(i * 2, i * 2 + 2);
    const byte = parseInt(hexByte, 16);
    if (isNaN(byte)) {
      throw new Error("Invalid hex string: contains non-hex characters");
    }
    bytes[i] = byte;
  }

  return bytes;
}

export function encodeHex(bytes: Uint8Array): string {
  const parts: string[] = ["0x"];
  const hexChars = "0123456789abcdef";
  for (const byte of bytes) {
    const leftHalf = (byte & 0b11110000) >> 4;
    const rightHalf = byte & 0b00001111;
    parts.push(`${hexChars[leftHalf]}${hexChars[rightHalf]}`);
  }

  return parts.join("");
}

export function base64UrlEncode(bytes: Uint8Array): string {
  let base64 = "";
  const encodings = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  for (let i = 0; i < bytes.length; i += 3) {
    const byte1 = bytes[i]!;
    const byte2 = i + 1 < bytes.length ? bytes[i + 1]! : 0;
    const byte3 = i + 2 < bytes.length ? bytes[i + 2]! : 0;

    const triplet = (byte1 << 16) | (byte2 << 8) | byte3;

    for (let j = 0; j < 4; j++) {
      if (i * 8 + j * 6 > bytes.length * 8) {
        base64 += "=";
      } else {
        base64 += encodings[(triplet >>> 6 * (3 - j)) & 0x3F];
      }
    }
  }

  base64 = base64.replaceAll("+", "-").replaceAll("/", "_");

  while (base64.length % 4) {
    base64 += "=";
  }

  return base64;
}
