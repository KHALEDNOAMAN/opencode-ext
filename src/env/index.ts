import type { Plugin } from '@opencode-ai/plugin'
import { packageJSON } from '../package.js'
import { resolveEnvConfig } from './config-resolver.js'
import { getDirenvVars } from './lib/direnv.js'
import { readDotenvFiles } from './lib/dotenv.js'
import { logger } from './lib/logger.js'

logger.info(`${packageJSON.name}@${packageJSON.version} env init!`)

// eslint-disable-next-line func-style
export const OpenCodeExtEnv: Plugin = async ({ directory }) => {
  const config = await resolveEnvConfig(directory)
  logger.info(`Config for "${directory}": ${JSON.stringify(config)}`)

  const projectEnvVars = await readDotenvFiles(directory, config.files)
  const projectDirenvVars = config.disableDirenv
    ? {}
    : await getDirenvVars(directory, {
        ...config.vars,
        ...projectEnvVars,
      })

  logger.info(`Project Dotenv vars: ${JSON.stringify(projectEnvVars)}`)
  logger.info(`Project Direnv vars: ${JSON.stringify(projectDirenvVars)}`)

  return {
    'shell.env': async (input, output) => {
      let resolvedVars = {
        ...config.vars,
        ...projectEnvVars,
        ...projectDirenvVars,
      }

      if (input.cwd !== directory) {
        if (!config.disableCwdEnv) {
          const cwdEnvVars = await readDotenvFiles(input.cwd, config.files)
          logger.info(`CWD Dotenv vars: ${JSON.stringify(cwdEnvVars)}`)
          resolvedVars = { ...resolvedVars, ...cwdEnvVars }
        }

        if (!config.disableDirenv && !config.disableCwdDirenv) {
          const cwdDirenvVars = await getDirenvVars(input.cwd, resolvedVars)
          logger.info(`CWD Direnv vars: ${JSON.stringify(cwdDirenvVars)}`)
          resolvedVars = { ...resolvedVars, ...cwdDirenvVars }
        }
      }

      logger.info(`Injected Environment vars: ${JSON.stringify(resolvedVars)}`)
      Object.assign(output.env, resolvedVars)
    },
  }
}
