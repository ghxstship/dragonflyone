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
      className="group cursor-pointer transition-all hover:shadow-lg"
      onClick={() => router.push(`/events/${id}`)}
    >
      {image && (
        <Figure className="relative aspect-video w-full overflow-hidden bg-grey-200">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        </Figure>
      )}
      <Stack className="p-6" gap={3}>
        {category && (
          <Badge variant="outline" className="self-start">
            {category}
          </Badge>
        )}
        <H3 className="text-h6-md font-bold uppercase">{title}</H3>
        <Stack gap={2} className="text-body-sm">
          <Body className="font-mono">{date}</Body>
          <Body className="text-grey-600">{venue}</Body>
          <Body className="font-bold">From ${price}</Body>
        </Stack>
        <Button variant="solid" className="w-full mt-2">
          View Details
        </Button>
      </Stack>
    </Article>
  );
}
