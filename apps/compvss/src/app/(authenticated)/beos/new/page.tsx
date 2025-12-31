"use client";

/**
 * New BEO Page
 * Create a new Banquet Event Order
 * Uses CreatePage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import {
  Body, Input, Textarea, CreatePage, useToast, Box} from "@ghxstship/ui";

export default function NewBEOPage() {
  const router = useRouter();
  const toast = useToast();
  const [eventName, setEventName] = useState("");
  const [client, setClient] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!eventName.trim()) newErrors.eventName = "Event name is required";
    if (!client.trim()) newErrors.client = "Client is required";
    if (!date) newErrors.date = "Event date is required";
    if (guests && (isNaN(parseInt(guests)) || parseInt(guests) < 0)) {
      newErrors.guests = "Expected guests must be a positive number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createBEO = useMutation({
    mutationFn: async (data: { eventName: string; client: string; date: string; guests: number; notes: string }) => {
      const response = await fetch("/api/beos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create BEO");
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success("BEO Created", "Banquet Event Order created successfully");
      router.push(`/beos/${data.id}`);
    },
    onError: (error: Error) => {
      toast.error("Error", error.message);
    },
  });

  const handleSubmit = () => {
    if (!validateForm()) return;
    createBEO.mutate({ eventName: eventName.trim(), client: client.trim(), date, guests: parseInt(guests) || 0, notes: notes.trim() });
  };

  const handleChange = (field: string, value: string) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
    switch (field) {
      case "eventName": setEventName(value); break;
      case "client": setClient(value); break;
      case "date": setDate(value); break;
      case "guests": setGuests(value); break;
      case "notes": setNotes(value); break;
    }
  };

  const sections = [
    {
      id: "event",
      title: "Event Details",
      content: (
        <Box className="space-y-4">
          <Box>
            <Body size="sm" className="mb-1">Event Name *</Body>
            <Input placeholder="Corporate Gala 2024" value={eventName} onChange={(e) => handleChange("eventName", e.target.value)} error={!!errors.eventName} />
            {errors.eventName && <Body size="sm" className="text-error mt-1">{errors.eventName}</Body>}
          </Box>
          <Box>
            <Body size="sm" className="mb-1">Client *</Body>
            <Input placeholder="Client name" value={client} onChange={(e) => handleChange("client", e.target.value)} error={!!errors.client} />
            {errors.client && <Body size="sm" className="text-error mt-1">{errors.client}</Body>}
          </Box>
          <Box className="grid grid-cols-2 gap-4">
            <Box>
              <Body size="sm" className="mb-1">Event Date *</Body>
              <Input type="date" value={date} onChange={(e) => handleChange("date", e.target.value)} error={!!errors.date} />
              {errors.date && <Body size="sm" className="text-error mt-1">{errors.date}</Body>}
            </Box>
            <Box>
              <Body size="sm" className="mb-1">Expected Guests</Body>
              <Input type="number" min="1" placeholder="100" value={guests} onChange={(e) => handleChange("guests", e.target.value)} error={!!errors.guests} />
              {errors.guests && <Body size="sm" className="text-error mt-1">{errors.guests}</Body>}
            </Box>
          </Box>
        </Box>
      ),
    },
    {
      id: "notes",
      title: "Additional Notes",
      content: (
        <Box>
          <Body size="sm" className="mb-1">Notes</Body>
          <Textarea rows={4} placeholder="Special requirements, dietary restrictions, etc." value={notes} onChange={(e) => handleChange("notes", e.target.value)} />
        </Box>
      ),
    },
  ];

  return (
    <CreatePage
      title="New Banquet Event Order"
      subtitle="Create a new event order"
      breadcrumbs={[
        { label: "BEOs", href: "/beos" },
        { label: "New BEO" },
      ]}
      backHref="/beos"
      backLabel="Back to BEOs"
      sections={sections}
      onSubmit={handleSubmit}
      submitLabel="Create BEO"
      isSubmitting={createBEO.isPending}
      isValid={!!eventName && !!client && !!date}
    />
  );
}
