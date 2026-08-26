import chalk from 'chalk'
import { spawn } from 'child_process'
import fs from 'fs'
import os from 'os'
import path from 'path'

const PLUGINS_ROOT_DIR = path.join(
  os.homedir(),
  '.cache',
  'opencode',
  'packages'
)

async function updatePlugin(plugin: string) {
  const pluginDirPath = path.join(PLUGINS_ROOT_DIR, `${plugin}@latest`)

  if (!fs.existsSync(pluginDirPath)) {
    return console.error(
      chalk.red(
        `! Plugin ${chalk.bold(plugin)} not found in cache. Skipping update.`
      )
    )
  }

  const packageJsonPath = path.join(pluginDirPath, 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    return console.error(
      chalk.red(
        `! package.json not found for plugin ${chalk.bold(plugin)}. Skipping update.`
      )
    )
  }

  const prevPackageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
  const prevVersion = prevPackageJson?.dependencies?.[plugin] || 'unknown'
  console.log(
    chalk.blue(`> Updating plugin: ${chalk.bold(plugin + prevVersion)}`)
  )

  const child = spawn('npm', ['install', `${plugin}@latest`, '--save'], {
    cwd: pluginDirPath,
    shell: true,
  })

  return await new Promise<string>((resolve, reject) => {
    child.on('error', reject)

    child.on('close', (code) => {
      if (code === 0) {
        const newPackageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, 'utf-8')
        )

        resolve(newPackageJson?.dependencies?.[plugin] || 'unknown')
      } else if (code !== null && code !== 0) {
        reject(
          new Error(`npm install for plugin ${plugin} exited with code ${code}`)
        )
      } else {
        reject(
          new Error(`npm install for plugin ${plugin} was terminated by signal`)
        )
      }
    })
  })
}

export async function updateOpenCodePlugins(...plugins: string[]) {
  const installedPlugins = fs
    .readdirSync(PLUGINS_ROOT_DIR)
    .filter((dir) => dir.endsWith('@latest'))
    .map((dir) => dir.replace('@latest', ''))

  const pluginsToUpdate = plugins.length > 0 ? plugins : installedPlugins

  for (const plugin of pluginsToUpdate) {
    try {
      const newVersion = await updatePlugin(plugin)
      console.log(
        chalk.green(
          `✓ Successfully updated plugin: ${chalk.bold(plugin)} to version ${chalk.yellow(newVersion)}`
        )
      )
    } catch {
      console.error(chalk.red(`! Error updating plugin ${chalk.bold(plugin)}`))
    }
  }
}
