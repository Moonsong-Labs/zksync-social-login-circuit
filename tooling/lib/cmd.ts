import { spawn } from "node:child_process";
import { join } from "node:path";

const thisDir = import.meta.dirname;
export const ROOT_DIR = join(thisDir, "..", "..");

export async function cmd(strCmd: string): Promise<void> {
  const [first, ...rest] = strCmd.split(/\s+/);

  if (!first) {
    throw new Error("strCmd cannot be empty");
  }

  return new Promise<void>((resolve, reject) => {
    const spawned = spawn(first, rest, { stdio: "inherit", cwd: ROOT_DIR });
    spawned.on("close", () => resolve());
    spawned.on("error", () => reject());
    spawned.on("exit", (code) => code == 0 ? resolve() : reject(new Error(`cmd \`${strCmd}\` failed. exit code: ${code}`)));
    spawned.on("disconnect", () => reject());
  });
}
