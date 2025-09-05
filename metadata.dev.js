// ==UserScript==
// @name         DEV LOADER
// @description  Development loader with ETag-based reload detection
// @version      1.0.0-dev
// @author       Yos_sy
// @match        *://*/*
// @namespace    http://tampermonkey.net/
// @grant        unsafeWindow
// @connect      localhost
// @connect      127.0.0.1
// @run-at       document-end
// ==/UserScript==

(function () {
  "use strict";

  const DEV_SERVER = "http://localhost:3000";
  const CHECK_INTERVAL = 5000; // 5秒ごとにチェック

  console.log("🔧 Development Loader Starting...");

  let lastEtag = null;
  let loadedScript = null;
  let checkTimer = null;

  async function checkForUpdates() {
    try {
      const res = await fetch(`${DEV_SERVER}/userscript.user.js`, {
        method: "HEAD",
        cache: "no-store",
      });

      if (res.ok) {
        const newEtag = res.headers.get("etag");
        if (newEtag && newEtag !== lastEtag) {
          console.log("🔄 Update detected, reloading script...");
          lastEtag = newEtag;
          await loadDevScript();
        }
      }
    } catch (err) {
      console.warn("⚠️ Update check failed:", err.message);
    }
  }

  async function loadDevScript() {
    try {
      console.log("🔄 Loading development script...");

      if (loadedScript) {
        loadedScript.remove();
        loadedScript = null;
        console.log("🧹 Removed old script");
      }

      const res = await fetch(
        `${DEV_SERVER}/userscript.user.js?t=${Date.now()}`,
        {
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const scriptContent = await res.text();
      const cleanedScript = scriptContent.replace(
        /\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\n/,
        ""
      );

      try {
        const scriptElement = document.createElement("script");
        scriptElement.textContent = cleanedScript;
        document.head.appendChild(scriptElement);
        loadedScript = scriptElement;
        console.log("✅ Script injected via <script>");
      } catch {
        console.warn("⚠️ Falling back to eval()");
        (0, eval)(cleanedScript);
      }
    } catch (err) {
      console.error("❌ Script loading error:", err);
    }
  }

  async function initialize() {
    try {
      const res = await fetch(`${DEV_SERVER}/userscript.user.js`, {
        method: "HEAD",
      });
      if (res.ok) {
        lastEtag = res.headers.get("etag") || null;
        console.log("✅ Development server connected");

        await loadDevScript();

        checkTimer = setInterval(checkForUpdates, CHECK_INTERVAL);
        console.log(`👀 Watching for updates every ${CHECK_INTERVAL / 1000}s`);
      } else {
        throw new Error("Server not responding");
      }
    } catch (err) {
      console.error("❌ Development server not available:", err.message);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize);
  } else {
    initialize();
  }

  window.addEventListener("beforeunload", () => {
    if (checkTimer) clearInterval(checkTimer);
  });

  // ショートカット
  document.addEventListener("keydown", (e) => {
    if (!e.ctrlKey || !e.shiftKey) return;
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
      console.log("- Last ETag:", lastEtag);
      console.log("- Script loaded:", !!loadedScript);
      console.log("- Check timer active:", !!checkTimer);
    }
  });

  console.log("🎯 Development loader ready!");
  console.log("⌨️ Shortcuts:");
  console.log("   - Ctrl+Shift+R: reload page");
  console.log("   - Ctrl+Shift+L: reload script");
  console.log("   - Ctrl+Shift+D: debug info");
})();
