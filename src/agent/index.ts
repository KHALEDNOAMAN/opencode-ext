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
    'chat.message': async (input, output) => {
      if (!input.agent || !output.message.model) return

      const routes = config.agents[input.agent]
      if (!routes || routes.length === 0) return

      for (const route of routes) {
        if (
          route.when.model !== output.message.model.modelID ||
          route.when.provider !== output.message.model.providerID ||
          (route.when.variant !== undefined &&
            route.when.variant !== input.variant)
        )
          continue

        const before = {
          modelID: output.message.model.modelID,
          providerID: output.message.model.providerID,
        }

        output.message.model.modelID = route.use.model
        output.message.model.providerID = route.use.provider

        logger.info({
          agent: input.agent,
          before,
          after: output.message.model,
          route,
        })

        break
      }
    },
  }
}
