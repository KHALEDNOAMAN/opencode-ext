import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import z from 'zod'
import { armorConfigSchema } from '../config/config-schema.js'
import { ALLOWED_PATTERNS, BLOCKED_PATTERNS } from './constants.js'
import { pickFirst } from './lib/utils.js'

const armorRootConfigSchema = z.object({ armor: armorConfigSchema }).partial()

async function readArmorConfigFile(
  input: string
): Promise<z.infer<typeof armorConfigSchema>> {
  try {
    const data = await fs.readFile(input, 'utf-8')
    const config = await armorRootConfigSchema.parseAsync(JSON.parse(data))
    return config.armor ?? (await armorConfigSchema.parseAsync({}))
  } catch {
    return await armorConfigSchema.parseAsync({})
  }
}

const GLOBAL_CONFIG_PATH = path.join(os.homedir(), '.opencode-ext.json')
const globalConfigPromise = readArmorConfigFile(GLOBAL_CONFIG_PATH)

export type ResolvedArmorConfig = Awaited<ReturnType<typeof resolveArmorConfig>>

export async function resolveArmorConfig(workdir: string) {
  const projectConfigPath = path.join(workdir, '.opencode-ext.json')
  const opencodeConfigPath = path.join(workdir, '.opencode', 'ext.json')

  const [globalConfig, projectConfig, opencodeConfig] = await Promise.all([
    globalConfigPromise,
    readArmorConfigFile(projectConfigPath),
    readArmorConfigFile(opencodeConfigPath),
  ])

  return {
    armor: {
      priority:
        pickFirst(
          opencodeConfig.priority,
          projectConfig.priority,
          globalConfig.priority
        ) ?? 'whitelist',

      blacklist: [
        ...(opencodeConfig.blacklist?.commands ?? []),
        ...(projectConfig.blacklist?.commands ?? []),

        ...(pickFirst(
          opencodeConfig.blacklist?.disableGlobal,
          projectConfig.blacklist?.disableGlobal,
          globalConfig.blacklist?.disableGlobal
        )
          ? []
          : (globalConfig.blacklist?.commands ?? [])),

        ...(pickFirst(
          opencodeConfig.blacklist?.disableDefaults,
          projectConfig.blacklist?.disableDefaults,
          globalConfig.blacklist?.disableDefaults
        )
          ? []
          : BLOCKED_PATTERNS),
      ],

      whitelist: [
        ...(opencodeConfig.whitelist?.commands ?? []),
        ...(projectConfig.whitelist?.commands ?? []),

        ...(pickFirst(
          opencodeConfig.whitelist?.disableGlobal,
          projectConfig.whitelist?.disableGlobal,
          globalConfig.whitelist?.disableGlobal
        )
          ? []
          : (globalConfig.whitelist?.commands ?? [])),

        ...(pickFirst(
          opencodeConfig.whitelist?.disableDefaults,
          projectConfig.whitelist?.disableDefaults,
          globalConfig.whitelist?.disableDefaults
        )
          ? []
          : ALLOWED_PATTERNS),
      ],

      message: pickFirst(
        opencodeConfig.message,
        projectConfig.message,
        globalConfig.message
      )?.trim(),

      command: {
        injectBefore: pickFirst(
          opencodeConfig.command?.before?.command,
          projectConfig.command?.before?.command,
          globalConfig.command?.before?.command
        )
          ?.trim()
          ?.replaceAll(/\n/g, ';'),

        injectBeforeComment: pickFirst(
          opencodeConfig.command?.before?.comment,
          projectConfig.command?.before?.comment,
          globalConfig.command?.before?.comment
        )
          ?.trim()
          ?.replaceAll(/\n/g, ';'),

        injectAfter: pickFirst(
          opencodeConfig.command?.after?.command,
          projectConfig.command?.after?.command,
          globalConfig.command?.after?.command
        )
          ?.trim()
          ?.replaceAll(/\n/g, ';'),

        injectAfterComment: pickFirst(
          opencodeConfig.command?.after?.comment,
          projectConfig.command?.after?.comment,
          globalConfig.command?.after?.comment
        )
          ?.trim()
          ?.replaceAll(/\n/g, ';'),
      },
    },
  }
}
