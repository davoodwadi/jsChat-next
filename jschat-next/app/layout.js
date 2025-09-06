import "./globals.css";
import "./glass.css";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

import { ThemeProvider } from "@/components/layout/theme-provider";
// import { Toaster } from "@/components/ui/toaster";
import { Toaster } from "@/components/ui/sonner";

import { Suspense } from "react";

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

config.autoAddCss = false;

export const metadata = {
  title: "Spreed",
  description: "Non-linear LLM chat interface",
};

export default async function RootLayout({ params, children }) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body
        className={`${geistSans.className} antialiased glass-layout overflow-x-hidden`}
      >
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
