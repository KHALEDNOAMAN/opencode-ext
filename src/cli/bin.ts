#!/usr/bin/env node

import { program } from './args.js'

program.parseAsync(process.argv).catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
