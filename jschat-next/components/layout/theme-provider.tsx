"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  // console.log("ThemeProvider children", children);
  // console.log("ThemeProvider props", props);

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
