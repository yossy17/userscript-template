export interface I18nMessages {
  foo: string;
}

export const i18n: Record<string, I18nMessages> = {
  ja: {
    foo: "foo",
  },
  en: {
    foo: "foo",
  },
  "zh-CN": {
    foo: "foo",
  },
  ko: {
    foo: "foo",
  },
};

// ブラウザの言語設定から言語を取得
export function detectLanguage(): keyof typeof i18n {
  const browserLang = navigator.language || (navigator as any).userLanguage;
  if (browserLang.startsWith("ja")) return "ja";
  if (browserLang.startsWith("zh")) return "zh-CN";
  if (browserLang.startsWith("ko")) return "ko";
  return "en";
}

export const currentLang = detectLanguage();
export const messages = i18n[currentLang];
