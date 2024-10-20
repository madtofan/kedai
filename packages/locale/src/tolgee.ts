/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FormatIcu } from "@tolgee/format-icu";
import { DevTools, Tolgee } from "@tolgee/web";

const apiKey = process.env.NEXT_PUBLIC_TOLGEE_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_TOLGEE_API_URL;

export type Locales = "en" | "my";

export type Namespaces = "common" | "home-page";

export const ALL_LOCALES: Locales[] = ["en", "my"] as const;

export const ALL_NAMESPACES: Namespaces[] = ["common", "home-page"] as const;

export const DEFAULT_LOCALE: Locales = "en";

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export async function getStaticData(
  languages: Locales[],
  namespaces: string[],
) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: Partial<Record<string, any>> = {};

  for (const lang of languages) {
    for (const namespace of namespaces) {
      result[`${lang}:${namespace}`] = (
        await import(`./locales/${lang}/${namespace}.json`)
      ).default;
    }
  }
  return result;
}

export function TolgeeBase() {
  return Tolgee().use(FormatIcu()).use(DevTools()).updateDefaults({
    apiKey,
    apiUrl,
    fallbackLanguage: "en",
  });
}
