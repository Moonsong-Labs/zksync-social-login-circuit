import { spawn } from "node:child_process"
import { join } from "node:path"

const thisDir = import.meta.dirname

export async function cmd(strCmd: string): Promise<void> {
  const [first, ...rest] = strCmd.split(/\s+/)

  return new Promise<void>((resolve, reject) => {
    const spawned = spawn(first, rest, { stdio: 'inherit', cwd: join(thisDir, '..', '..')  })
    spawned.on('close', (_code) => resolve())
    spawned.on('error', (_code) => reject())
    spawned.on('exit', (_code) => resolve())
    spawned.on('disconnect', () => reject())
  })
}