"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, Input, Select, Stack, Grid, Body } from "@ghxstship/ui";

const statusOptions = [
  { label: "Draft", value: "draft" },
  { label: "On Sale", value: "on-sale" },
  { label: "Sold Out", value: "sold-out" },
];

const priceBands = ["$", "$$", "$$$"] as const;

type PriceBand = (typeof priceBands)[number];

type FormState = {
  title: string;
  slug: string;
  headliner: string;
  venue: string;
  city: string;
  startDate: string;
  status: string;
  priceRange: PriceBand;
  genres: string;
  tags: string;
};

const defaultState: FormState = {
  title: "",
  slug: "",
  headliner: "",
  venue: "",
  city: "",
  startDate: "",
  status: "draft",
  priceRange: "$$",
  genres: "",
  tags: "",
};

export function EventCreationForm() {
  const [form, setForm] = useState<FormState>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function handleChange<TKey extends keyof FormState>(key: TKey, value: FormState[TKey]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          genres: form.genres
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          experienceTags: form.tags
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Unable to create event");
      }

      setMessage("Event created and ready for publishing.");
      setForm(defaultState);
    } catch (error) {
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Unexpected error creating event");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap={4}>
      <Grid cols={2} gap={4}>
        <Field label="Title">
          <Input required value={form.title} onChange={(event) => handleChange("title", event.target.value)} />
        </Field>
        <Field label="Slug">
          <Input
            required
            value={form.slug}
            placeholder="ghxstship-miami-2025"
            onChange={(event) => handleChange("slug", event.target.value)}
          />
        </Field>
      </Grid>
      <Grid cols={2} gap={4}>
        <Field label="Headliner">
          <Input required value={form.headliner} onChange={(event) => handleChange("headliner", event.target.value)} />
        </Field>
        <Field label="Venue">
          <Input required value={form.venue} onChange={(event) => handleChange("venue", event.target.value)} />
        </Field>
      </Grid>
      <Grid cols={3} gap={4}>
        <Field label="City">
          <Input required value={form.city} onChange={(event) => handleChange("city", event.target.value)} />
        </Field>
        <Field label="Start Date">
          <Input
            required
            type="datetime-local"
            value={form.startDate}
            onChange={(event) => handleChange("startDate", event.target.value)}
          />
        </Field>
        <Field label="Status">
          <Select value={form.status} onChange={(event) => handleChange("status", event.target.value)}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </Grid>
      <Grid cols={2} gap={4}>
        <Field label="Price Band">
          <Select value={form.priceRange} onChange={(event) => handleChange("priceRange", event.target.value as PriceBand)}>
            {priceBands.map((band) => (
              <option key={band} value={band}>
                {band}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Genres" hint="Comma separated">
          <Input value={form.genres} onChange={(event) => handleChange("genres", event.target.value)} />
        </Field>
      </Grid>
      <Field label="Experience Tags" hint="Comma separated">
        <Input value={form.tags} onChange={(event) => handleChange("tags", event.target.value)} />
      </Field>
      <Button type="submit" disabled={isSubmitting} variant="outline">
        {isSubmitting ? "Saving…" : "Create event"}
      </Button>
      {message ? <Body className="text-sm text-ink-300">{message}</Body> : null}
      </Stack>
    </form>
  );
}
