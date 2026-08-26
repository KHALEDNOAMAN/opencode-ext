import fs from 'fs/promises'
import os from 'os'
import path from 'path'
import z from 'zod'
import { agentsSchema } from '../config/config-schema.js'

const agentRootConfigSchema = z.object({ agents: agentsSchema }).partial()

async function readAgentConfigFile(
  input: string
): Promise<z.infer<typeof agentsSchema>> {
  try {
    const data = await fs.readFile(input, 'utf-8')
    const config = await agentRootConfigSchema.parseAsync(JSON.parse(data))
    return config.agents ?? (await agentsSchema.parseAsync({}))
  } catch {
    return await agentsSchema.parseAsync({})
  }
}

const GLOBAL_CONFIG_PATH = path.join(os.homedir(), '.opencode-ext.json')
const globalConfigPromise = readAgentConfigFile(GLOBAL_CONFIG_PATH)

export type ResolvedAgentConfig = Awaited<ReturnType<typeof resolveAgentConfig>>

export async function resolveAgentConfig(workdir: string) {
  const projectConfigPath = path.join(workdir, '.opencode-ext.json')
  const opencodeConfigPath = path.join(workdir, '.opencode', 'ext.json')

  const [globalConfig, projectConfig, opencodeConfig] = await Promise.all([
    globalConfigPromise,
    readAgentConfigFile(projectConfigPath),
    readAgentConfigFile(opencodeConfigPath),
  ])

  const merged: z.infer<typeof agentsSchema> = {}

  for (const source of [globalConfig, projectConfig, opencodeConfig]) {
    for (const [agent, routes] of Object.entries(source)) {
      if (!merged[agent]) merged[agent] = []
      merged[agent].push(...routes)
    }
  }

  return { agents: merged }
}
