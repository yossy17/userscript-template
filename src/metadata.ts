export const metadata = {
  name: {
    en: "My Userscript",
    jp: "My Userscript",
    "zh-CN": "My Userscript",
    kr: "My Userscript",
  },
  description: {
    en: "A useful userscript",
    jp: "便利なユーザースクリプト",
    "zh-CN": "一个有用的用户脚本",
    kr: "유용한 사용자 스크립트",
  },
  version: "0.0.0",
  author: "Yos_sy",
  match: ["*://example.com/*"],
  namespace: ["http://tampermonkey.net/"],
  icon: [""],
  grant: ["", , "GM_setValue", "GM_getValue"],
  license: "MIT",
  updateURL: "https://github.com/yossy17/PJ/raw/master/dist/userscript.user.js",
  downloadURL:
    "https://github.com/yossy17/PJ/raw/master/dist/userscript.user.js",
};

export default metadata;
