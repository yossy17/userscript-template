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
        let code = buildMeta(metadata, isDev) + "\n" + chunk.code;

        // 開発モードの場合、リロード検知機能を追加
        if (isDev) {
          const devCode = `
            // 🔧 Development Mode Features
            (function() {
              const DEV_SERVER = 'http://localhost:3000';
              let lastCheck = Date.now();
              
              // Violetmonkey用のリロード検知
              function checkForUpdates() {
                fetch(DEV_SERVER + '/userscript.user.js?' + Date.now(), { 
                  method: 'HEAD',
                  cache: 'no-store'
                })
                .then(response => {
                  const lastModified = new Date(response.headers.get('last-modified')).getTime();
                  if (lastModified > lastCheck) {
                    console.log('🔄 Script updated, reloading page...');
                    lastCheck = lastModified;
                    setTimeout(() => location.reload(), 100);
                  }
                })
                .catch(() => {
                  // 開発サーバーが停止している場合は無視
                });
              }
              
              // 3秒ごとに更新チェック
              if (typeof setInterval !== 'undefined') {
                setInterval(checkForUpdates, 3000);
              }
              
              // 開発モード表示
              console.log('%c🚀 Development Mode Active', 'color: #4CAF50; font-weight: bold; font-size: 16px;');
              console.log('%cWatching for changes...', 'color: #2196F3; font-size: 12px;');
            })();

          `;
          code = code + devCode;
        }

        chunk.code = code;
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
