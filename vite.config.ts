import { defineConfig } from "vite";
import path from "path";
import { metadata as rawMetadata } from "./src/metadata.js";
import fs from "fs";
import { fileURLToPath } from "url";

// ES modules での __dirname 取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));

function buildMeta(metadata, isDev = false) {
  const metaData = {
    ...metadata,
    version: isDev ? pkg.version + "-dev" : pkg.version,
    name: isDev
      ? {
          en: metadata.name.en + " (DEV)",
          ja: metadata.name.ja + " (開発版)",
          "zh-CN": metadata.name["zh-CN"] + " (开发版)",
          ko: metadata.name.ko + " (개발판)",
        }
      : metadata.name,
  };

  let metaBlock = "// ==UserScript==\n";

  for (const [key, value] of Object.entries(metaData)) {
    if (!value) continue;

    if (
      (key === "name" || key === "description") &&
      typeof value === "object"
    ) {
      for (const [lang, text] of Object.entries(value)) {
        if (lang === "en") {
          metaBlock += `// @${key} ${text}\n`;
        } else {
          metaBlock += `// @${key}:${lang} ${text}\n`;
        }
      }
      continue;
    }

    if (Array.isArray(value)) {
      for (const v of value) {
        metaBlock += `// @${key} ${v}\n`;
      }
    } else {
      metaBlock += `// @${key} ${value}\n `;
    }
  }

  metaBlock += "// ==/UserScript==\n";
  return metaBlock;
}

const metadata = {
  ...rawMetadata,
  version: pkg.version,
};

function userscriptMetaPlugin(isDev = false) {
  return {
    name: "userscript-meta",
    generateBundle(options, bundle) {
      const fileName = "userscript.user.js";
      const chunk = bundle[fileName];
      if (chunk && chunk.type === "chunk") {
        chunk.code = buildMeta(metadata, isDev) + "\n" + chunk.code;
      }
    },
  };
}

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    build: {
      emptyOutDir: true,
      minify: false,
      sourcemap: isDev,
      lib: {
        entry: path.resolve(__dirname, "src/main.ts"),
        formats: ["iife"],
        name: "Userscript",
        fileName: () => "userscript.user.js",
      },
      rollupOptions: {
        plugins: [userscriptMetaPlugin(isDev)],
      },
      terserOptions: {
        compress: true,
        format: {
          comments: false,
        },
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode || "production"),
    },
  };
});
