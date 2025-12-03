import type { Metadata } from "next";

// =============================================================================
// GENERATOR LAYOUT
// SEO-optimized layout for the experience generator
// =============================================================================

export const metadata: Metadata = {
  title: "AI Experience Generator | ATLVS",
  description:
    "Transform any creative concept into a complete immersive experience blueprint. Generate production plans, sensory designs, guest journeys, and more with AI-powered tools.",
  keywords: [
    "experience design",
    "immersive experience",
    "event planning",
    "production management",
    "AI generator",
    "experience blueprint",
    "sensory design",
    "guest journey",
    "live entertainment",
    "event production",
  ],
  authors: [{ name: "GHXSTSHIP Industries" }],
  creator: "ATLVS by GHXSTSHIP",
  publisher: "GHXSTSHIP Industries",
  
  // Open Graph
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://atlvs.ghxstship.com/generator",
    siteName: "ATLVS",
    title: "AI Experience Generator | Transform Ideas into Production Blueprints",
    description:
      "Enter a single creative concept and watch AI generate a complete immersive experience blueprint with sensory design, spatial planning, and production documentation.",
    images: [
      {
        url: "/og/generator.png",
        width: 1200,
        height: 630,
        alt: "ATLVS AI Experience Generator",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "AI Experience Generator | ATLVS",
    description:
      "Transform any idea into a complete immersive experience blueprint with AI-powered tools.",
    images: ["/og/generator.png"],
    creator: "@ghxstship",
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  
  // Verification
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  
  // Alternates
  alternates: {
    canonical: "https://atlvs.ghxstship.com/generator",
  },
  
  // Category
  category: "technology",
};

// JSON-LD structured data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "ATLVS AI Experience Generator",
  description:
    "AI-powered tool that transforms creative concepts into complete immersive experience blueprints",
  url: "https://atlvs.ghxstship.com/generator",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  creator: {
    "@type": "Organization",
    name: "GHXSTSHIP Industries",
    url: "https://ghxstship.com",
  },
  featureList: [
    "AI-powered blueprint generation",
    "5 Senses activation matrix",
    "XYZ spatial-temporal planning",
    "Guest journey mapping",
    "Production documentation",
    "PDF export",
    "Social sharing",
  ],
};

export default function GeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
