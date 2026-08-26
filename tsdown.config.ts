import path from 'path'
import { defineConfig } from 'tsdown'
import packageJSON from './package.json' with { type: 'json' }

export default defineConfig((args) => {
  return {
    name: packageJSON.name,
    entry: {
      index: './src/index.ts',
      bin: './src/cli/bin.ts',
    },

    clean: true,
    minify: true,
    outDir: './dist',

    target: 'ES6',
    tsconfig: './tsconfig.json',

    define: {
      ...(args.watch
        ? {
            'process.env.OPENCODE_EXT_ENV_LOG_ENABLED': JSON.stringify('true'),
            'process.env.OPENCODE_EXT_ENV_LOG_PATH': JSON.stringify(
              path.join(process.cwd(), './tmp')
            ),
            'process.env.OPENCODE_EXT_ARMOR_ENABLE_LOG':
              JSON.stringify('true'),
          }
        : {}),
    },

    deps: {
      neverBundle: [
        /node:/gim,
        ...getExternal(packageJSON),
      ],
    },
  }
})

function getExternal(packageMetadata: {
  dependencies?: Record<string, string>
}) {
  return Object.keys(packageMetadata.dependencies ?? {}).map(
    (dependency) => new RegExp(`(^${dependency}$)|(^${dependency}/)`)
  )
}
