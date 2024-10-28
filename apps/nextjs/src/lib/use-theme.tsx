"use client";

import { useEffect, useLayoutEffect, useState } from "react";

const getTheme = () => {
  let initialTheme = "system";
  if (typeof window !== "undefined") {
    initialTheme = window.localStorage.getItem("theme") ?? "system";
  }
  return initialTheme;
};

const updateDocumentBody = (theme: string) => {
  document.body.classList.remove("light", "dark", "system");
  document.body.classList.add(theme);
};

export const useTheme = (): [string, (theme: string) => void] => {
  const [theme, setInnerTheme] = useState("system");

  useEffect(() => {
    setInnerTheme(getTheme);
  }, []);

  useLayoutEffect(() => {
    updateDocumentBody(theme);
  }, [theme]);

  const setTheme = (themeName: string) => {
    setInnerTheme(themeName);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", themeName);
    }
  };

  return [theme, setTheme];
};
