import path from 'path'
import { defineConfig } from 'tsdown'
import packageJSON from './package.json' with { type: 'json' }

export default defineConfig((args) => {
  return {
    name: packageJSON.name,
    entry: './src/index.ts',

    clean: true,
    minify: true,
    outDir: './dist',

    target: 'ES6',
    tsconfig: './tsconfig.json',

    define: {
      ...(args.watch
        ? {
            'process.env.OPENCODE_ENV_LOG_ENABLED': JSON.stringify('true'),
            'process.env.OPENCODE_ENV_LOG_PATH': JSON.stringify(
              path.join(process.cwd(), './tmp')
            ),
          }
        : {}),
    },

    deps: {
      neverBundle: [
        /node:/gim,
        ...getExternal((packageJSON as any).dependencies),
      ],
    },
  }
})

function getExternal(dependencies: unknown) {
  return Object.keys((dependencies ?? {}) as Record<string, string>).map(
    (dep) => new RegExp(`(^${dep}$)|(^${dep}/)`)
  )
}
