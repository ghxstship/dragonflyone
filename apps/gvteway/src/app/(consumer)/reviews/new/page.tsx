"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { Body, Button, Input, Textarea, CreatePage, Box} from "@ghxstship/ui";

export default function NewReviewPage() {
  const router = useRouter();
  const [event, setEvent] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");

  const createReview = useMutation({
    mutationFn: async (data: { event: string; rating: number; text: string }) => {
      const r = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error("Failed to create review");
      return r.json();
    },
    onSuccess: () => router.push("/reviews"),
  });

  const sections = [
    { id: "event", title: "Event", content: (<Box><Body size="sm" className="mb-1">Event Name</Body><Input placeholder="Summer Festival 2024" value={event} onChange={(e) => setEvent(e.target.value)} required /></Box>) },
    { id: "rating", title: "Rating", content: (<Box className="flex gap-2">{Array.from({ length: 5 }).map((_, i) => <Button key={i} variant="ghost" size="sm" onClick={() => setRating(i + 1)}><Star className={`size-8 ${i < rating ? "text-warning fill-warning" : "text-text-disabled"}`} /></Button>)}</Box>) },
    { id: "review", title: "Review", content: (<Box><Body size="sm" className="mb-1">Your Review</Body><Textarea rows={5} placeholder="Share your experience..." value={text} onChange={(e) => setText(e.target.value)} /></Box>) },
  ];

  return (
    <CreatePage
      title="Write a Review"
      subtitle="Share your experience"
      backHref="/reviews"
      backLabel="Reviews"
      sections={sections}
      onSubmit={(e) => { e.preventDefault(); if (event && rating) createReview.mutate({ event, rating, text }); }}
      submitLabel="Submit Review"
      isSubmitting={createReview.isPending}
    />
  );
}
