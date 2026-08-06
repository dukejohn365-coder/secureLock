import { headers } from "next/headers"
import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata, Viewport } from "next"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { ConvexClientProvider } from "@/components/convex-provider"
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://secure-lock-ashy.vercel.app"
  ),
  title: {
    default: "SecureLock — Zero-Knowledge Password Manager",
    template: "%s | SecureLock",
  },
  description:
    "SecureLock is a zero-knowledge password manager that encrypts and stores all passwords locally in your browser. No databases, no tracking, complete peace of mind.",
  keywords: [
    "password manager",
    "secure password vault",
    "zero-knowledge",
    "local encryption",
    "AES-GCM",
    "password generator",
    "password security",
  ],
  icons: {
    icon: "/icon.svg",
  },
  openGraph: {
    type: "website",
    siteName: "SecureLock",
    title: "SecureLock — Zero-Knowledge Password Manager",
    description:
      "Encrypt and save all passwords locally inside your browser. No databases, no tracking.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "SecureLock — Zero-Knowledge Password Manager",
    description:
      "Encrypt and save all passwords locally inside your browser. No databases, no tracking.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "security",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#8b5cf6",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headerList = await headers()
  const nonce = headerList.get("x-nonce") ?? undefined

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ConvexClientProvider>
          <ThemeProvider nonce={nonce}>{children}</ThemeProvider>
        </ConvexClientProvider>
      </body>
    </html>
  )
}
