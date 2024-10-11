"use client";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createContext, type ReactNode, useCallback, useMemo } from "react";
import { useTheme } from "~/app/_utils/useTheme";
import { TRPCReactProvider } from "~/trpc/react";

interface ProvidersProps {
  children: ReactNode;
}

export const ThemeContext = createContext<
  [string, (themeName: string) => void]
  // eslint-disable-next-line @typescript-eslint/no-empty-function
>(["system", () => {}]);

export function Providers({ children }: ProvidersProps): ReactNode {
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

  return (
    <ClerkProvider>
      <QueryClientProvider client={queryClient}>
        <TRPCReactProvider>
          <ThemeContext.Provider value={themeProviderValue}>
            {children}
          </ThemeContext.Provider>
        </TRPCReactProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
