import { logger } from './logger.js'

const SPLITTERS = [';', '&', '&&', '|', '||', '<', '>', '<<', '>>'] as const
const SPLIT_REGEX = new RegExp(
  SPLITTERS.map((splitter) => `(\\${splitter.split('').join('\\')})`).join('|'),
  'gm'
)

type PatternMatcherInput = {
  command: string
  priority: 'blacklist' | 'whitelist'
  whitelist: string[]
  blacklist: string[]
}

export async function patternMatcher({
  command,
  priority,
  whitelist,
  blacklist,
}: PatternMatcherInput): Promise<null | string> {
  const commands = command
    .toLowerCase()
    .replaceAll(/\s+/gm, ' ')
    .split(SPLIT_REGEX)
    .map((cmd) => cmd?.trim?.())
    .filter(Boolean)

  if (priority === 'whitelist') {
    for (let i = 0; i < blacklist.length; i++) {
      const pattern = blacklist[i]

      for (let j = 0; j < commands.length; j++) {
        const commandPart = commands[j]
        const blocked = isCmdEqual(commandPart, pattern)
        logger.debug(
          `"${commandPart}" is blocked by pattern "${pattern}": ${blocked}`
        )

        if (blocked) {
          const allowed = whitelist.some((item) =>
            isCmdEqual(commandPart, item)
          )
          if (!allowed) {
            logger.debug(
              `"${commandPart}" is blocked by pattern "${pattern}" and not allowed by whitelist.`
            )

            return pattern
          }
        }
      }
    }

    return null
  }

  if (priority === 'blacklist') {
    for (let i = 0; i < whitelist.length; i++) {
      const pattern = whitelist[i]

      for (let j = 0; j < commands.length; j++) {
        const commandPart = commands[j]
        const allowed = isCmdEqual(commandPart, pattern)
        logger.debug(
          `"${commandPart}" is allowed by pattern "${pattern}": ${allowed}`
        )

        if (allowed) {
          const blocked = blacklist.find((item) =>
            isCmdEqual(commandPart, item)
          )
          if (blocked) {
            logger.debug(
              `"${commandPart}" is allowed by pattern "${pattern}" but blocked by pattern "${blocked}".`
            )

            return blocked
          }
        }
      }
    }

    return null
  }

  throw new Error(
    `Unknown priority: "${priority}". Expected "blacklist" or "whitelist".`
  )
}

function isCmdEqual(command: string, pattern: string): boolean {
  if (command === pattern || command.startsWith(`${pattern} `)) return true

  for (let i = 0; i < SPLITTERS.length; i++) {
    const splitter = SPLITTERS[i]

    if (
      command.startsWith(`${pattern}${splitter}`) ||
      command.startsWith(`${pattern} ${splitter}`) ||
      command.includes(`${splitter}${pattern}`) ||
      command.includes(`${splitter} ${pattern}`)
    ) {
      return true
    }
  }

  return false
}
