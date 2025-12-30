"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Body, Input, Textarea, CreatePage, Box} from "@ghxstship/ui";

export default function CreateEventPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [description, setDescription] = useState("");

  const createEvent = useMutation({
    mutationFn: async (data: { name: string; date: string; venue: string; description: string }) => {
      const response = await fetch("/api/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!response.ok) throw new Error("Failed to create event");
      return response.json();
    },
    onSuccess: (data) => router.push(`/e/${data.id}`),
  });

  const sections = [
    { id: "details", title: "Event Details", content: (
      <Box className="space-y-4">
        <Box><Body size="sm" className="mb-1">Event Name</Body><Input placeholder="Summer Festival 2024" value={name} onChange={(e) => setName(e.target.value)} required /></Box>
        <Box className="grid grid-cols-2 gap-4">
          <Box><Body size="sm" className="mb-1">Date</Body><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></Box>
          <Box><Body size="sm" className="mb-1">Venue</Body><Input placeholder="Central Park" value={venue} onChange={(e) => setVenue(e.target.value)} required /></Box>
        </Box>
        <Box><Body size="sm" className="mb-1">Description</Body><Textarea rows={4} placeholder="Event description..." value={description} onChange={(e) => setDescription(e.target.value)} /></Box>
      </Box>
    )},
  ];

  return (
    <CreatePage
      title="Create Event"
      subtitle="Set up a new event"
      backHref="/events"
      backLabel="Events"
      sections={sections}
      onSubmit={(e) => { e.preventDefault(); if (name && date && venue) createEvent.mutate({ name, date, venue, description }); }}
      submitLabel="Create Event"
      isSubmitting={createEvent.isPending}
    />
  );
}
