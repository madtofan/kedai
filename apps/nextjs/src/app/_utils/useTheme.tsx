"use client";

import { useEffect, useState } from "react";

export const useTheme = (): [string, (theme: string) => void] => {
  let initialTheme = "system";
  if (typeof window !== "undefined") {
    initialTheme = window.localStorage.getItem("theme") ?? "system";
  }
  const [theme, setInnerTheme] = useState(initialTheme);

  useEffect(() => {
    document.body.classList.remove("light", "dark", "system");
    document.body.classList.add(theme);
  }, [theme]);

  const setTheme = (themeName: string) => {
    setInnerTheme(themeName);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", themeName);
    }
  };

  return [theme, setTheme];
};
