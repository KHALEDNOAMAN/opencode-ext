export const BLOCKED_MESSAGE = [
  'Failed to execute: `{{COMMAND}}`. **REASON**: `{{PATTERN}}` is restricted!',
  'Continue with any remaining tasks that do not require this command. If further progress requires this command, stop and ask the user to run it.',
  '**IMPORTANT**: DO NOT ATTEMPT TO BYPASS THIS RESTRICTION UNDER ANY CIRCUMSTANCES!',
].join('\n')

export const ALLOWED_PATTERNS: string[] = [...npxCommand('next lint')]

export const BLOCKED_PATTERNS: string[] = [
  ...npmRunCommand('dev'),
  ...npmRunCommand('start'),
  ...npmRunCommand('serve'),

  ...npxCommand('vite'),
  ...npxCommand('vite dev'),
  ...npxCommand('vite preview'),
  ...npxCommand('next'),
  ...npxCommand('nodemon'),
  ...npxCommand('tsx watch'),
  ...npxCommand('tsx --watch'),
  ...npxCommand('ts-node-dev'),
  ...npxCommand('react-scripts start'),

  ...npxCommand('serve'),
  ...npxCommand('http-server'),
  ...npxCommand('live-server'),

  ...npxCommand('remix dev'),
  ...npxCommand('astro dev'),
  ...npxCommand('expo start'),
  ...npxCommand('svelte-kit dev'),

  ...npxCommand('hexo server'),
  ...npxCommand('gatsby develop'),
  ...npxCommand('solid-start dev'),
  ...npxCommand('quartz build --serve'),
  ...npxCommand('vue-cli-service serve'),

  'pm2 start',
  'node --watch',
]

function npmRunCommand(commands: string): string[] {
  return [
    `nr ${commands}`,
    `bun ${commands}`,
    `pnpm ${commands}`,
    `yarn ${commands}`,
    `npm run ${commands}`,
    `bun run ${commands}`,
    `yarn run ${commands}`,
    `pnpm run ${commands}`,
  ]
}

function npxCommand(commands: string): string[] {
  return [
    `nlx ${commands}`,
    `npx ${commands}`,
    `bunx ${commands}`,
    `pnpx ${commands}`,
    `yarnx ${commands}`,
    `npm exec ${commands}`,
    `bun exec ${commands}`,
    `pnpm exec ${commands}`,
    `yarn exec ${commands}`,
    `pnpm dlx ${commands}`,
    `yarn dlx ${commands}`,
  ]
}
