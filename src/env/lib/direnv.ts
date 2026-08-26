import { spawnSync } from 'child_process'
import { logger } from './logger.js'

const DIRENV_SYSTEM_ENVS: string[] = [
  'DIRENV_DIFF',
  'DIRENV_DIR',
  'DIRENV_FILE',
  'DIRENV_WATCHES',
  'XPC_SERVICE_NAME',
]

type Environment = Record<string, string>

export async function getDirenvVars(
  cwd: string,
  env: Environment
): Promise<Environment> {
  try {
    const result = spawnSync('direnv', ['export', 'json'], {
      cwd,
      shell: true,
      env: {
        ...process.env,
        ...env,
      },
    })

    const raw = result.stdout.toString().trim()
    const parsed = JSON.parse(raw)

    for (const key in parsed) {
      if (DIRENV_SYSTEM_ENVS.includes(key)) {
        delete parsed[key]
      }
    }

    return parsed
  } catch (error) {
    logger.error(`Error getting direnv vars: ${error}`)
    return {}
  }
}
