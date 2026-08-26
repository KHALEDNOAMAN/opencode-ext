import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import z from 'zod'
import { envConfigSchema } from '../config/config-schema.js'
import { pickFirst, uniqueArrayOfStrings } from './lib/utils.js'

const envRootConfigSchema = z.object({ env: envConfigSchema }).partial()

async function readEnvConfigFile(
  input: string
): Promise<z.infer<typeof envConfigSchema>> {
  try {
    const data = await fs.readFile(input, 'utf-8')
    const config = await envRootConfigSchema.parseAsync(JSON.parse(data))
    return config.env ?? (await envConfigSchema.parseAsync({}))
  } catch {
    return await envConfigSchema.parseAsync({})
  }
}

const GLOBAL_CONFIG_PATH = path.join(os.homedir(), '.opencode-ext.json')
const globalConfigPromise = readEnvConfigFile(GLOBAL_CONFIG_PATH)

export type ResolvedEnvConfig = Awaited<ReturnType<typeof resolveEnvConfig>>

export async function resolveEnvConfig(workdir: string) {
  const projectConfigPath = path.join(workdir, '.opencode-ext.json')
  const opencodeConfigPath = path.join(workdir, '.opencode', 'ext.json')

  const [globalConfig, projectConfig, opencodeConfig] = await Promise.all([
    globalConfigPromise,
    readEnvConfigFile(projectConfigPath),
    readEnvConfigFile(opencodeConfigPath),
  ])

  return {
    vars: {
      ...(pickFirst(
        opencodeConfig.disableGlobal,
        projectConfig.disableGlobal,
        globalConfig.disableGlobal
      )
        ? {}
        : globalConfig.define),

      ...projectConfig.define,
      ...opencodeConfig.define,
    },

    files: uniqueArrayOfStrings([
      ...(pickFirst(
        opencodeConfig.disableGlobal,
        projectConfig.disableGlobal,
        globalConfig.disableGlobal
      )
        ? []
        : (globalConfig.files ?? [])),

      ...(projectConfig.files ?? []),
      ...(opencodeConfig.files ?? []),
    ]),

    disableCwdEnv:
      pickFirst(
        opencodeConfig.disableCwdEnv,
        projectConfig.disableCwdEnv,
        globalConfig.disableCwdEnv
      ) ?? false,

    disableDirenv:
      pickFirst(
        opencodeConfig.disableDirenv,
        projectConfig.disableDirenv,
        globalConfig.disableDirenv
      ) ?? false,

    disableCwdDirenv:
      pickFirst(
        opencodeConfig.disableCwdDirenv,
        projectConfig.disableCwdDirenv,
        globalConfig.disableCwdDirenv
      ) ?? false,
  }
}
