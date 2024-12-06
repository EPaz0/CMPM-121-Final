import { translations, LanguageCode, TranslationKeys } from "./translations.ts";

let currentLanguage: LanguageCode = "en"; // Default language

export function setLanguage(lang: string): void {
  if (lang in translations) {
    currentLanguage = lang as LanguageCode; // Narrow the type safely
  } else {
    console.warn(`Language "${lang}" is not available. Defaulting to English.`);
    currentLanguage = "en";
  }
}

export function getText(
  key: TranslationKeys,
  placeholders: Record<string, string | number> = {}
): string {
  const rawText = translations[currentLanguage][key]; // No error: TypeScript knows keys exist
  return replacePlaceholders(rawText, placeholders);
}

function replacePlaceholders(text: string, placeholders: Record<string, string | number>): string {
  return text.replace(/{{(\w+)}}/g, (_, match) => placeholders[match]?.toString() ?? "");
}