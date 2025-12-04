import { Metadata } from 'next';

const SITE_NAME = 'GVTEWAY';
const SITE_URL = process.env.NEXT_PUBLIC_GVTEWAY_URL || 'https://gvteway.com';
const DEFAULT_DESCRIPTION = 'Discover and book tickets to the best live events, concerts, festivals, and experiences. Your gateway to unforgettable moments.';

interface GenerateMetadataParams {
  title: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noIndex?: boolean;
  path?: string;
}

export function generatePageMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [],
  image = '/og-image.png',
  noIndex = false,
  path = '',
}: GenerateMetadataParams): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const url = `${SITE_URL}${path}`;
  const imageUrl = image.startsWith('http') ? image : `${SITE_URL}${image}`;

  return {
    title: fullTitle,
    description,
    keywords: ['live events', 'concerts', 'tickets', 'festivals', 'experiences', ...keywords],
    authors: [{ name: 'GHXSTSHIP' }],
    creator: 'GHXSTSHIP',
    publisher: 'GHXSTSHIP',
    robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url,
      siteName: SITE_NAME,
      title: fullTitle,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [imageUrl],
      creator: '@ghxstship',
    },
    metadataBase: new URL(SITE_URL),
  };
}

// Pre-defined metadata for common pages
export const homeMetadata = generatePageMetadata({
  title: 'Discover Live Events',
  description: 'Your gateway to unforgettable live experiences. Find concerts, festivals, sports, theater, and more.',
  keywords: ['home', 'discover', 'live entertainment'],
  path: '/',
});

export const eventsMetadata = generatePageMetadata({
  title: 'Browse Events',
  description: 'Explore thousands of live events near you. Concerts, festivals, sports, comedy, and more.',
  keywords: ['events', 'browse', 'search', 'concerts', 'festivals'],
  path: '/events',
});

export const artistsMetadata = generatePageMetadata({
  title: 'Artists & Performers',
  description: 'Discover your favorite artists and performers. Get notified about upcoming shows and tours.',
  keywords: ['artists', 'performers', 'musicians', 'bands'],
  path: '/artists',
});

export const venuesMetadata = generatePageMetadata({
  title: 'Venues',
  description: 'Find events at venues near you. Explore stadiums, arenas, theaters, and clubs.',
  keywords: ['venues', 'stadiums', 'arenas', 'theaters', 'clubs'],
  path: '/venues',
});

export const ticketsMetadata = generatePageMetadata({
  title: 'My Tickets',
  description: 'View and manage your tickets. Access QR codes, transfer tickets, and more.',
  keywords: ['tickets', 'my tickets', 'orders'],
  path: '/tickets',
  noIndex: true,
});

export const searchMetadata = generatePageMetadata({
  title: 'Search Events',
  description: 'Search for events by artist, venue, date, or location.',
  keywords: ['search', 'find events'],
  path: '/search',
});

export const giftCardsMetadata = generatePageMetadata({
  title: 'Gift Cards',
  description: 'Give the gift of live experiences. Purchase GVTEWAY gift cards for friends and family.',
  keywords: ['gift cards', 'gifts', 'presents'],
  path: '/gift-cards',
});

export const helpMetadata = generatePageMetadata({
  title: 'Help & Support',
  description: 'Get help with your tickets, orders, and account. Contact our support team.',
  keywords: ['help', 'support', 'faq', 'contact'],
  path: '/help',
});
