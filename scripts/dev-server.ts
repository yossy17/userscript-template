import browserSync from "browser-sync";
import chokidar from "chokidar";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES modules での __dirname 取得
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bs = browserSync.create();

// distフォルダが存在するか確認
function ensureDistFolder() {
  const distPath = "./dist";
  if (!fs.existsSync(distPath)) {
    fs.mkdirSync(distPath, { recursive: true });
    console.log("📁 Created dist folder");
  }
}

// Viteビルドを実行
function buildScript() {
  try {
    console.log("🔨 Building script...");
    ensureDistFolder();

    // より詳細なログでビルド実行
    execSync("bun run build:dev", {
      stdio: "inherit", // ビルドログを表示
      cwd: process.cwd(),
    });

    // ビルド結果を確認
    const scriptPath = "./dist/userscript.user.js";
    if (fs.existsSync(scriptPath)) {
      const stats = fs.statSync(scriptPath);
      console.log(`✅ Build complete (${Math.round(stats.size / 1024)}KB)`);
      return true;
    } else {
      console.error("❌ Build failed: userscript.user.js not found");
      return false;
    }
  } catch (error) {
    console.error("❌ Build failed:", error.message);
    return false;
  }
}

// 初回ビルド
console.log("🚀 Starting development server...");
if (!buildScript()) {
  console.error("❌ Initial build failed. Exiting...");
  process.exit(1);
}

// Browser-sync設定
bs.init({
  server: {
    baseDir: "./dist",
    index: false, // index.htmlを探さない
    directory: true, // ディレクトリリストを表示
    middleware: [
      function (req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, OPTIONS"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Origin, X-Requested-With, Content-Type, Accept"
        );
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");

        // UserScriptファイルの場合、追加ヘッダーを設定
        if (req.url.endsWith(".user.js")) {
          const scriptPath = path.join(__dirname, "dist", "userscript.user.js");

          if (fs.existsSync(scriptPath)) {
            const stats = fs.statSync(scriptPath);
            // これを追加することで fetch(…, { method: 'HEAD' }) が
            // 正しく更新を検知できる
            res.setHeader("Last-Modified", stats.mtime.toUTCString());
          }

          res.setHeader("Content-Type", "application/javascript");
        }

        next();
      },
    ],
  },
  port: 3000,
  ui: {
    port: 3001,
  },
  notify: {
    styles: {
      top: "auto",
      bottom: "20px",
      right: "20px",
      left: "auto",
      fontSize: "14px",
      padding: "10px 15px",
      borderRadius: "5px",
    },
  },
  open: false,
  logLevel: "info",
});

// ファイル変更監視
let building = false;

chokidar
  .watch(
    [
      path.resolve(process.cwd(), "src"),
      path.resolve(process.cwd(), "package.json"),
    ],
    {
      ignoreInitial: true,
      persistent: true,
    }
  )
  .on("all", (event, changedPath) => {
    console.log(`👀 ${event}: ${changedPath}`);
    if (building) return;
    building = true;

    if (buildScript()) {
      bs.notify("Script updated! 🚀");
      setTimeout(() => bs.reload(), 500);
    }

    building = false;
  });

console.log("🌐 Development server: http://localhost:3000");
console.log("📁 Serving files from: ./dist");
console.log("📄 UserScript URL: http://localhost:3000/userscript.user.js");
console.log("🎛️  BrowserSync UI: http://localhost:3001");
console.log("👀 Watching for file changes...");

// Ctrl+C でクリーンアップ
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down development server...");
  bs.exit();
  process.exit(0);
});
