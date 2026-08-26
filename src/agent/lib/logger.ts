import consola from 'consola'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { packageJSON } from '../../package.js'

function createStream() {
  const logDir = path.resolve(os.tmpdir(), `.${packageJSON.name}-agent-logs`)

  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }

  const logFilename = `${packageJSON.version}@${Date.now().toString()}.log`
  const logFilePath = path.join(logDir, logFilename)

  const stream = fs.createWriteStream(logFilePath, { flags: 'a' })
  return stream as unknown as NodeJS.WriteStream
}

export const logger = consola.create(
  process.env.OPENCODE_EXT_AGENT_ENABLE_LOG === 'true'
    ? { stdout: createStream() }
    : { level: -1 }
)
