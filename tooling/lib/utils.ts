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
