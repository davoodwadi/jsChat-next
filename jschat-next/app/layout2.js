import { ThemeProvider } from "@/components/layout/theme-provider";
import { Toaster } from "@/components/ui/toaster";

import { Suspense } from "react";
import { MultilineSkeleton } from "@/components/ui/skeleton";

import { SidebarProviderServer } from "@/components/layout/sidebar-provider-server";

import localFont from "next/font/local";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export function Layout2({ params, children }) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          // defaultTheme="dark"
          // themes={["dark", "light"]}
          enableSystem={false}
          disableTransitionOnChange
        >
          <SidebarProviderServer>{children}</SidebarProviderServer>
        </ThemeProvider>
        <Toaster />
      </body>
    </html>
  );
}
