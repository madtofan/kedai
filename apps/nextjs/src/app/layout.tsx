import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { type Metadata } from "next";
import { Providers } from "./dashboard/_components/providers";
import { SiteFooter } from "./footer";
import { TailwindIndicator } from "./_components/ui/tailwind-indicator";
import { Toaster } from "./_components/ui/toaster";

export const metadata: Metadata = {
  title: "POS API",
  description: "Created by madtofan",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <Providers>
          <div className="relative flex min-h-screen flex-col justify-between bg-background">
            {children}
            <SiteFooter />
          </div>
          <TailwindIndicator />
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
