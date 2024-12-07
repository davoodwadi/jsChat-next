import localFont from "next/font/local"
import "./globals.css"
// import { SignInButton, SignOutButton } from "./components/AuthButtons"
import { AuthButton } from "./components/AuthButtons"
import PaymentComponent from "@/app/components/Payment"
import { env } from "process"
// import { auth } from "@/auth"

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
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <div className="">
          {/* {session ? <SignOutButton /> : <SignInButton />} */}
          <AuthButton />
          <PaymentComponent
            priceId={process.env.NEXT_PUBLIC_PRICE_ID}
            price="$4.99"
            description="more tokens"
          />
          {children}
        </div>
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
      </body>
    </html>
  )
}
