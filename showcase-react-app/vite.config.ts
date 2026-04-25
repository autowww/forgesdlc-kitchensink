import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const here = dirname(fileURLToPath(import.meta.url))
const entry = resolve(here, "src", "main.tsx")
const rs = (sub: string) => resolve(here, "node_modules", sub)

export default defineConfig({
  plugins: [react()],
  // Files under ../react/ resolve "react" from the monorepo edge; force app node_modules.
  resolve: {
    alias: {
      react: rs("react"),
      "react/jsx-runtime": rs("react/jsx-runtime.js"),
      "react/jsx-dev-runtime": rs("react/jsx-dev-runtime.js"),
      "react-dom": rs("react-dom"),
      "react-dom/client": rs("react-dom/client.js"),
    },
  },
  build: {
    emptyOutDir: true,
    lib: {
      entry,
      name: "KsReactPrimitivesShowcase",
      fileName: () => "react-primitives-demo",
      formats: ["iife"],
    },
    rollupOptions: {
      output: {
        entryFileNames: "react-primitives-demo.js",
        inlineDynamicImports: true,
        extend: true,
      },
    },
    outDir: "dist",
  },
  publicDir: "public",
})
