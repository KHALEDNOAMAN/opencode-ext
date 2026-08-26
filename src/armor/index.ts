import type { Plugin } from '@opencode-ai/plugin'
import { packageJSON } from '../package.js'
import { resolveArmorConfig } from './config-resolver.js'
import { BLOCKED_MESSAGE } from './constants.js'
import { logger } from './lib/logger.js'
import { patternMatcher } from './lib/matcher.js'
import { generateCommandWithComment } from './lib/utils.js'

logger.info(`${packageJSON.name}@${packageJSON.version} armor init!`)

// eslint-disable-next-line func-style
export const OpenCodeExtArmor: Plugin = async ({ directory }) => {
  const config = await resolveArmorConfig(directory)
  logger.info(`Config for "${directory}": ${JSON.stringify(config)}`)

  return {
    'tool.execute.before': async (input, output) => {
      if (input.tool === 'bash') {
        logger.info(`Received command for execution: "${output.args.command}"`)

        const command: string = output.args.command ?? ''
        if (command.trim() === '') return

        const blockedPattern = await patternMatcher({
          command,
          priority: config.armor.priority,
          whitelist: config.armor.whitelist,
          blacklist: config.armor.blacklist,
        })

        if (blockedPattern !== null) {
          logger.info(`Command usage restricted: "${command}".`)
          throw new Error(
            (config.armor.message ?? BLOCKED_MESSAGE)
              .replaceAll('{{COMMAND}}', command)
              .replaceAll('{{PATTERN}}', blockedPattern)
          )
        }

        logger.info(
          `Command is allowed: "${command}". Proceeding with execution.`
        )

        if (config.armor.command.injectBefore) {
          const injectedString = generateCommandWithComment(
            config.armor.command.injectBefore + ';',
            config.armor.command.injectBeforeComment
          )

          if (!command.trim().startsWith(injectedString)) {
            output.args.command = `${injectedString}\n${command}`
            logger.info(`Injecting "${injectedString}" before command.`)
          }
        }

        if (config.armor.command.injectAfter) {
          const injectedString = generateCommandWithComment(
            config.armor.command.injectAfter + ';',
            config.armor.command.injectAfterComment
          )

          if (!command.trim().endsWith(injectedString)) {
            output.args.command = `${command}\n${injectedString}`
            logger.info(`Injecting "${injectedString}" after command.`)
          }
        }

        logger.log('Final command to execute:', output.args.command)
      }
    },
  }
}
