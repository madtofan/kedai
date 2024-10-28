import { GeistSans } from "geist/font/sans";
import { type ReactNode } from "react";
import { Providers } from "~/components/ui/providers";
import { TailwindIndicator } from "~/components/ui/tailwind-indicator";
import { Toaster } from "~/components/ui/toaster";
import "~/styles/globals.css";

type Props = {
  children: ReactNode;
};

export default async function MainLayout({ children }: Props) {
  return (
    <html className={`${GeistSans.variable}`}>
      <body>
        <Providers>
          <div className="relative flex min-h-screen flex-col justify-between bg-background transition-all">
            {children}
          </div>
          <TailwindIndicator />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
