export const metadata = {
  name: {
    en: "My Userscript",
    ja: "My Userscript",
    "zh-CN": "My Userscript",
    ko: "My Userscript",
  },
  description: {
    en: "A useful userscript",
    ja: "便利なユーザースクリプト",
    "zh-CN": "一个有用的用户脚本",
    ko: "유용한 사용자 스크립트",
  },
  version: "0.0.0",
  author: "Yos_sy",
  match: ["*://example.com/*"],
  namespace: "http://tampermonkey.net/",
  icon: "icon",
  grant: ["", , "GM_setValue", "GM_getValue"],
  license: "MIT",
};

export default metadata;
