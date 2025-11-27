"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  PageLayout,
  Navigation,
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
  SectionLayout,
  Container,
  Stack,
  Link,
} from "@ghxstship/ui";

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
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
          cta={<Button variant="outlineWhite" size="sm" onClick={() => router.push('/auth/signin')}>SIGN IN</Button>}
        >
          <Link href="/" className="font-heading text-body-sm uppercase tracking-widest hover:text-ink-400">Home</Link>
          <Link href="/events" className="font-heading text-body-sm uppercase tracking-widest hover:text-ink-400">Events</Link>
        </Navigation>
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES."
        >
          <FooterColumn title="Account">
            <FooterLink href="/profile">Profile</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Container size="lg">
          <Stack gap={8}>
            <H2 className="text-white">Event Reviews</H2>

            <Select
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              className="bg-black text-white border-ink-700 w-48"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
            </Select>

            <Stack gap={4}>
              {filteredReviews.map((review) => (
                <Card key={review.id} className="border-2 border-ink-800 p-6 bg-black">
                  <Stack gap={4}>
                    <Stack gap={2} direction="horizontal" className="justify-between items-start">
                      <Stack gap={1}>
                        <H3 className="text-white">{review.event}</H3>
                        <Body className="text-body-sm text-ink-400">{review.user} • {review.date}</Body>
                      </Stack>
                      <Badge>{"⭐".repeat(review.rating)}</Badge>
                    </Stack>
                    <Body className="text-ink-300">{review.comment}</Body>
                  </Stack>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Container>
      </SectionLayout>
    </PageLayout>
  );
}
