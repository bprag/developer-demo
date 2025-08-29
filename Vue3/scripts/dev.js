import esbuild from 'esbuild'
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const require = createRequire(import.meta.url)

const { values: { format }, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    format: {
      type: "string",
      short: 'f',
      default: 'esm'
    }
  }
})

const target = positionals[0] || 'vue'
const entry = resolve(__dirname, `../packages/${ target }/src/index.ts`)
const outfile = resolve(__dirname, `../packages/${ target }/dist/${ target }.${ format }.js`)
const pkg = require(`../packages/${ target }/package.json`)

esbuild
  .context({
    format,
    outfile,
    platform: format === 'cjs' ? "node" : 'browser',
    sourcemap: true,
    entryPoints: [ entry ],
    globalName: pkg.buildOptions.name,
    bundle: true
  })
  .then((ctx) => ctx.watch())
  .catch(console.error)