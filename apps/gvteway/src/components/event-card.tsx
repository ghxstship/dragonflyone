'use client';

import { useRouter } from 'next/navigation';
import { Article, Stack, Badge, H3, Body, Button, Figure } from '@ghxstship/ui';
import Image from 'next/image';

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  venue: string;
  price: number;
  image?: string;
  category?: string;
}

export function EventCard({
  id,
  title,
  date,
  venue,
  price,
  image,
  category,
}: EventCardProps) {
  const router = useRouter();

  return (
    <Article
      variant="bordered"
      className="group cursor-pointer pop-card h-full flex flex-col"
      onClick={() => router.push(`/events/${id}`)}
    >
      {image && (
        <Figure className="relative aspect-video w-full overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </Figure>
      )}
      {/* Card content - grows to fill available space */}
      <Stack className="p-6 flex-1" gap={3}>
        {category && (
          <Badge variant="outline" className="self-start">
            {category}
          </Badge>
        )}
        <H3 className="text-h6-md font-weight-bold uppercase">{title}</H3>
        <Stack gap={2} className="flex-1">
          <Body className="font-mono">{date}</Body>
          <Body className="text-on-light-secondary">{venue}</Body>
          <Body className="font-weight-bold">From ${price}</Body>
        </Stack>
        {/* CTA - anchored at bottom */}
        <Button variant="solid" className="w-full mt-auto">
          View Details
        </Button>
      </Stack>
    </Article>
  );
}
