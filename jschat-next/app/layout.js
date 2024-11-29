import localFont from "next/font/local"
import "./globals.css"

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

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}

        <footer className="row-start-3 flex gap-6 p-16 flex-wrap items-center justify-center">
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
