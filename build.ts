/* 
This script was taken from hono https://github.com/honojs/hono/blob/main/build.ts
Everything below is theres
*/
/*
  This script is heavily inspired by `built.ts` used in @kaze-style/react.
  https://github.com/taishinaritomi/kaze-style/blob/main/scripts/build.ts
  MIT License
  Copyright (c) 2022 Taishi Naritomi
*/

import { exec } from "child_process"
import fs from "fs"
import path from "path"
import { build } from "esbuild"
import type { Plugin, PluginBuild, BuildOptions } from "esbuild"
import glob from "glob"

// Plugin to fix CommonJS imports by appending .cjs to require statements
const fixCjsImportsPlugin = (): Plugin => ({
  name: "fix-cjs-imports",
  setup(build: PluginBuild) {
    // Run in the onEnd hook after all files have been written
    build.onEnd((result) => {
      // Only proceed if the build is successful
      if (result.errors.length === 0) {
        // Get the output directory from the build options
        const outdir = build.initialOptions.outdir
        if (!outdir) return

        // Find all .cjs files in the output directory
        const files = glob.sync(`${outdir}/**/*.cjs`)

        files.forEach((file) => {
          let content = fs.readFileSync(file, "utf8")

          // Replace all require('./something') with require('./something.cjs')
          content = content.replace(/require\(["'](\.[^"']+)["']\)/g, (match, importPath) => {
            // Don't add .cjs if it already has an extension
            if (path.extname(importPath) !== "") {
              return match
            }
            return `require('${importPath}.cjs')`
          })

          fs.writeFileSync(file, content)
        })
      }
    })
  }
})

const entryPoints = glob.sync("./src/**/*.ts", {
  ignore: ["./src/**/*.test.ts", "./src/mod.ts", "./src/middleware.ts", "./src/deno/**/*.ts"]
})

/*
  This plugin is inspired by the following.
  https://github.com/evanw/esbuild/issues/622#issuecomment-769462611
*/
const addExtension = (extension: string = ".js", fileExtension: string = ".ts"): Plugin => ({
  name: "add-extension",
  setup(build: PluginBuild) {
    build.onResolve({ filter: /.*/ }, (args) => {
      if (args.importer) {
        const p = path.join(args.resolveDir, args.path)
        let tsPath = `${p}${fileExtension}`

        let importPath = ""
        if (fs.existsSync(tsPath)) {
          importPath = args.path + extension
        } else {
          tsPath = path.join(args.resolveDir, args.path, `index${fileExtension}`)
          if (fs.existsSync(tsPath)) {
            if (args.path.endsWith("/")) {
              importPath = `${args.path}index${extension}`
            } else {
              importPath = `${args.path}/index${extension}`
            }
          }
        }
        return { path: importPath, external: true }
      }
    })
  }
})

const commonOptions: BuildOptions = {
  entryPoints,
  logLevel: "info",
  platform: "node",
  tsconfig: "tsconfig.json",
  target: "es2022"
}

const cjsBuild = () =>
  build({
    ...commonOptions,
    outbase: "./src",
    outdir: "./dist/cjs",
    format: "cjs",
    outExtension: { ".js": ".cjs" },
    plugins: [fixCjsImportsPlugin()],
    tsconfig: "tsconfig.cjs.json"
  })

const esmBuild = () =>
  build({
    ...commonOptions,
    bundle: true,
    outbase: "./src",
    outdir: "./dist",
    format: "esm",
    plugins: [addExtension(".js")]
  })

Promise.all([esmBuild(), cjsBuild()])

exec(`tsc --emitDeclarationOnly --declaration --project tsconfig.build.json`)
