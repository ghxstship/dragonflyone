import { Badge, H3, Body, Stack, Article, Link, Figure } from "@ghxstship/ui";
import Image from "next/image";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    image: string;
    venue: string;
    city: string;
    date: string;
    genre: string;
    priceRange: string;
  };
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`} className="group block">
      <Article variant="bordered" className="transition-colors hover:border-white">
        <Figure className="relative h-64 overflow-hidden bg-grey-900">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover grayscale transition-transform group-hover:scale-105"
          />
        </Figure>
        <Stack className="p-6" gap={2}>
          <H3 className="font-display text-2xl text-white">{event.title}</H3>
          <Body className="text-sm text-grey-400">{event.venue} • {event.city}</Body>
          <Body className="font-mono text-sm uppercase tracking-wider text-grey-500">{event.date}</Body>
          <Stack direction="horizontal" className="mt-2 items-center justify-between">
            <Badge>{event.genre}</Badge>
            <Body className="font-mono text-sm text-white">{event.priceRange}</Body>
          </Stack>
        </Stack>
      </Article>
    </Link>
  );
}
