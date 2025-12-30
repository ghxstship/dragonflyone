"use client";

import { useParams, useRouter } from "next/navigation";
import { Calendar, MapPin, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Body, Card, Grid, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";

interface Event { id: string; name: string; date: string; venue: string; price: number; }
interface Collection { id: string; name: string; description: string; events: Event[]; }
const DEMO: Collection = { id: "1", name: "Summer Festivals", description: "Best summer festivals", events: [{ id: "1", name: "Summer Festival 2024", date: "2024-12-20", venue: "Central Park", price: 75 }] };

export default function CollectionPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.id as string;

  const { data: collection = DEMO, isLoading, error, refetch } = useQuery({
    queryKey: ["collection", collectionId],
    queryFn: async () => { const r = await fetch(`/api/collections/${collectionId}`); if (!r.ok) return DEMO; return (await r.json()).collection || DEMO; },
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const formatCurrency = (a: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(a);

  const tabs = [{
    id: "collection", label: "Collection", icon: <List className="size-4" />,
    content: (
      <Section>
        <Card className="p-6 mb-6"><Body className="text-on-dark-secondary">{collection.description}</Body></Card>
        <SectionHeader title="Events" description={`${collection.events.length} events in this collection`} />
        <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mt-4">
          {collection.events.map((event: Event) => (
            <Card key={event.id} className="overflow-hidden cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/e/${event.id}`)}>
              <Box className="h-32 bg-grey-800 flex items-center justify-center"><Calendar className="size-8 text-on-dark-disabled" /></Box>
              <Box className="p-4">
                <Body className="font-weight-bold">{event.name}</Body>
                <Box className="flex items-center gap-2 mt-2 text-on-dark-muted"><Calendar className="size-4" /><Body size="sm">{formatDate(event.date)}</Body></Box>
                <Box className="flex items-center gap-2 text-on-dark-muted"><MapPin className="size-4" /><Body size="sm">{event.venue}</Body></Box>
                <Body className="font-weight-bold mt-2">From {formatCurrency(event.price)}</Body>
              </Box>
            </Card>
          ))}
        </Grid>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Collection", title: collection.name, description: `${collection.events.length} events` }} backButton={{ label: "Collections", href: "/collections" }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
