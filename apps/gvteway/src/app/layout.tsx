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
import { ServiceWorkerRegistration } from "../components/service-worker-registration";

const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton" });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas-neue" });
const shareTech = Share_Tech({ subsets: ["latin"], weight: "400", variable: "--font-share-tech" });
const shareTechMono = Share_Tech_Mono({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-share-tech-mono",
});

export const metadata: Metadata = {
  title: {
    default: "GVTEWAY | Your Gateway to Live Experiences",
    template: "%s | GVTEWAY",
  },
  description:
    "Discover and book tickets to the best live events, concerts, festivals, and experiences. Your gateway to unforgettable moments.",
  keywords: ["live events", "concerts", "tickets", "festivals", "experiences", "entertainment"],
  authors: [{ name: "GHXSTSHIP" }],
  creator: "GHXSTSHIP",
  publisher: "GHXSTSHIP",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gvteway.com",
    siteName: "GVTEWAY",
    title: "GVTEWAY | Your Gateway to Live Experiences",
    description: "Discover and book tickets to the best live events, concerts, festivals, and experiences.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GVTEWAY - Live Events Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GVTEWAY | Your Gateway to Live Experiences",
    description: "Discover and book tickets to the best live events, concerts, festivals, and experiences.",
    creator: "@ghxstship",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_GVTEWAY_URL || "https://gvteway.com"),
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
              <ServiceWorkerRegistration />
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
