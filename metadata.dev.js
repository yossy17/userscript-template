// ==UserScript==
// @name         DEV LOADER
// @description  Development loader with enhanced reload detection
// @version      1.0.0-dev
// @author       Yos_sy
// @match        *://*/*
// @namespace    http://tampermonkey.net/
// @grant        GM.setClipboard
// @grant        GM.registerMenuCommand
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        unsafeWindow
// @connect      localhost
// @connect      127.0.0.1
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  const DEV_SERVER = "http://localhost:3000";
  const CHECK_INTERVAL = 2000; // 2秒ごとにチェック

  console.log("🔧 Enhanced Development Loader Starting...");

  let lastModified = 0;
  let checkTimer = null;
  let loadedScript = null;

  // より確実なスクリプト更新チェック
  async function checkForUpdates() {
    try {
      const response = await fetch(`${DEV_SERVER}/userscript.user.js`, {
        method: "HEAD",
        cache: "no-cache",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (response.ok) {
        const newModified = response.headers.get("last-modified");
        const newETag = response.headers.get("etag");
        const modifiedTime = newModified
          ? new Date(newModified).getTime()
          : Date.now();

        // 詳細ログは開発者が必要な時のみ
        // console.log(`📊 Server check - Modified: ${newModified}, ETag: ${newETag}`);

        if (modifiedTime > lastModified) {
          console.log("🔄 Script updated detected, reloading script...");
          lastModified = modifiedTime;

          if (lastModified > 0) {
            // 初回以外はリロード
            await loadDevScript();
          }
        }
      }
    } catch (error) {
      console.warn("⚠️ Update check failed:", error.message);
    }
  }

  // スクリプトをテキストとして取得して評価する方法に変更
  async function loadDevScript() {
    try {
      console.log("🔄 Loading/reloading development script...");

      // 既存のスクリプトをクリーンアップ
      if (loadedScript) {
        loadedScript.remove();
        loadedScript = null;
        console.log("🧹 Removed old script");
      }

      // スクリプトの内容を取得
      const response = await fetch(
        `${DEV_SERVER}/userscript.user.js?t=${Date.now()}`,
        {
          cache: "no-cache",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const scriptContent = await response.text();

      // UserScriptヘッダーを除去（Violetmonkeyの自動検出を回避）
      const cleanedScript = scriptContent.replace(
        /\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\n/,
        ""
      );

      // スクリプトを実行
      const scriptElement = document.createElement("script");
      scriptElement.id = "dev-script";
      scriptElement.type = "text/javascript";
      scriptElement.textContent = `
        (function() {
          try {
            ${cleanedScript}
            console.log('🚀 Dev script executed successfully');
          } catch (error) {
            console.error('❌ Dev script execution error:', error);
          }
        })();
      `;

      document.head.appendChild(scriptElement);
      loadedScript = scriptElement;

      console.log("✅ Dev script loaded and executed");
    } catch (error) {
      console.error("❌ Script loading error:", error);
    }
  }

  // 初期化
  async function initialize() {
    try {
      // 開発サーバーの接続確認
      const response = await fetch(`${DEV_SERVER}/userscript.user.js`, {
        method: "HEAD",
      });

      if (response.ok) {
        console.log("✅ Development server connected");
        lastModified = new Date(
          response.headers.get("last-modified") || Date.now()
        ).getTime();

        // 初回スクリプトロード
        await loadDevScript();

        // 定期チェック開始
        checkTimer = setInterval(checkForUpdates, CHECK_INTERVAL);
        console.log(
          `👀 Started checking for updates every ${CHECK_INTERVAL / 1000}s`
        );
      } else {
        throw new Error("Server not responding");
      }
    } catch (error) {
      console.error("❌ Development server not available:", error.message);
      console.log("💡 Make sure to run: bun run dev");
    }
  }

  // ページロード完了後に初期化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  // クリーンアップ
  window.addEventListener("beforeunload", () => {
    if (checkTimer) {
      clearInterval(checkTimer);
    }
  });

  // 手動操作ショートカット
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey) {
      if (e.key === "R") {
        e.preventDefault();
        console.log("🔄 Manual page reload");
        location.reload();
      } else if (e.key === "L") {
        e.preventDefault();
        console.log("🔄 Manual script reload");
        loadDevScript();
      } else if (e.key === "D") {
        e.preventDefault();
        console.log("🔍 Debug info:");
        console.log("- Last modified:", new Date(lastModified));
        console.log("- Script loaded:", !!loadedScript);
        console.log("- Check timer active:", !!checkTimer);
      }
    }
  });

  console.log("🎯 Enhanced development loader ready!");
  console.log("⌨️ Shortcuts:");
  console.log("   - Ctrl+Shift+R: reload page");
  console.log("   - Ctrl+Shift+L: reload script");
  console.log("   - Ctrl+Shift+D: debug info");
})();
