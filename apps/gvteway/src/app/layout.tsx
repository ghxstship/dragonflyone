import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import {
  Anton,
  Bebas_Neue,
  Share_Tech,
  Share_Tech_Mono,
} from "next/font/google";
import "./globals.css";
import { ErrorBoundary, NotificationProvider } from "@ghxstship/ui";
import { Providers } from "./providers";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas-neue" });
const shareTech = Share_Tech({ subsets: ["latin"], weight: "400", variable: "--font-share-tech" });
const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-share-tech-mono",
});

export const metadata: Metadata = {
  title: "GVTEWAY // Immersive Guest Platform",
  description:
    "Consumer-facing marketplace for GHXSTSHIP live experiences: ticketing, memberships, commerce, and community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${anton.variable} ${bebasNeue.variable} ${shareTech.variable} ${shareTechMono.variable} bg-black text-white`}
      >
        <ErrorBoundary>
          <Providers>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </Providers>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
