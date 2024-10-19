import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { type ReactNode } from "react";
import { Providers } from "~/components/ui/providers";
import {
  ALL_LOCALES,
  ALL_NAMESPACES,
  getStaticData,
  type Locales,
} from "@acme/locale";
import { TailwindIndicator } from "~/components/ui/tailwind-indicator";
import { Toaster } from "~/components/ui/toaster";
import { SiteFooter } from "./_footer";

type Props = {
  children: ReactNode;
  params: { locale: string };
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: Props) {
  if (!ALL_LOCALES.includes(locale as Locales)) {
    notFound();
  }

  // it's important you provide all data which are needed for initial render
  // so current locale and also fallback locales + necessary namespaces
  const locales = await getStaticData(
    [locale as Locales, "en"],
    ALL_NAMESPACES,
  );

  return (
    <html lang={locale} className={`${GeistSans.variable}`}>
      <body>
        <Providers locale={locale} locales={locales}>
          <div className="relative flex min-h-screen flex-col justify-between bg-background">
            {children}
          </div>
          <SiteFooter />
          <TailwindIndicator />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
