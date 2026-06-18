import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#050816",
};

export const metadata: Metadata = {
  title: "ZENITH – The Celestial Eye | What's Above You, Right Now?",
  description:
    "Explore satellites, planets, constellations, and the International Space Station in real time. Discover what's above you, anywhere on Earth.",
  keywords: [
    "satellite tracker",
    "ISS tracker",
    "astronomy",
    "space",
    "planets",
    "constellations",
    "real-time",
    "celestial",
  ],
  authors: [{ name: "ZENITH" }],
  openGraph: {
    title: "ZENITH – The Celestial Eye",
    description: "What's Above You, Right Now?",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZENITH – The Celestial Eye",
    description: "What's Above You, Right Now?",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
