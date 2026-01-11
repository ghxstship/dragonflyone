/**
 * GVTEWAY White-Label Experience Page
 * Complete example implementation of white-label experience template
 */

import { notFound } from 'next/navigation';
import {
  ExperienceThemeProvider,
  ExperienceThemeStyles,
} from '@/ui-v2/whitelabel';
import {
  WhiteLabelNav,
  ExperienceHero,
  QuickInfoBar,
  ContentGrid,
  OverviewSection,
  InclusionsSection,
  ItinerarySection,
  HostProfileSection,
  ReviewsSection,
  FAQSection,
} from '@/ui-v2/patterns/experience';
import { BookingWidgetWrapper } from '@/components/booking-widget-wrapper';

// This would come from your API/database
async function getExperienceData(slug: string) {
  // Example: const response = await fetch(`/api/experiences/${slug}/whitelabel`);
  // For now, return mock data

  return {
    experience: {
      id: '1',
      organizerId: 'org-1',
      organizer: {
        id: 'org-1',
        name: 'Sunset Adventures',
        slug: 'sunset-adventures',
        avatar: '/images/organizers/sunset-adventures.jpg',
        bio: 'We specialize in unforgettable yacht experiences across the Mediterranean. With over 10 years of experience, we\'ve helped thousands of guests create memories that last a lifetime.',
        stats: {
          eventsHosted: 127,
          rating: 4.9,
          responseRate: 98,
          responseTime: 'within 1 hour',
          memberSince: new Date('2015-03-15'),
        },
        contactEmail: 'hello@sunsetadventures.com',
        contactPhone: '+1 (555) 123-4567',
      },
      title: 'Mediterranean Yacht Week - Croatia Adventure',
      slug: 'croatia-yacht-week',
      description: 'Experience the ultimate sailing adventure along Croatia\'s stunning Dalmatian Coast. This 7-day yacht charter combines the thrill of sailing with the beauty of hidden coves, historic coastal towns, and vibrant nightlife.\n\nEach day brings new discoveries as we navigate crystal-clear waters, anchor in secluded bays, and explore charming Mediterranean villages. Whether you\'re an experienced sailor or a first-timer, our professional crew ensures a safe and unforgettable journey.',
      category: 'Sailing & Yachting',
      location: {
        city: 'Split',
        state: 'Dalmatia',
        country: 'Croatia',
        coordinates: { latitude: 43.5081, longitude: 16.4402 },
      },
      venue: {
        name: 'ACI Marina Split',
        address: 'Uvala Baluni 8, 21000 Split, Croatia',
        description: 'Premium marina with modern facilities and easy access to Split\'s Old Town',
      },
      media: [
        {
          id: '1',
          type: 'image' as const,
          url: '/images/experiences/yacht-1.jpg',
          thumbnail: '/images/experiences/yacht-1-thumb.jpg',
          alt: 'Luxury yacht sailing along Croatian coast',
          order: 1,
        },
        {
          id: '2',
          type: 'image' as const,
          url: '/images/experiences/yacht-2.jpg',
          thumbnail: '/images/experiences/yacht-2-thumb.jpg',
          alt: 'Group enjoying sunset on deck',
          order: 2,
        },
        // Add more media items...
      ],
      pricing: {
        basePrice: 1299,
        currency: 'USD',
        startingPrice: 1199,
      },
      availability: {
        dates: [
          {
            id: 'date-1',
            startDate: new Date('2026-06-15'),
            endDate: new Date('2026-06-22'),
            spotsAvailable: 8,
            price: 1299,
            status: 'available' as const,
          },
          {
            id: 'date-2',
            startDate: new Date('2026-07-20'),
            endDate: new Date('2026-07-27'),
            spotsAvailable: 3,
            price: 1499,
            status: 'limited' as const,
          },
        ],
        spotsLeft: 11,
        totalSpots: 48,
      },
      duration: 7,
      groupSize: { min: 2, max: 12 },
      inclusions: {
        included: [
          { id: '1', text: '7-night yacht charter with professional skipper', category: 'Accommodation' },
          { id: '2', text: 'All meals and non-alcoholic beverages', category: 'Food' },
          { id: '3', text: 'Snorkeling equipment and water toys', category: 'Activities' },
          { id: '4', text: 'Fuel and marina fees', category: 'Fees' },
          { id: '5', text: 'Welcome cocktail and farewell dinner', category: 'Food' },
        ],
        excluded: [
          { id: '1', text: 'Flights to/from Split', category: 'Travel' },
          { id: '2', text: 'Alcoholic beverages', category: 'Food' },
          { id: '3', text: 'Travel insurance', category: 'Insurance' },
          { id: '4', text: 'Optional excursions and activities', category: 'Activities' },
        ],
      },
      itinerary: [
        {
          id: 'day-1',
          dayNumber: 1,
          title: 'Arrival & Welcome',
          description: 'Check in at ACI Marina Split, meet your crew and fellow sailors, and enjoy a welcome cocktail as we set sail for our first anchorage.',
          activities: [
            {
              id: 'act-1',
              time: '14:00',
              name: 'Check-in',
              description: 'Board your yacht and get settled into your cabin',
              location: 'ACI Marina Split',
              duration: '1 hour',
            },
            {
              id: 'act-2',
              time: '16:00',
              name: 'Safety Briefing',
              description: 'Important safety information and yacht orientation',
              duration: '30 minutes',
            },
            {
              id: 'act-3',
              time: '17:00',
              name: 'Set Sail',
              description: 'Depart for Šolta Island',
              duration: '2 hours',
            },
          ],
        },
        // Add more days...
      ],
      highlights: [
        { id: '1', icon: 'star', text: 'Professional skipper and crew included' },
        { id: '2', icon: 'users', text: 'Small group size (max 12 guests)' },
        { id: '3', icon: 'map', text: 'Visit 5+ stunning Croatian islands' },
        { id: '4', icon: 'calendar', text: 'Flexible 7-day itinerary' },
      ],
      faq: [
        {
          id: '1',
          question: 'What level of sailing experience do I need?',
          answer: 'No sailing experience is required! Our professional skipper handles all the sailing, so you can relax and enjoy the journey. However, if you\'d like to help with sailing tasks, the crew is happy to teach you.',
          order: 1,
        },
        {
          id: '2',
          question: 'What should I bring?',
          answer: 'Bring comfortable casual clothing, swimwear, sun protection (hat, sunglasses, sunscreen), a light jacket for cooler evenings, and any personal medications. Soft-sided luggage is recommended as storage space is limited.',
          order: 2,
        },
        // Add more FAQs...
      ],
      cancellationPolicy: {
        type: 'moderate' as const,
        description: 'Cancel up to 30 days before for a full refund',
        timeline: [
          { id: '1', period: 'Before 30 days', refundPercentage: 100 },
          { id: '2', period: '15-29 days before', refundPercentage: 50 },
          { id: '3', period: 'Less than 15 days', refundPercentage: 0 },
        ],
      },
      rating: {
        average: 4.9,
        count: 87,
        breakdown: { 5: 72, 4: 12, 3: 2, 2: 1, 1: 0 },
        categories: [
          { name: 'Communication', score: 4.9 },
          { name: 'Accuracy', score: 4.8 },
          { name: 'Value', score: 4.7 },
          { name: 'Experience', score: 5.0 },
        ],
      },
      reviews: [
        {
          id: '1',
          author: {
            id: 'user-1',
            name: 'Sarah Johnson',
            avatar: '/images/users/sarah.jpg',
          },
          rating: 5,
          content: 'Absolutely incredible experience! The crew was fantastic, the yacht was beautiful, and Croatia exceeded all expectations. We visited stunning islands, swam in crystal-clear waters, and enjoyed the best seafood of our lives. Can\'t wait to book again!',
          date: new Date('2025-08-15'),
          verified: true,
          helpful: 24,
          response: 'Thank you so much, Sarah! We loved having you aboard and can\'t wait to welcome you back next summer!',
        },
        // Add more reviews...
      ],
      addOns: [
        {
          id: 'addon-1',
          name: 'Premium Wine Package',
          description: 'Selection of Croatian wines for the week',
          price: 150,
          required: false,
          maxQuantity: 1,
        },
        {
          id: 'addon-2',
          name: 'Scuba Diving Experience',
          description: 'Guided dive at one of Croatia\'s best sites',
          price: 95,
          required: false,
          maxQuantity: 3,
        },
      ],
      badges: [
        { id: '1', text: 'Bestseller', variant: 'bestseller' as const },
        { id: '2', text: 'Verified', variant: 'verified' as const },
      ],
      status: 'published' as const,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2026-01-10'),
    },
    whitelabel: {
      organizerId: 'org-1',
      branding: {
        logo: '/images/logos/sunset-adventures.svg',
        colors: {
          primary: '#0066FF',
          secondary: '#00D4FF',
          accent: '#FF6B35',
        },
        typography: {
          displayFont: 'Outfit',
          bodyFont: 'Inter',
        },
      },
      features: {
        bookingEnabled: true,
        reviewsEnabled: true,
        socialSharingEnabled: true,
        chatEnabled: true,
      },
      content: {
        customNavLinks: [
          { label: 'Experiences', href: '/' },
          { label: 'About Us', href: '/about' },
          { label: 'Blog', href: '/blog' },
          { label: 'Contact', href: '/contact' },
        ],
        footerContent: '© 2026 Sunset Adventures. All rights reserved.',
        legalLinks: [
          { type: 'terms' as const, label: 'Terms of Service', href: '/terms' },
          { type: 'privacy' as const, label: 'Privacy Policy', href: '/privacy' },
        ],
      },
    },
  };
}

export default async function ExperiencePage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getExperienceData(params.slug);

  if (!data) {
    notFound();
  }

  const { experience, whitelabel } = data;

  return (
    <>
      {/* Inject theme CSS at server-render time */}
      <ExperienceThemeStyles config={whitelabel} />

      {/* Wrap entire page in theme provider */}
      <ExperienceThemeProvider config={whitelabel}>
        {/* White-label navigation */}
        <WhiteLabelNav
          organizerId={whitelabel.organizerId}
          organizerName={experience.organizer.name}
          logo={whitelabel.branding.logo}
          navLinks={whitelabel.content.customNavLinks}
        />

        {/* Hero section with image gallery */}
        <ExperienceHero experience={experience} />

        {/* Sticky quick info bar */}
        <QuickInfoBar experience={experience} />

        {/* Two-column content grid */}
        <ContentGrid>
          {/* Main content column */}
          <div>
            <OverviewSection experience={experience} />
            <InclusionsSection inclusions={experience.inclusions} />
            <ItinerarySection itinerary={experience.itinerary} />
            <HostProfileSection organizer={experience.organizer} />
            <ReviewsSection
              rating={experience.rating}
              reviews={experience.reviews}
            />
            <FAQSection faq={experience.faq} />
          </div>

          {/* Sticky booking widget with modal integration */}
          <BookingWidgetWrapper experience={experience} />
        </ContentGrid>

        {/* Footer would go here */}
      </ExperienceThemeProvider>
    </>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const data = await getExperienceData(params.slug);

  if (!data) {
    return {
      title: 'Experience Not Found',
    };
  }

  const { experience } = data;

  return {
    title: `${experience.title} | ${experience.organizer.name}`,
    description: experience.description.substring(0, 160),
    openGraph: {
      title: experience.title,
      description: experience.description.substring(0, 160),
      images: experience.media.length > 0 ? [experience.media[0].url] : [],
    },
  };
}
