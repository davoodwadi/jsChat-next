import localFont from "next/font/local"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ThemeToggle } from "@/components/theme-toggle"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import { AuthButton } from "@/components/AuthButtons"
import PaymentComponent from "@/components/Payment"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata = {
  title: "Spreed",
  description: "Non-linear LLM chat interface",
}

export default async function RootLayout({ children }) {
  // const session = await auth()
  // console.log("session", session)
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <AppSidebar />
            <div className={` flex flex-col min-h-screen w-full`}>
              <SidebarTrigger />
              <AuthButton className="text-green-300" />
              <ThemeToggle />
              <PaymentComponent
                priceId={process.env.NEXT_PUBLIC_PRICE_ID}
                price="$4.99"
                description="more tokens"
              />
              {children}

              <footer className="flex gap-6 p-16 flex-wrap items-center justify-center mt-auto">
                <p className="flex items-center gap-2">
                  © 2024 Spreed.chat. All rights reserved.
                </p>
                <a
                  className="flex items-center gap-2 hover:underline hover:underline-offset-4"
                  href="https://spreed.chat/privacy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy{" "}
                </a>
              </footer>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
