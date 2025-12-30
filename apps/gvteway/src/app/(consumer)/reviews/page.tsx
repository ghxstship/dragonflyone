"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star, Search, Plus, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Body, Button, Card, Input, DetailPage, Section, Box} from "@ghxstship/ui";

interface Review { id: string; event: string; rating: number; text: string; date: string; }
const DEMO: Review[] = [
  { id: "1", event: "Summer Festival 2024", rating: 5, text: "Amazing experience!", date: "2024-12-15" },
  { id: "2", event: "Jazz Night", rating: 4, text: "Great music and atmosphere", date: "2024-12-10" },
];

export default function ReviewsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: reviews = [], isLoading, error, refetch } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => { const r = await fetch("/api/reviews"); if (!r.ok) return DEMO; return (await r.json()).reviews?.length ? (await r.json()).reviews : DEMO; },
  });

  const filtered = reviews.filter((r: Review) => r.event.toLowerCase().includes(search.toLowerCase()));
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const tabs = [{
    id: "reviews", label: "Reviews", icon: <List className="size-4" />,
    content: (
      <Section>
        <Box className="flex gap-4 items-center mb-6">
          <Box className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" /><Input placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></Box>
        </Box>
        {filtered.length === 0 ? (
          <Card className="p-8 text-center"><Star className="size-12 text-on-dark-disabled mx-auto mb-4" /><Body className="font-weight-medium mb-2">No reviews yet</Body><Body className="text-on-dark-muted mb-4">Share your event experiences</Body><Button variant="solid" onClick={() => router.push("/reviews/new")}>Write a Review</Button></Card>
        ) : (
          <Box className="space-y-4">
            {filtered.map((review: Review) => (
              <Card key={review.id} className="p-6">
                <Box className="flex items-start justify-between">
                  <Box>
                    <Body className="font-weight-bold">{review.event}</Body>
                    <Box className="flex items-center gap-1 mt-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`size-4 ${i < review.rating ? "text-warning fill-warning" : "text-on-dark-disabled"}`} />)}</Box>
                    <Body className="text-on-dark-secondary mt-3">{review.text}</Body>
                  </Box>
                  <Body size="sm" className="text-on-dark-disabled">{formatDate(review.date)}</Body>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Feedback", title: "My Reviews", description: "Your event reviews" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left" onClick={() => router.push("/reviews/new")}>Write Review</Button>} />;
}
