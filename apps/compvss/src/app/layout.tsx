import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  Anton,
  Bebas_Neue,
  Share_Tech,
  Share_Tech_Mono,
} from "next/font/google";
import "./globals.css";
import { ErrorBoundary, NotificationProvider, Link } from "@ghxstship/ui";
import { Providers } from "./providers";
import { CookieConsentWrapper } from "../components/cookie-consent-wrapper";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas-neue" });
const shareTech = Share_Tech({ subsets: ["latin"], weight: "400", variable: "--font-share-tech" });
const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-share-tech-mono",
});

export const metadata: Metadata = {
  title: "GHXSTSHIP COMPVSS",
  description: "Production operations mission control for GHXSTSHIP Industries.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${anton.variable} ${bebasNeue.variable} ${shareTech.variable} ${shareTechMono.variable}`}>
        <Link
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-button focus:border-2 focus:border-primary-foreground focus:shadow-md focus:outline-none"
        >
          Skip to main content
        </Link>
        <Link
          href="#main-navigation"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-48 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-button focus:border-2 focus:border-primary-foreground focus:shadow-md focus:outline-none"
        >
          Skip to navigation
        </Link>
        <ErrorBoundary>
          <Providers>
            <NotificationProvider>
              {children}
              <CookieConsentWrapper />
            </NotificationProvider>
          </Providers>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
