import { Command } from '@commander-js/extra-typings'
import { packageJSON } from '../package.js'
import { updateOpenCodePlugins } from './update-plugin.js'

export const program = new Command()
  .name(packageJSON.name)
  .description('OpenCode Ext - Extensions for OpenCode')
  .version(packageJSON.version)

program
  .command('update-plugin')
  .description('Update OpenCode plugins in ~/.cache/opencode/packages/')
  .argument('[plugins...]', 'Plugin names to update')
  .action((plugins) => updateOpenCodePlugins(...plugins))
