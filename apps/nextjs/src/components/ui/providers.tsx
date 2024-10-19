"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, type ReactNode, useCallback, useMemo } from "react";
import { useTheme } from "~/lib/use-theme";
import { TRPCReactProvider } from "~/trpc/react";
import {
  TolgeeBase,
  TolgeeProvider,
  type TolgeeStaticData,
  useTolgeeSSR,
} from "@acme/locale";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface ProvidersProps {
  locales?: TolgeeStaticData | undefined;
  locale: string;
  children: ReactNode;
}

export const ThemeContext = createContext<
  [string, (themeName: string) => void]
  // eslint-disable-next-line @typescript-eslint/no-empty-function
>(["system", () => {}]);

export function Providers({
  locale,
  locales,
  children,
}: ProvidersProps): ReactNode {
  const tolgee = TolgeeBase().init();
  const queryClient = new QueryClient();
  const [theme, setTheme] = useTheme();

  const setThemeCallback = useCallback(
    (themeName: string) => {
      setTheme(themeName);
    },
    [setTheme],
  );

  const themeProviderValue = useMemo<[string, (themeName: string) => void]>(
    () => [theme, setThemeCallback],
    [setThemeCallback, theme],
  );

  const tolgeeSSR = useTolgeeSSR(tolgee, locale, locales);
  const router = useRouter();

  useEffect(() => {
    const { unsubscribe } = tolgeeSSR.on("permanentChange", () => {
      router.refresh();
    });

    return () => unsubscribe();
  }, [tolgeeSSR, router]);

  return (
    <ClerkProvider afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <TRPCReactProvider>
          <ThemeContext.Provider value={themeProviderValue}>
            <TolgeeProvider
              tolgee={tolgeeSSR}
              options={{ useSuspense: false }}
              fallback="Loading"
            >
              {children}
            </TolgeeProvider>
          </ThemeContext.Provider>
        </TRPCReactProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
