# OpenCode Extensions Guide

## What It Does
- Load environment variables into OpenCode sessions
- Restrict long-running bash commands for safety
- Extend agent capabilities with custom hooks

## Installation
```bash
npm install opencode-ext
```

## Configuration
| Option | Type | Description |
|--------|------|-------------|
| envFile | string | Path to .env file |
| timeout | number | Max command runtime (seconds) |
| allowList | string[] | Permitted commands |
| denyList | string[] | Blocked commands |

## Writing Custom Extensions
Extensions follow a simple hook-based pattern:
1. Export a setup function
2. Register hooks for lifecycle events
3. Return cleanup function for teardown