import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Toaster } from "@/components/ui/toaster";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { lazy } from "react";

const AuthButton = lazy(() => import("@/components/auth/AuthButtonsServer"));

import PaymentComponent from "@/components/Payment";

import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { Suspense } from "react";

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

export default async function RootLayout(props) {
  // console.log("starting root layout");
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body className={`${geistSans.className} antialiased`}>
        {/* <Suspense fallback={<p>Loading Root Layout</p>}> */}
        <ThemeProvider
          attribute="class"
          // defaultTheme="dark"
          // themes={["dark", "light"]}
          enableSystem={false}
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            {/* <Suspense fallback={<p>Loading</p>}> */}
            <div
              className={` flex flex-col overflow-hidden min-h-screen mx-auto w-full `} //
            >
              <div className="flex flex-row mt-2 mb-6 justify-between">
                <div className=" items-center place-items-center">
                  <SidebarTrigger className="my-auto content-center items-center" />
                </div>
                <div className="flex flex-row  ">
                  <Suspense fallback={<p>Loading AuthButton</p>}>
                    <AuthButton className="mx-1" />
                  </Suspense>

                  <PaymentComponent
                    priceId={process.env.NEXT_PUBLIC_PRICE_ID}
                    price=""
                    description="Top up"
                    className="mx-1"
                  />
                  <ThemeToggle className="mx-1" />
                </div>
              </div>

              {props.children}

              <footer className="flex gap-2 p-6 flex-wrap items-center justify-center mt-auto text-xs md:text-sm">
                <p className="flex items-center gap-2">
                  © 2024 Spreed.chat. All rights reserved.
                </p>
                <a
                  className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                  href="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </footer>
            </div>
            {/* </Suspense> */}
          </SidebarProvider>
        </ThemeProvider>
        <Toaster />
        {/* </Suspense> */}
      </body>
    </html>
  );
}
