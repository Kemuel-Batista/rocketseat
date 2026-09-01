import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';

import en from './locales/en.json';
import pt from './locales/pt.json';
import es from './locales/es.json';

export const supportedLanguages = ['en', 'pt', 'es'] as const;
export type AppLanguage = (typeof supportedLanguages)[number];

const i18n = new I18n({
  en,
  'en-US': en,
  'en-GB': en,
  pt,
  'pt-BR': pt,
  'pt-PT': pt,
  es,
  'es-ES': es,
  'es-MX': es,
});

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

// Detect device locale once on startup.
const locales = Localization.getLocales();
if (locales && locales.length > 0) {
  const { languageTag } = locales[0];
  i18n.locale = languageTag;
}

export function setAppLanguage(lang: AppLanguage) {
  i18n.locale = lang;
}

export function getAppLanguage(): string {
  return i18n.locale;
}

export function t(
  key: string,
  options?: Parameters<typeof i18n.t>[1],
): string {
  return i18n.t(key, options);
}

export default i18n;

