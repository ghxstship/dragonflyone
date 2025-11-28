"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  H2,
  H3,
  Body,
  Button,
  Badge,
  Card,
  Select,
  Section,
  Container,
  Stack,
  Kicker,
  Label,
} from "@ghxstship/ui";
import { Star } from "lucide-react";

const reviews = [
  { id: "REV-001", event: "Ultra Music Festival 2024", user: "Sarah M.", rating: 5, date: "2024-10-15", comment: "Incredible experience! Production quality was amazing." },
  { id: "REV-002", event: "Rolling Loud Miami", user: "Mike T.", rating: 4, date: "2024-10-10", comment: "Great lineup, but lines were too long." },
  { id: "REV-003", event: "Art Basel After Dark", user: "Lisa K.", rating: 5, date: "2024-10-05", comment: "Perfect venue and atmosphere!" },
];

export default function ReviewsPage() {
  const router = useRouter();
  const [filterRating, setFilterRating] = useState("all");

  const filteredReviews = reviews.filter(r => 
    filterRating === "all" || r.rating === parseInt(filterRating)
  );

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
            <FooterLink href="/reviews">Reviews</FooterLink>
          </FooterColumn>
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
            <FooterLink href="/venues">Find Venues</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        {/* Grid Pattern Background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(#fff 1px, transparent 1px),
              linear-gradient(90deg, #fff 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Community</Kicker>
              <H2 size="lg" className="text-white">Event Reviews</H2>
              <Body className="text-on-dark-muted">See what others are saying about events</Body>
            </Stack>

            {/* Filter */}
            <Card inverted className="p-4">
              <Stack gap={2} direction="horizontal" className="items-center">
                <Label size="xs" className="text-on-dark-muted">Filter by rating</Label>
                <Select
                  value={filterRating}
                  onChange={(e) => setFilterRating(e.target.value)}
                  inverted
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                </Select>
              </Stack>
            </Card>

            {/* Reviews List */}
            <Stack gap={4}>
              {filteredReviews.map((review) => (
                <Card key={review.id} inverted interactive>
                  <Stack gap={4}>
                    <Stack gap={2} direction="horizontal" className="items-start justify-between">
                      <Stack gap={1}>
                        <H3 className="text-white">{review.event}</H3>
                        <Label size="xs" className="text-on-dark-disabled">{review.user} • {review.date}</Label>
                      </Stack>
                      <Badge variant="solid">
                        <Star className="mr-1 inline size-3 fill-current" />
                        {review.rating}
                      </Badge>
                    </Stack>
                    <Body className="text-on-dark-muted">{review.comment}</Body>
                  </Stack>
                </Card>
              ))}
            </Stack>

            {/* Write Review CTA */}
            <Card inverted variant="elevated" className="p-6">
              <Stack gap={4} direction="horizontal" className="items-center justify-between">
                <Stack gap={1}>
                  <H3 className="text-white">Share Your Experience</H3>
                  <Body className="text-on-dark-muted">Help others by reviewing events you&apos;ve attended</Body>
                </Stack>
                <Button variant="solid" inverted onClick={() => router.push('/reviews/new')}>
                  Write a Review
                </Button>
              </Stack>
            </Card>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
