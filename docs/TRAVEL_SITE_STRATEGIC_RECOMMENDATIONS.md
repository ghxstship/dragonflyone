# Travel Site Analysis - Part 2: Strategic Recommendations

## Executive Summary

This document provides strategic recommendations for incorporating travel/experience booking design patterns into ATLVS, COMPVSS, and GVTEWAY. It includes a complete white-label event/experience page template for GVTEWAY organizers, an implementation roadmap, and a component integration plan that leverages the existing UI v2 component library.

---

## Platform-Specific Recommendations

### ATLVS (Athlete Travel & Logistics)

**Core Insight:** Athletes need confidence, clarity, and quick access to travel logistics.

#### Key Design Patterns to Adopt

**1. Visual Confidence Building**
```typescript
// Hero section for travel packages
interface ATLVSHeroProps {
  destination: string;
  sport: string;
  heroImage: string;
  badge?: 'Official' | 'Verified' | 'Premium';
  trustIndicators: {
    athletesBooked: number;
    safetyRating: number;
    partnerLogos: string[];
  };
}
```

**Recommendations:**
- **Itinerary-First Design:** Adopt the detailed schedule/itinerary components from travel sites but adapted for training camps, competitions, and travel logistics
- **Visual Timeline:** Show travel legs, training sessions, and competition schedules in a visual timeline format
- **Trust Signals:** Display athlete testimonials, safety certifications, and verified partner badges prominently
- **Mobile-First Booking:** 70% of athletes will book on mobile - prioritize mobile experience

**UI v2 Component Usage:**
```typescript
// Reuse existing components
import { Card, Badge, Avatar, Button } from '@/ui-v2/primitives';
import { Timeline, StatusIndicator } from '@/ui-v2/compositions';
import { BookingFlow, ReviewCarousel } from '@/ui-v2/patterns';

// New ATLVS-specific compositions
export function TravelItineraryCard({
  departure,
  arrival,
  stops,
  athleteServices
}: TravelItineraryProps) {
  return (
    <Card variant="elevated" className="itinerary-card">
      <Timeline orientation="vertical">
        {/* Flight/transport legs */}
      </Timeline>
      <StatusIndicator status="verified" />
    </Card>
  );
}
```

**Color Strategy:**
- Primary: Athletic/energetic colors (current brand)
- Secondary: Trust blue (#0066FF) for booking actions
- Accent: Success green for verified/safe indicators
- Neutral: Clean grays for logistics/data

**Key Screens to Implement:**
1. **Travel Package Overview** - Full-screen hero with destination imagery
2. **Detailed Itinerary View** - Day-by-day timeline with logistics
3. **Booking Flow** - 3-step simplified booking (dates → athletes → payment)
4. **My Trips Dashboard** - Upcoming travel with real-time status

---

### COMPVSS (Competition Management)

**Core Insight:** Organizers need powerful tools; participants need clarity and excitement.

#### Key Design Patterns to Adopt

**1. Dual Experience Design**
```typescript
// Different interfaces for organizers vs participants
interface CompetitionPageProps {
  userRole: 'organizer' | 'participant' | 'spectator';
  competition: Competition;
  // Render different components based on role
}
```

**Recommendations:**
- **Experience Gallery:** Adopt the 8-12 image gallery pattern for competitions (venue, past events, action shots)
- **What's Included Section:** Clear breakdown of registration fees, amenities, rules
- **Live Results Feed:** Real-time activity feed during competitions (like social proof widgets)
- **Scarcity Indicators:** "Only 12 spots left in Division A" - drives registrations

**UI v2 Component Usage:**
```typescript
import { Tabs, DataTable, Badge } from '@/ui-v2/primitives';
import { MediaGallery, FilterPanel } from '@/ui-v2/compositions';
import { RegistrationFlow, LiveFeed } from '@/ui-v2/patterns';

// New COMPVSS compositions
export function CompetitionHero({
  competition,
  media,
  registrationStatus
}: CompetitionHeroProps) {
  return (
    <section className="competition-hero">
      <MediaGallery
        images={media}
        autoplay={true}
        fullscreen={true}
      />
      <div className="hero-overlay">
        <Badge variant={registrationStatus.variant}>
          {registrationStatus.text}
        </Badge>
        <h1>{competition.name}</h1>
        <Button size="lg" variant="primary">
          Register Now
        </Button>
      </div>
    </section>
  );
}
```

**Color Strategy:**
- Primary: Competition/championship colors (gold, silver, bronze accents)
- Action: High-contrast CTAs for registration
- Live: Real-time status colors (green for live, amber for upcoming)
- Data: Clear data visualization palette

**Key Screens to Implement:**
1. **Competition Landing** - Full-screen media gallery with overlay
2. **Division Browser** - Filterable grid of competition categories
3. **Registration Flow** - Multi-step with team/individual options
4. **Live Results Dashboard** - Real-time leaderboard with updates
5. **Organizer Control Panel** - Dense data tables with quick actions

---

### GVTEWAY (Event/Experience Marketplace)

**Core Insight:** Organizers need white-label tools; guests need inspirational, trustworthy experiences.

#### Key Design Patterns to Adopt

**1. Marketplace + White-Label Hybrid**
```typescript
// GVTEWAY uses a dual-mode system
interface GVTEWAYModeProps {
  mode: 'marketplace' | 'whitelabel';
  organizerId?: string;
  theme?: WhiteLabelTheme;
}
```

**Recommendations:**
- **Marketplace Mode:** Browse all experiences (like Thursday homepage)
- **White-Label Mode:** Individual organizer storefronts with custom branding
- **Experience-First Design:** Large imagery, emotional copy, social proof
- **Booking Conversion:** Sticky booking widget, clear pricing, urgency indicators

**This is the highest priority platform for travel site patterns** because GVTEWAY is directly comparable to getthursday.com and theyachtweek.com.

---

## White-Label GVTEWAY Event/Experience Page

### Architecture Overview

```typescript
// White-label configuration system
interface WhiteLabelConfig {
  organizerId: string;
  branding: {
    logo: string;
    colors: ColorTheme;
    typography: TypographyTheme;
    customDomain?: string;
  };
  features: {
    bookingEnabled: boolean;
    reviewsEnabled: boolean;
    socialSharingEnabled: boolean;
    chatEnabled: boolean;
  };
  content: {
    customSections?: CustomSection[];
    legalLinks?: LegalLink[];
    footerContent?: string;
  };
}

interface ColorTheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  // Auto-generate: hover states, disabled states, gradients
}

interface TypographyTheme {
  displayFont: string;
  bodyFont: string;
  // Auto-generate: scale, line heights, weights
}
```

### Page Template Structure

```typescript
// Complete event/experience page component
export function WhiteLabelExperiencePage({
  experience,
  organizer,
  whitelabel
}: WhiteLabelExperiencePageProps) {
  return (
    <ThemeProvider theme={whitelabel.branding}>
      {/* 1. Navigation - Organizer branded */}
      <WhiteLabelNav organizer={organizer} config={whitelabel} />

      {/* 2. Hero Section - Full-screen visual impact */}
      <ExperienceHero experience={experience} />

      {/* 3. Quick Info Bar - Key details at a glance */}
      <QuickInfoBar experience={experience} />

      {/* 4. Main Content Area - Two-column layout */}
      <ContentGrid>
        {/* Left Column - Experience details */}
        <ExperienceContent>
          <Overview />
          <WhatsIncluded />
          <Itinerary />
          <LocationDetails />
          <MeetYourHost organizer={organizer} />
          <ReviewsSection />
          <FAQSection />
        </ExperienceContent>

        {/* Right Column - Sticky booking widget */}
        <StickyBookingWidget
          experience={experience}
          theme={whitelabel.branding.colors}
        />
      </ContentGrid>

      {/* 5. Similar Experiences - Organizer's other events */}
      <SimilarExperiences organizerId={organizer.id} />

      {/* 6. Footer - White-labeled */}
      <WhiteLabelFooter organizer={organizer} config={whitelabel} />
    </ThemeProvider>
  );
}
```

### Component Specifications

#### 1. White-Label Navigation

```typescript
interface WhiteLabelNavProps {
  organizer: Organizer;
  config: WhiteLabelConfig;
}

export function WhiteLabelNav({ organizer, config }: WhiteLabelNavProps) {
  return (
    <nav className="whitelabel-nav">
      {/* Organizer logo - customizable */}
      <div className="nav-brand">
        <img src={config.branding.logo} alt={organizer.name} />
      </div>

      {/* Navigation links - organizer can customize */}
      <div className="nav-links">
        <NavLink href="/">Experiences</NavLink>
        <NavLink href="/about">About</NavLink>
        <NavLink href="/contact">Contact</NavLink>
        {config.features.chatEnabled && (
          <NavLink href="/support">Support</NavLink>
        )}
      </div>

      {/* User actions */}
      <div className="nav-actions">
        <Button variant="ghost">Sign In</Button>
        <Button variant="primary">Book Now</Button>
      </div>
    </nav>
  );
}

// CSS variables for theming
const navTheme = css`
  .whitelabel-nav {
    background: var(--nav-background, ${config.branding.colors.background});
    color: var(--nav-text, ${config.branding.colors.text});
    border-bottom: 1px solid var(--nav-border, rgba(0,0,0,0.1));
  }

  .nav-brand img {
    height: var(--nav-logo-height, 40px);
  }

  .nav-links a {
    color: var(--nav-link-color, ${config.branding.colors.text});
    font-family: var(--nav-font, ${config.branding.typography.bodyFont});
  }

  .nav-actions button {
    --button-primary-bg: ${config.branding.colors.primary};
    --button-primary-hover: ${adjustColor(config.branding.colors.primary, -10)};
  }
`;
```

#### 2. Experience Hero Section

```typescript
interface ExperienceHeroProps {
  experience: Experience;
}

export function ExperienceHero({ experience }: ExperienceHeroProps) {
  const [currentImage, setCurrentImage] = useState(0);

  return (
    <section className="experience-hero">
      {/* Full-screen image gallery with thumbnails */}
      <div className="hero-gallery">
        <ImageSlider
          images={experience.media}
          current={currentImage}
          onChange={setCurrentImage}
          aspectRatio="16:9"
          fullscreenEnabled={true}
        />

        {/* Thumbnail strip - absolute positioned */}
        <div className="thumbnail-strip">
          {experience.media.slice(0, 8).map((img, idx) => (
            <Thumbnail
              key={idx}
              src={img.thumbnail}
              active={idx === currentImage}
              onClick={() => setCurrentImage(idx)}
            />
          ))}
          {experience.media.length > 8 && (
            <ThumbnailMore count={experience.media.length - 8} />
          )}
        </div>
      </div>

      {/* Hero overlay with key info */}
      <div className="hero-overlay">
        <Breadcrumb>
          <BreadcrumbItem href="/">Home</BreadcrumbItem>
          <BreadcrumbItem href={`/category/${experience.category}`}>
            {experience.category}
          </BreadcrumbItem>
          <BreadcrumbItem current>{experience.title}</BreadcrumbItem>
        </Breadcrumb>
      </div>

      {/* Floating badges */}
      {experience.badges.map(badge => (
        <Badge
          key={badge.id}
          variant={badge.variant}
          className="hero-badge"
        >
          {badge.text}
        </Badge>
      ))}
    </section>
  );
}

// Responsive design
const heroStyles = css`
  .experience-hero {
    position: relative;
    width: 100%;
    height: clamp(400px, 60vh, 700px);

    @media (max-width: 768px) {
      height: 100vh;
      height: 100dvh; /* Dynamic viewport height */
    }
  }

  .hero-gallery {
    width: 100%;
    height: 100%;
    position: relative;
  }

  .thumbnail-strip {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 8px;
    padding: 12px;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
    border-radius: 12px;

    @media (max-width: 768px) {
      display: none; /* Hide on mobile, use swipe instead */
    }
  }

  .hero-badge {
    position: absolute;
    top: 24px;
    right: 24px;
    z-index: 10;
  }
`;
```

#### 3. Quick Info Bar

```typescript
interface QuickInfoBarProps {
  experience: Experience;
}

export function QuickInfoBar({ experience }: QuickInfoBarProps) {
  return (
    <div className="quick-info-bar">
      <Container>
        <div className="info-grid">
          {/* Location */}
          <InfoItem icon={<LocationIcon />}>
            <InfoLabel>Location</InfoLabel>
            <InfoValue>{experience.location.city}, {experience.location.country}</InfoValue>
          </InfoItem>

          {/* Duration */}
          <InfoItem icon={<ClockIcon />}>
            <InfoLabel>Duration</InfoLabel>
            <InfoValue>{experience.duration} days</InfoValue>
          </InfoItem>

          {/* Group size */}
          <InfoItem icon={<UsersIcon />}>
            <InfoLabel>Group Size</InfoLabel>
            <InfoValue>{experience.groupSize.min}-{experience.groupSize.max} guests</InfoValue>
          </InfoItem>

          {/* Rating */}
          <InfoItem icon={<StarIcon />}>
            <InfoLabel>Rating</InfoLabel>
            <InfoValue>
              {experience.rating.average} ({experience.rating.count} reviews)
            </InfoValue>
          </InfoItem>

          {/* Price from */}
          <InfoItem icon={<DollarIcon />}>
            <InfoLabel>From</InfoLabel>
            <InfoValue className="price">
              ${experience.pricing.startingPrice}
              <span className="price-unit">/person</span>
            </InfoValue>
          </InfoItem>
        </div>
      </Container>
    </div>
  );
}

const quickInfoStyles = css`
  .quick-info-bar {
    background: var(--surface-background, #FFFFFF);
    border-bottom: 1px solid var(--border-color, #E5E7EB);
    padding: 16px 0;
    position: sticky;
    top: 64px; /* Below nav */
    z-index: 100;

    @media (max-width: 768px) {
      top: 56px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 24px;

    @media (max-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }

    @media (max-width: 768px) {
      grid-template-columns: repeat(5, minmax(120px, 1fr));
      gap: 16px;
    }
  }

  .info-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .price {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--primary-color);
  }

  .price-unit {
    font-size: 0.875rem;
    font-weight: 400;
    color: var(--text-secondary);
  }
`;
```

#### 4. Content Grid with Sticky Booking

```typescript
export function ContentGrid({ children }: ContentGridProps) {
  return (
    <Container className="content-grid">
      <div className="content-main">
        {children[0]} {/* ExperienceContent */}
      </div>
      <aside className="content-sidebar">
        {children[1]} {/* StickyBookingWidget */}
      </aside>
    </Container>
  );
}

const contentGridStyles = css`
  .content-grid {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 48px;
    padding: 48px 0;

    @media (max-width: 1024px) {
      grid-template-columns: 1fr;
      gap: 32px;
    }
  }

  .content-main {
    min-width: 0; /* Prevent grid blowout */
  }

  .content-sidebar {
    position: sticky;
    top: 120px; /* Below nav + quick info */
    height: fit-content;

    @media (max-width: 1024px) {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      top: auto;
      z-index: 1000;
      background: var(--surface-background);
      border-top: 1px solid var(--border-color);
      padding: 16px;
      box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.1);
    }
  }
`;
```

#### 5. Experience Content Sections

```typescript
export function ExperienceContent() {
  return (
    <div className="experience-content">
      {/* Overview Section */}
      <ContentSection id="overview">
        <SectionTitle>About This Experience</SectionTitle>
        <RichText>
          {/* Organizer's description with rich formatting */}
        </RichText>

        {/* Highlights */}
        <HighlightGrid>
          {experience.highlights.map(highlight => (
            <HighlightCard key={highlight.id}>
              <HighlightIcon>{highlight.icon}</HighlightIcon>
              <HighlightText>{highlight.text}</HighlightText>
            </HighlightCard>
          ))}
        </HighlightGrid>
      </ContentSection>

      {/* What's Included */}
      <ContentSection id="included">
        <SectionTitle>What's Included</SectionTitle>
        <InclusionList>
          <InclusionCategory title="Included">
            {experience.inclusions.included.map(item => (
              <InclusionItem key={item.id} included>
                <CheckIcon />
                {item.text}
              </InclusionItem>
            ))}
          </InclusionCategory>

          <InclusionCategory title="Not Included">
            {experience.inclusions.excluded.map(item => (
              <InclusionItem key={item.id} included={false}>
                <XIcon />
                {item.text}
              </InclusionItem>
            ))}
          </InclusionCategory>
        </InclusionList>
      </ContentSection>

      {/* Itinerary */}
      <ContentSection id="itinerary">
        <SectionTitle>Itinerary</SectionTitle>
        <ItineraryTimeline>
          {experience.itinerary.map((day, idx) => (
            <ItineraryDay key={day.id} dayNumber={idx + 1}>
              <DayHeader>
                <DayNumber>{idx + 1}</DayNumber>
                <DayTitle>{day.title}</DayTitle>
              </DayHeader>
              <DayDescription>{day.description}</DayDescription>
              {day.activities.map(activity => (
                <Activity key={activity.id}>
                  <ActivityTime>{activity.time}</ActivityTime>
                  <ActivityName>{activity.name}</ActivityName>
                  <ActivityDescription>{activity.description}</ActivityDescription>
                </Activity>
              ))}
            </ItineraryDay>
          ))}
        </ItineraryTimeline>
      </ContentSection>

      {/* Location & Venue */}
      <ContentSection id="location">
        <SectionTitle>Location & Venue</SectionTitle>
        <LocationMap
          coordinates={experience.location.coordinates}
          venue={experience.venue}
        />
        <VenueDetails>
          <VenueName>{experience.venue.name}</VenueName>
          <VenueAddress>{experience.venue.address}</VenueAddress>
          <VenueDescription>{experience.venue.description}</VenueDescription>
        </VenueDetails>
        <NearbyAttractions attractions={experience.location.nearby} />
      </ContentSection>

      {/* Meet Your Host */}
      <ContentSection id="host">
        <SectionTitle>Meet Your Host</SectionTitle>
        <HostProfile organizer={experience.organizer}>
          <HostAvatar src={experience.organizer.avatar} size="xl" />
          <HostInfo>
            <HostName>{experience.organizer.name}</HostName>
            <HostBio>{experience.organizer.bio}</HostBio>
            <HostStats>
              <StatItem>
                <StatValue>{experience.organizer.stats.eventsHosted}</StatValue>
                <StatLabel>Events Hosted</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{experience.organizer.stats.rating}</StatValue>
                <StatLabel>Host Rating</StatLabel>
              </StatItem>
              <StatItem>
                <StatValue>{experience.organizer.stats.responseRate}%</StatValue>
                <StatLabel>Response Rate</StatLabel>
              </StatItem>
            </HostStats>
          </HostInfo>
          <Button variant="outline">Contact Host</Button>
        </HostProfile>
      </ContentSection>

      {/* Reviews */}
      <ContentSection id="reviews">
        <SectionTitle>
          Reviews ({experience.rating.count})
          <Badge variant="success">{experience.rating.average} ★</Badge>
        </SectionTitle>

        <ReviewSummary>
          <RatingBreakdown ratings={experience.rating.breakdown} />
          <RatingCategories categories={experience.rating.categories} />
        </ReviewSummary>

        <ReviewList>
          {experience.reviews.map(review => (
            <ReviewCard key={review.id}>
              <ReviewHeader>
                <Avatar src={review.author.avatar} />
                <ReviewAuthor>
                  <AuthorName>{review.author.name}</AuthorName>
                  <ReviewDate>{review.date}</ReviewDate>
                </ReviewAuthor>
                <ReviewRating>{review.rating} ★</ReviewRating>
              </ReviewHeader>
              <ReviewContent>{review.content}</ReviewContent>
              {review.images && (
                <ReviewImages images={review.images} />
              )}
              {review.response && (
                <HostResponse>
                  <ResponseLabel>Response from host:</ResponseLabel>
                  <ResponseContent>{review.response}</ResponseContent>
                </HostResponse>
              )}
            </ReviewCard>
          ))}
        </ReviewList>

        <Button variant="outline" fullWidth>
          Load More Reviews
        </Button>
      </ContentSection>

      {/* FAQ */}
      <ContentSection id="faq">
        <SectionTitle>Frequently Asked Questions</SectionTitle>
        <Accordion>
          {experience.faq.map(item => (
            <AccordionItem key={item.id}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </ContentSection>

      {/* Cancellation Policy */}
      <ContentSection id="cancellation">
        <SectionTitle>Cancellation Policy</SectionTitle>
        <PolicyCard>
          <PolicyType>{experience.cancellationPolicy.type}</PolicyType>
          <PolicyDescription>
            {experience.cancellationPolicy.description}
          </PolicyDescription>
          <PolicyTimeline>
            {experience.cancellationPolicy.timeline.map(tier => (
              <PolicyTier key={tier.id}>
                <TierPeriod>{tier.period}</TierPeriod>
                <TierRefund>{tier.refundPercentage}% refund</TierRefund>
              </PolicyTier>
            ))}
          </PolicyTimeline>
        </PolicyCard>
      </ContentSection>
    </div>
  );
}
```

#### 6. Sticky Booking Widget

```typescript
interface StickyBookingWidgetProps {
  experience: Experience;
  theme: ColorTheme;
}

export function StickyBookingWidget({
  experience,
  theme
}: StickyBookingWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [guests, setGuests] = useState(1);
  const [addOns, setAddOns] = useState<string[]>([]);

  const pricing = calculatePricing({
    basePrice: experience.pricing.basePrice,
    guests,
    addOns,
    date: selectedDate
  });

  return (
    <Card className="booking-widget" elevated>
      {/* Price Header */}
      <BookingHeader>
        <PriceDisplay>
          <PriceAmount>${pricing.basePrice}</PriceAmount>
          <PriceUnit>per person</PriceUnit>
        </PriceDisplay>
        {experience.availability.spotsLeft < 10 && (
          <UrgencyBadge variant="warning">
            Only {experience.availability.spotsLeft} spots left!
          </UrgencyBadge>
        )}
      </BookingHeader>

      <Divider />

      {/* Date Selection */}
      <FormSection>
        <FormLabel>Select Date</FormLabel>
        <DatePicker
          value={selectedDate}
          onChange={setSelectedDate}
          availableDates={experience.availability.dates}
          minDate={new Date()}
          placeholder="Choose your dates"
        />
      </FormSection>

      {/* Guest Count */}
      <FormSection>
        <FormLabel>Number of Guests</FormLabel>
        <GuestSelector
          value={guests}
          onChange={setGuests}
          min={experience.groupSize.min}
          max={experience.groupSize.max}
          availableSpots={experience.availability.spotsLeft}
        />
        <FormHint>
          Min: {experience.groupSize.min}, Max: {experience.groupSize.max}
        </FormHint>
      </FormSection>

      {/* Add-ons (Optional) */}
      {experience.addOns && experience.addOns.length > 0 && (
        <FormSection>
          <FormLabel>Add-ons (Optional)</FormLabel>
          {experience.addOns.map(addOn => (
            <AddOnOption
              key={addOn.id}
              addOn={addOn}
              selected={addOns.includes(addOn.id)}
              onToggle={() => toggleAddOn(addOn.id)}
            />
          ))}
        </FormSection>
      )}

      <Divider />

      {/* Price Breakdown */}
      <PriceBreakdown>
        <PriceItem>
          <PriceLabel>${experience.pricing.basePrice} × {guests} guests</PriceLabel>
          <PriceValue>${pricing.subtotal}</PriceValue>
        </PriceItem>

        {pricing.addOnsTotal > 0 && (
          <PriceItem>
            <PriceLabel>Add-ons</PriceLabel>
            <PriceValue>${pricing.addOnsTotal}</PriceValue>
          </PriceItem>
        )}

        <PriceItem>
          <PriceLabel>Service fee</PriceLabel>
          <PriceValue>${pricing.serviceFee}</PriceValue>
        </PriceItem>

        {pricing.discount > 0 && (
          <PriceItem variant="success">
            <PriceLabel>Group discount</PriceLabel>
            <PriceValue>-${pricing.discount}</PriceValue>
          </PriceItem>
        )}

        <Divider />

        <PriceItem variant="total">
          <PriceLabel>Total</PriceLabel>
          <PriceValue>${pricing.total}</PriceValue>
        </PriceItem>
      </PriceBreakdown>

      {/* CTA Button */}
      <Button
        size="lg"
        fullWidth
        disabled={!selectedDate || guests < experience.groupSize.min}
        onClick={handleBooking}
        style={{
          backgroundColor: theme.primary,
          '--button-hover-bg': adjustColor(theme.primary, -10)
        }}
      >
        {selectedDate ? 'Reserve Your Spot' : 'Select Dates to Book'}
      </Button>

      {/* Trust Signals */}
      <TrustSignals>
        <TrustItem>
          <CheckCircleIcon />
          <span>Free cancellation up to 7 days before</span>
        </TrustItem>
        <TrustItem>
          <ShieldIcon />
          <span>Secure payment processing</span>
        </TrustItem>
        <TrustItem>
          <ClockIcon />
          <span>Instant confirmation</span>
        </TrustItem>
      </TrustSignals>

      {/* Share/Save Actions */}
      <BookingActions>
        <IconButton variant="ghost" aria-label="Save to wishlist">
          <HeartIcon />
        </IconButton>
        <IconButton variant="ghost" aria-label="Share experience">
          <ShareIcon />
        </IconButton>
      </BookingActions>
    </Card>
  );
}

const bookingWidgetStyles = css`
  .booking-widget {
    padding: 24px;
    border: 1px solid var(--border-color, #E5E7EB);
    border-radius: 16px;
    box-shadow: var(--shadow-lg);

    @media (max-width: 1024px) {
      border-radius: 0;
      border: none;
      border-top: 1px solid var(--border-color);
      padding: 16px;
      display: flex;
      align-items: center;
      gap: 16px;

      /* Mobile: horizontal layout with CTA prominent */
      .price-display {
        flex-shrink: 0;
      }

      .form-section {
        display: none; /* Hide in mobile sticky - show in modal */
      }

      .price-breakdown {
        display: none; /* Show in modal */
      }

      button {
        flex: 1;
      }
    }
  }

  .booking-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  .price-display {
    display: flex;
    align-items: baseline;
    gap: 8px;
  }

  .price-amount {
    font-size: 2rem;
    font-weight: 700;
    color: var(--text-primary);
  }

  .price-unit {
    font-size: 0.875rem;
    color: var(--text-secondary);
  }

  .form-section {
    margin-bottom: 20px;
  }

  .price-breakdown {
    margin-bottom: 20px;
  }

  .price-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
  }

  .price-item[variant="total"] {
    font-size: 1.125rem;
    font-weight: 700;
    padding-top: 12px;
  }

  .trust-signals {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid var(--border-color);
  }

  .trust-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.875rem;
    color: var(--text-secondary);
    margin-bottom: 8px;
  }

  .trust-item svg {
    color: var(--success-color);
  }

  .booking-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 16px;
  }
`;
```

#### 7. Similar Experiences Section

```typescript
export function SimilarExperiences({ organizerId }: SimilarExperiencesProps) {
  const { data: experiences } = useOrganizerExperiences(organizerId, {
    limit: 4,
    excludeCurrent: true
  });

  return (
    <Section className="similar-experiences">
      <Container>
        <SectionHeader>
          <SectionTitle>More from this organizer</SectionTitle>
          <Button variant="ghost" href={`/organizer/${organizerId}`}>
            View All
          </Button>
        </SectionHeader>

        <ExperienceGrid>
          {experiences.map(experience => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              variant="compact"
            />
          ))}
        </ExperienceGrid>
      </Container>
    </Section>
  );
}
```

### White-Label Customization System

#### Theme Engine

```typescript
// Automatic theme generation from organizer colors
export function generateWhiteLabelTheme(
  primaryColor: string,
  organizerConfig?: Partial<WhiteLabelConfig>
): WhiteLabelTheme {
  return {
    colors: {
      primary: primaryColor,
      primaryHover: adjustBrightness(primaryColor, -10),
      primaryActive: adjustBrightness(primaryColor, -20),
      primaryLight: setOpacity(primaryColor, 0.1),

      // Auto-generate complementary colors
      secondary: organizerConfig?.branding?.colors?.secondary ||
                 generateComplementary(primaryColor),
      accent: organizerConfig?.branding?.colors?.accent ||
              generateTriadic(primaryColor)[0],

      // Semantic colors
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6',

      // Neutral palette
      background: '#FFFFFF',
      surface: '#F9FAFB',
      border: '#E5E7EB',
      text: '#111827',
      textSecondary: '#6B7280',
      textTertiary: '#9CA3AF',
    },

    typography: {
      displayFont: organizerConfig?.branding?.typography?.displayFont ||
                   'Outfit, sans-serif',
      bodyFont: organizerConfig?.branding?.typography?.bodyFont ||
                'Inter, system-ui',

      // Responsive scale
      scale: {
        hero: 'clamp(3rem, 8vw, 6rem)',
        displayXl: 'clamp(2.5rem, 6vw, 4.5rem)',
        displayLg: 'clamp(2rem, 5vw, 3.5rem)',
        displayMd: 'clamp(1.75rem, 4vw, 2.5rem)',
        displaySm: 'clamp(1.5rem, 3vw, 2rem)',
        xl: '1.5rem',
        lg: '1.25rem',
        base: '1rem',
        sm: '0.875rem',
        xs: '0.75rem',
      },

      weights: {
        regular: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        black: 900,
      },

      lineHeights: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
      },
    },

    spacing: {
      grid: 8, // Base 8px grid
      container: {
        maxWidth: '1280px',
        padding: { mobile: '16px', tablet: '24px', desktop: '48px' },
      },
    },

    borderRadius: {
      sm: '4px',
      md: '8px',
      lg: '12px',
      xl: '16px',
      full: '9999px',
    },

    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.07)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    },

    animations: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
      easing: {
        standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
        accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
      },
    },
  };
}

// Color utilities
function adjustBrightness(hex: string, percent: number): string {
  // Implementation
}

function setOpacity(hex: string, opacity: number): string {
  // Implementation
}

function generateComplementary(hex: string): string {
  // Color theory implementation
}

function generateTriadic(hex: string): [string, string] {
  // Color theory implementation
}
```

#### Theme Application

```typescript
// CSS-in-JS theme provider
export function ThemeProvider({
  theme,
  children
}: ThemeProviderProps) {
  const cssVariables = useMemo(() =>
    generateCSSVariables(theme), [theme]
  );

  return (
    <div
      className="whitelabel-theme-root"
      style={cssVariables}
    >
      {children}
    </div>
  );
}

function generateCSSVariables(theme: WhiteLabelTheme): React.CSSProperties {
  return {
    // Colors
    '--color-primary': theme.colors.primary,
    '--color-primary-hover': theme.colors.primaryHover,
    '--color-primary-active': theme.colors.primaryActive,
    '--color-primary-light': theme.colors.primaryLight,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
    '--color-success': theme.colors.success,
    '--color-warning': theme.colors.warning,
    '--color-error': theme.colors.error,
    '--color-info': theme.colors.info,
    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-border': theme.colors.border,
    '--color-text': theme.colors.text,
    '--color-text-secondary': theme.colors.textSecondary,
    '--color-text-tertiary': theme.colors.textTertiary,

    // Typography
    '--font-display': theme.typography.displayFont,
    '--font-body': theme.typography.bodyFont,
    '--text-hero': theme.typography.scale.hero,
    '--text-display-xl': theme.typography.scale.displayXl,
    '--text-display-lg': theme.typography.scale.displayLg,
    '--text-display-md': theme.typography.scale.displayMd,
    '--text-display-sm': theme.typography.scale.displaySm,
    '--text-xl': theme.typography.scale.xl,
    '--text-lg': theme.typography.scale.lg,
    '--text-base': theme.typography.scale.base,
    '--text-sm': theme.typography.scale.sm,
    '--text-xs': theme.typography.scale.xs,

    // Spacing
    '--spacing-unit': `${theme.spacing.grid}px`,
    '--container-max-width': theme.spacing.container.maxWidth,

    // Border radius
    '--radius-sm': theme.borderRadius.sm,
    '--radius-md': theme.borderRadius.md,
    '--radius-lg': theme.borderRadius.lg,
    '--radius-xl': theme.borderRadius.xl,
    '--radius-full': theme.borderRadius.full,

    // Shadows
    '--shadow-sm': theme.shadows.sm,
    '--shadow-md': theme.shadows.md,
    '--shadow-lg': theme.shadows.lg,
    '--shadow-xl': theme.shadows.xl,

    // Animations
    '--animation-fast': theme.animations.fast,
    '--animation-normal': theme.animations.normal,
    '--animation-slow': theme.animations.slow,
    '--easing-standard': theme.animations.easing.standard,
  } as React.CSSProperties;
}
```

### Organizer Customization Interface

```typescript
// Admin panel for organizers to customize their white-label pages
export function WhiteLabelCustomizer({ organizerId }: CustomizerProps) {
  const [config, setConfig] = useState<WhiteLabelConfig>(defaultConfig);
  const [preview, setPreview] = useState(false);

  return (
    <CustomizerLayout>
      {/* Sidebar - Configuration */}
      <CustomizerSidebar>
        <Tabs defaultValue="branding">
          <TabsList>
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="domain">Domain</TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <FormSection>
              <FormLabel>Logo</FormLabel>
              <ImageUpload
                value={config.branding.logo}
                onChange={(logo) => updateConfig({ branding: { logo } })}
                aspectRatio="2:1"
                maxSize={500000} // 500KB
              />
            </FormSection>

            <FormSection>
              <FormLabel>Primary Color</FormLabel>
              <ColorPicker
                value={config.branding.colors.primary}
                onChange={(primary) =>
                  updateConfig({ branding: { colors: { primary } } })
                }
              />
              <FormHint>
                This color will be used for buttons, links, and accents
              </FormHint>
            </FormSection>

            <FormSection>
              <FormLabel>Secondary Color (Optional)</FormLabel>
              <ColorPicker
                value={config.branding.colors.secondary}
                onChange={(secondary) =>
                  updateConfig({ branding: { colors: { secondary } } })
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => autoGenerateSecondary()}
              >
                Auto-generate from primary
              </Button>
            </FormSection>

            <FormSection>
              <FormLabel>Display Font</FormLabel>
              <FontSelector
                value={config.branding.typography.displayFont}
                onChange={(displayFont) =>
                  updateConfig({ branding: { typography: { displayFont } } })
                }
                category="display"
              />
            </FormSection>

            <FormSection>
              <FormLabel>Body Font</FormLabel>
              <FontSelector
                value={config.branding.typography.bodyFont}
                onChange={(bodyFont) =>
                  updateConfig({ branding: { typography: { bodyFont } } })
                }
                category="body"
              />
            </FormSection>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <FormSection>
              <FormLabel>Custom Navigation Links</FormLabel>
              <SortableList
                items={config.content.customNavLinks}
                onChange={(customNavLinks) =>
                  updateConfig({ content: { customNavLinks } })
                }
                renderItem={(link) => (
                  <NavLinkEditor link={link} />
                )}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => addNavLink()}
              >
                Add Link
              </Button>
            </FormSection>

            <FormSection>
              <FormLabel>Footer Content</FormLabel>
              <RichTextEditor
                value={config.content.footerContent}
                onChange={(footerContent) =>
                  updateConfig({ content: { footerContent } })
                }
              />
            </FormSection>

            <FormSection>
              <FormLabel>Legal Links</FormLabel>
              {config.content.legalLinks.map(link => (
                <LegalLinkEditor key={link.id} link={link} />
              ))}
            </FormSection>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <FormSection>
              <SwitchField
                checked={config.features.bookingEnabled}
                onChange={(bookingEnabled) =>
                  updateConfig({ features: { bookingEnabled } })
                }
                label="Enable Online Booking"
                description="Allow guests to book and pay directly on your page"
              />
            </FormSection>

            <FormSection>
              <SwitchField
                checked={config.features.reviewsEnabled}
                onChange={(reviewsEnabled) =>
                  updateConfig({ features: { reviewsEnabled } })
                }
                label="Show Reviews"
                description="Display guest reviews and ratings"
              />
            </FormSection>

            <FormSection>
              <SwitchField
                checked={config.features.socialSharingEnabled}
                onChange={(socialSharingEnabled) =>
                  updateConfig({ features: { socialSharingEnabled } })
                }
                label="Social Sharing"
                description="Enable share buttons for social media"
              />
            </FormSection>

            <FormSection>
              <SwitchField
                checked={config.features.chatEnabled}
                onChange={(chatEnabled) =>
                  updateConfig({ features: { chatEnabled } })
                }
                label="Live Chat Support"
                description="Add live chat widget for guest inquiries"
              />
            </FormSection>
          </TabsContent>

          {/* Domain Tab */}
          <TabsContent value="domain">
            <FormSection>
              <FormLabel>Custom Domain</FormLabel>
              <Input
                type="text"
                value={config.branding.customDomain}
                onChange={(e) =>
                  updateConfig({ branding: { customDomain: e.target.value } })
                }
                placeholder="experiences.yourdomain.com"
              />
              <FormHint>
                Point your domain's CNAME record to: gvteway.app
              </FormHint>
              {config.branding.customDomain && (
                <DomainVerificationStatus domain={config.branding.customDomain} />
              )}
            </FormSection>

            <FormSection>
              <FormLabel>Default GVTEWAY URL</FormLabel>
              <CopyableUrl url={`https://gvteway.app/${organizerId}`} />
            </FormSection>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <CustomizerActions>
          <Button
            variant="outline"
            onClick={() => setPreview(!preview)}
          >
            {preview ? 'Hide Preview' : 'Show Preview'}
          </Button>
          <Button
            variant="primary"
            onClick={() => saveConfig(config)}
          >
            Save Changes
          </Button>
        </CustomizerActions>
      </CustomizerSidebar>

      {/* Main Area - Live Preview */}
      <CustomizerMain>
        {preview ? (
          <PreviewFrame>
            <WhiteLabelExperiencePage
              experience={mockExperience}
              organizer={mockOrganizer}
              whitelabel={config}
            />
          </PreviewFrame>
        ) : (
          <EmptyState>
            <InfoIcon />
            <h3>Preview Your Changes</h3>
            <p>Click "Show Preview" to see how your page will look</p>
          </EmptyState>
        )}
      </CustomizerMain>
    </CustomizerLayout>
  );
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

**Objective:** Establish core white-label infrastructure using UI v2 components

**Tasks:**
1. **Create White-Label Theme System**
   - [ ] Build theme engine with auto-generation
   - [ ] Implement CSS variable system
   - [ ] Create theme provider component
   - [ ] Add color utility functions
   - **Reuse from UI v2:** Token system, ThemeProvider base

2. **Build Core Experience Components**
   - [ ] WhiteLabelNav
   - [ ] ExperienceHero with image gallery
   - [ ] QuickInfoBar
   - [ ] ContentGrid layout
   - **Reuse from UI v2:** Card, Button, Badge, Avatar, Divider

3. **Database Schema**
   ```sql
   -- White-label configurations
   CREATE TABLE whitelabel_configs (
     id UUID PRIMARY KEY,
     organizer_id UUID REFERENCES organizers(id),
     logo_url TEXT,
     primary_color VARCHAR(7),
     secondary_color VARCHAR(7),
     display_font VARCHAR(255),
     body_font VARCHAR(255),
     custom_domain VARCHAR(255),
     features JSONB,
     content JSONB,
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );

   -- Experiences
   CREATE TABLE experiences (
     id UUID PRIMARY KEY,
     organizer_id UUID REFERENCES organizers(id),
     title VARCHAR(255),
     description TEXT,
     location JSONB,
     pricing JSONB,
     availability JSONB,
     media JSONB[], -- Array of image/video objects
     inclusions JSONB,
     itinerary JSONB[],
     faq JSONB[],
     cancellation_policy JSONB,
     status VARCHAR(50),
     created_at TIMESTAMP,
     updated_at TIMESTAMP
   );
   ```

4. **API Endpoints**
   ```typescript
   // GET /api/experiences/:id/whitelabel
   // Returns experience data + organizer white-label config

   // GET /api/organizers/:id/whitelabel-config
   // Returns white-label configuration

   // PUT /api/organizers/:id/whitelabel-config
   // Updates white-label configuration

   // POST /api/whitelabel/theme/generate
   // Auto-generates theme from primary color
   ```

**Deliverables:**
- Theme engine functional
- 5 core components built
- Database schema deployed
- API endpoints live

**Estimated Effort:** 40 hours

---

### Phase 2: Content Components (Week 3-4)

**Objective:** Build experience page content sections

**Tasks:**
1. **Experience Content Sections**
   - [ ] Overview with highlights
   - [ ] What's Included lists
   - [ ] Itinerary timeline
   - [ ] Location & venue with map
   - [ ] Host profile
   - **Reuse from UI v2:** Timeline, Accordion, List components

2. **Interactive Components**
   - [ ] Image gallery with lightbox
   - [ ] Reviews section with ratings
   - [ ] FAQ accordion
   - [ ] Social proof widgets
   - **Reuse from UI v2:** Modal, Rating, Accordion

3. **Booking Widget**
   - [ ] Date picker
   - [ ] Guest selector
   - [ ] Add-ons selection
   - [ ] Price breakdown
   - [ ] Sticky positioning
   - **Reuse from UI v2:** DatePicker, Select, Card

4. **Mobile Optimization**
   - [ ] Mobile sticky booking
   - [ ] Touch gestures for gallery
   - [ ] Mobile navigation
   - [ ] Bottom sheet for booking details

**Deliverables:**
- Complete experience page template
- All content sections functional
- Booking widget with calculations
- Mobile-responsive across all breakpoints

**Estimated Effort:** 50 hours

---

### Phase 3: Booking Flow (Week 5)

**Objective:** Complete booking funnel with payment

**Tasks:**
1. **Multi-Step Booking**
   - [ ] Date selection step
   - [ ] Guest details step
   - [ ] Add-ons & upgrades step
   - [ ] Payment step
   - **Reuse from UI v2:** MultiStepForm, FormField components

2. **Payment Integration**
   - [ ] Stripe integration
   - [ ] Payment form
   - [ ] Confirmation screen
   - [ ] Email notifications

3. **Booking Management**
   - [ ] Guest dashboard
   - [ ] Booking details page
   - [ ] Cancellation flow
   - [ ] Modification requests

**Deliverables:**
- End-to-end booking flow
- Payment processing
- Confirmation system
- Guest management

**Estimated Effort:** 30 hours

---

### Phase 4: White-Label Customization (Week 6-7)

**Objective:** Build organizer customization tools

**Tasks:**
1. **Customizer Interface**
   - [ ] Branding tab (logo, colors, fonts)
   - [ ] Content tab (nav links, footer)
   - [ ] Features tab (toggles)
   - [ ] Domain tab (custom domain setup)
   - **Reuse from UI v2:** Tabs, Form components, ColorPicker

2. **Live Preview**
   - [ ] Real-time preview frame
   - [ ] Theme switching
   - [ ] Component highlighting

3. **Domain Management**
   - [ ] Custom domain configuration
   - [ ] SSL certificate provisioning
   - [ ] DNS verification
   - [ ] Redirect handling

4. **Template Library**
   - [ ] Pre-built themes
   - [ ] Industry templates (yacht trips, adventure travel, etc.)
   - [ ] One-click theme application

**Deliverables:**
- Complete customizer interface
- Live preview system
- Custom domain support
- 5 pre-built themes

**Estimated Effort:** 45 hours

---

### Phase 5: ATLVS & COMPVSS Integration (Week 8-9)

**Objective:** Adapt patterns for ATLVS and COMPVSS

**Tasks:**
1. **ATLVS Travel Packages**
   - [ ] Adapt experience template for travel logistics
   - [ ] Athlete-specific itinerary components
   - [ ] Team booking flow
   - [ ] Safety & verification badges

2. **COMPVSS Competition Pages**
   - [ ] Competition landing template
   - [ ] Dual-mode (organizer/participant) views
   - [ ] Live results feed
   - [ ] Registration flow

3. **Cross-Platform Components**
   - [ ] Extract shared components
   - [ ] Create platform-specific variants
   - [ ] Documentation for each platform

**Deliverables:**
- ATLVS travel package template
- COMPVSS competition template
- Shared component library
- Platform integration guides

**Estimated Effort:** 40 hours

---

### Phase 6: Testing & Launch (Week 10)

**Objective:** Quality assurance and production deployment

**Tasks:**
1. **Testing**
   - [ ] Unit tests for all components
   - [ ] Integration tests for booking flow
   - [ ] E2E tests for critical paths
   - [ ] Cross-browser testing
   - [ ] Mobile device testing
   - [ ] Accessibility audit

2. **Performance Optimization**
   - [ ] Image optimization
   - [ ] Code splitting
   - [ ] Lazy loading
   - [ ] CDN setup
   - [ ] Caching strategy

3. **Documentation**
   - [ ] Organizer user guide
   - [ ] Developer documentation
   - [ ] Component storybook
   - [ ] API documentation

4. **Launch Preparation**
   - [ ] Beta testing with select organizers
   - [ ] Feedback incorporation
   - [ ] Production deployment
   - [ ] Marketing materials

**Deliverables:**
- Production-ready platform
- Complete test coverage
- Documentation suite
- Beta feedback incorporated

**Estimated Effort:** 35 hours

---

## Total Implementation Timeline

| Phase | Duration | Effort | Focus |
|-------|----------|--------|-------|
| Phase 1: Foundation | Week 1-2 | 40 hrs | Theme system, core components |
| Phase 2: Content Components | Week 3-4 | 50 hrs | Experience page sections |
| Phase 3: Booking Flow | Week 5 | 30 hrs | End-to-end booking |
| Phase 4: White-Label Customization | Week 6-7 | 45 hrs | Organizer tools |
| Phase 5: Platform Integration | Week 8-9 | 40 hrs | ATLVS/COMPVSS adaptation |
| Phase 6: Testing & Launch | Week 10 | 35 hrs | QA, optimization, docs |
| **Total** | **10 weeks** | **240 hours** | **~1.5 engineers for 10 weeks** |

---

## Component Integration with UI v2

### Direct Reuse (No Modification Needed)

**Primitives:**
- Button, Badge, Avatar, Card, Divider, Input, Label, Checkbox, Radio
- Typography components (Text, Heading)
- Icons

**Compositions:**
- Accordion, Tabs, Modal, DatePicker, Select
- Form components (FormField, FormLabel, FormHint)

### Adaptation Required (Extend UI v2)

**New Compositions for GVTEWAY:**
```typescript
// Extend Card for experience cards
export function ExperienceCard extends Card {
  // Add image overlay, badges, pricing display
}

// Extend Timeline for itineraries
export function ItineraryTimeline extends Timeline {
  // Add day markers, activity details
}

// Extend DataTable for booking management
export function BookingTable extends DataTable {
  // Add status indicators, action buttons
}
```

### New Pattern Components

**GVTEWAY-Specific Patterns:**
- ExperienceHero (full-screen media gallery)
- StickyBookingWidget (complex booking form)
- ReviewCarousel (social proof)
- LocationMap (interactive map)
- HostProfile (organizer showcase)
- WhiteLabelNav (customizable navigation)

**These follow UI v2 architecture:**
- Tree-shakeable exports
- TypeScript generics for flexibility
- Token-based styling
- Composition over configuration
- Accessibility built-in

---

## Success Metrics

### For GVTEWAY Organizers

**Adoption Metrics:**
- 80% of organizers customize branding within first week
- 50% use custom domain within first month
- Average customization session: 15 minutes

**Booking Conversion:**
- Target: 8-12% booking conversion rate (industry standard: 2-5%)
- Mobile booking: >60% of all bookings
- Average booking value: >$500/person

**Guest Experience:**
- Page load time: <2 seconds
- Mobile performance score: >90
- Accessibility score: AAA compliance

### For ATLVS & COMPVSS

**Adoption Metrics:**
- 100% of new travel packages use new templates
- 75% of competitions migrate to new design within 3 months

**Engagement Metrics:**
- Time on page: >3 minutes (up from 1.5 min)
- Bounce rate: <30% (down from 45%)
- Registration completion: >70% (up from 40%)

---

## Risk Mitigation

### Technical Risks

**Risk:** Custom domains may have DNS/SSL issues
- **Mitigation:** Provide detailed setup guide, automated verification, fallback to gvteway.app subdomain

**Risk:** White-label themes may have accessibility issues
- **Mitigation:** Auto-check contrast ratios, provide warnings, enforce WCAG minimums

**Risk:** Booking widget may be slow on mobile
- **Mitigation:** Optimize bundle size, lazy load non-critical components, implement skeleton screens

### Product Risks

**Risk:** Organizers may create poor-quality themes
- **Mitigation:** Provide curated templates, real-time preview, design best practices guide

**Risk:** Too much customization may dilute GVTEWAY brand
- **Mitigation:** Require "Powered by GVTEWAY" footer link, maintain consistent booking flow

---

## Future Enhancements

### Phase 7+ Ideas

1. **AI-Powered Content Generation**
   - Auto-generate experience descriptions from photos
   - Suggest optimal pricing based on market data
   - Create personalized recommendations for guests

2. **Advanced Analytics**
   - Conversion funnel analysis
   - A/B testing for themes
   - Heatmaps and session recordings

3. **Multi-Language Support**
   - Auto-translate experience pages
   - Currency conversion
   - Regional date/time formats

4. **Integration Marketplace**
   - Zapier integration
   - Calendar sync (Google Calendar, Outlook)
   - Email marketing tools (Mailchimp, SendGrid)
   - Accounting software (QuickBooks, Xero)

5. **Advanced Booking Features**
   - Group discounts automation
   - Early bird pricing
   - Dynamic pricing based on demand
   - Payment plans and deposits

6. **Guest Community Features**
   - Pre-trip chat groups
   - Guest profiles and connections
   - Post-trip photo sharing
   - Loyalty rewards program

---

## Conclusion

This strategic plan provides a comprehensive roadmap for incorporating travel/experience booking design patterns into GVTEWAY, ATLVS, and COMPVSS. The white-label GVTEWAY event/experience page template is designed to:

1. **Empower Organizers:** Easy customization without technical knowledge
2. **Convert Guests:** High-converting booking flow with trust signals
3. **Scale Efficiently:** Leverage existing UI v2 component library
4. **Maintain Quality:** Automated accessibility and performance checks

**Next Steps:**
1. Review and approve this strategic plan
2. Prioritize phases based on business goals
3. Assign engineering resources
4. Begin Phase 1 implementation

**Key Success Factors:**
- Reuse UI v2 components to accelerate development
- Focus on mobile-first, conversion-optimized design
- Provide excellent organizer customization experience
- Maintain high performance and accessibility standards

This implementation will position GVTEWAY as a best-in-class experience marketplace platform, while elevating the design quality of ATLVS and COMPVSS to match industry-leading travel and competition platforms.
