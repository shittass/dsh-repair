#!/usr/bin/env node
/**
 * Launch the pinned harness CLI from this distribution, so one install exposes `dsh`.
 *
 * The built entry is imported in-process rather than spawned: no child process, no shell, and
 * argv reaches the CLI exactly as the user typed it (`runCli` reads `process.argv` itself).
 */
import { runCli } from '@deepseek-ai/dsh/lib/bin.js'

await runCli()
