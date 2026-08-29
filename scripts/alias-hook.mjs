/**
 * Node resolver hook for the `@/` path alias.
 *
 * `@/` is a TypeScript/Next convention; plain Node knows nothing about it, so
 * any script that imports application code fails with ERR_MODULE_NOT_FOUND.
 * This maps `@/x` to `<project>/x` and appends the extension Node needs, since
 * `--experimental-strip-types` can execute .ts but will not guess the suffix.
 *
 * Used via: node --import ./scripts/alias-hook.mjs script.mjs
 */
import { register } from 'node:module'
import { pathToFileURL } from 'node:url'
import { existsSync } from 'node:fs'
import path from 'node:path'

const root = process.cwd()

const resolver = `
  import { existsSync } from 'node:fs'
  import { pathToFileURL } from 'node:url'
  import path from 'node:path'
  const root = ${JSON.stringify(root)}
  export async function resolve(specifier, context, next) {
    if (!specifier.startsWith('@/')) return next(specifier, context)
    const base = path.join(root, specifier.slice(2))
    for (const candidate of [base, base + '.ts', base + '.tsx', base + '.js', path.join(base, 'index.ts')]) {
      if (existsSync(candidate)) return next(pathToFileURL(candidate).href, context)
    }
    return next(specifier, context)
  }
`

register(`data:text/javascript,${encodeURIComponent(resolver)}`, pathToFileURL('./'))
