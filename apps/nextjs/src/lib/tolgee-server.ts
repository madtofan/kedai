import { getLocale } from "next-intl/server";

import {
  TolgeeBase,
  ALL_LOCALES,
  getStaticData,
  ALL_NAMESPACES,
} from "@acme/locale";
import { createServerInstance } from "@tolgee/react/server";

export const { getTolgee, getTranslate, T } = createServerInstance({
  getLocale: getLocale,
  createTolgee: async (locale) =>
    TolgeeBase().init({
      // including all locales
      // on server we are not concerned about bundle size
      staticData: await getStaticData(ALL_LOCALES, ALL_NAMESPACES),
      observerOptions: {
        fullKeyEncode: true,
      },
      language: locale,
      fetch: async (input, init) => {
        const data = await fetch(input, { ...init, next: { revalidate: 0 } });
        return data;
      },
    }),
});
