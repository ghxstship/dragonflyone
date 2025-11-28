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
  Input,
  Badge,
  Card,
  Section,
  Container,
  Stack,
  useDebounce,
  Link,
} from "@ghxstship/ui";

const mockResults = [
  { id: "1", type: "Event", title: "Ultra Music Festival 2025", location: "Miami, FL", date: "Mar 28-30" },
  { id: "2", type: "Venue", title: "Bayfront Park", location: "Miami, FL", capacity: "65,000" },
  { id: "3", type: "Event", title: "Rolling Loud Miami", location: "Miami Gardens, FL", date: "May 9-11" },
  { id: "4", type: "Artist", title: "Armin van Buuren", genre: "Trance", followers: "2.1M" },
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  
  const results = debouncedQuery ? mockResults.filter(r => 
    r.title.toLowerCase().includes(debouncedQuery.toLowerCase())
  ) : [];

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
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Discover">
            <FooterLink href="/events">Browse Events</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black">
        <Container size="lg">
          <Stack gap={8}>
            <H2 className="text-white">Search</H2>
            <Input
              type="search"
              placeholder="Search events, venues, artists..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="border-ink-700 bg-black text-white text-body-md"
            />
            {debouncedQuery && (
              <Stack gap={4}>
                <Body className="font-mono text-body-sm uppercase tracking-widest text-ink-400">
                  {results.length} {results.length === 1 ? "Result" : "Results"}
                </Body>
                {results.map((result) => (
                  <Card key={result.id} className="border-2 border-ink-800 p-6 bg-black">
                    <Stack gap={2}>
                      <Badge variant="outline">{result.type}</Badge>
                      <H3 className="text-white">{result.title}</H3>
                      <Body className="text-ink-400">
                        {result.location || result.genre}
                        {result.date && ` • ${result.date}`}
                        {result.capacity && ` • ${result.capacity} capacity`}
                        {result.followers && ` • ${result.followers} followers`}
                      </Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
