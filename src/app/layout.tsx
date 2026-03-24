import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://garuda.vercel.app'

export const metadata: Metadata = {
  title: "Garuda – Your Journey, Elevated",
  description: "The ultimate trip companion. Plan routes, split expenses, track memories, and stay connected with your crew — all in one place.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Garuda",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  // Open Graph — WhatsApp, Facebook, iMessage, Slack, LinkedIn
  openGraph: {
    type: "website",
    url: APP_URL,
    siteName: "Garuda",
    title: "Garuda – Your Journey, Elevated",
    description: "The ultimate trip companion. Plan routes, split expenses, track memories, and stay connected with your crew — all in one place.",
    images: [
      {
        url: `${APP_URL}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: "Garuda – Trip Companion",
      },
    ],
  },
  // Twitter / X card
  twitter: {
    card: "summary_large_image",
    title: "Garuda – Your Journey, Elevated",
    description: "The ultimate trip companion. Plan routes, split expenses, track memories, and stay connected with your crew — all in one place.",
    images: [`${APP_URL}/opengraph-image`],
  },
};

export const viewport: Viewport = {
  themeColor: "#1a4731",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
