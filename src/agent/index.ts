import type { Plugin } from '@opencode-ai/plugin'
import { packageJSON } from '../package.js'
import { resolveAgentConfig } from './config-resolver.js'
import { logger } from './lib/logger.js'

logger.info(`${packageJSON.name}@${packageJSON.version} agent init!`)

// eslint-disable-next-line func-style
export const OpenCodeExtAgent: Plugin = async ({ directory }) => {
  const config = await resolveAgentConfig(directory)
  logger.info(`Config for "${directory}": ${JSON.stringify(config)}`)

  return {
    'chat.message': async (input: unknown, output: unknown) => {
      const typedInput = input as {
        agent?: string
        model?: { modelID: string; providerID: string; variant?: string }
      }
      const typedOutput = output as {
        message: {
          model: { modelID: string; providerID: string; variant?: string }
        }
      }
      const agentName = typedInput.agent
      const inputModel = typedInput.model
      if (!agentName || !inputModel) return

      const routes = config.agentModels[agentName]
      if (!routes || routes.length === 0) return

      for (const route of routes) {
        const whenMatches =
          route.when.model === inputModel.modelID &&
          route.when.provider === inputModel.providerID &&
          (route.when.variant === undefined ||
            route.when.variant === inputModel.variant)

        if (!whenMatches) continue

        if (!typedOutput.message?.model) return

        const before = {
          modelID: typedOutput.message.model.modelID,
          providerID: typedOutput.message.model.providerID,
          variant: typedOutput.message.model.variant,
        }

        typedOutput.message.model.modelID = route.use.model
        typedOutput.message.model.providerID = route.use.provider
        if (route.use.variant !== undefined) {
          typedOutput.message.model.variant = route.use.variant
        }

        logger.info({
          agent: agentName,
          inputModel,
          outputModel: typedOutput.message.model,
          before,
          route,
        })

        break
      }
    },
  }
}
