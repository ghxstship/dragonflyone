"use client";

import { useParams } from "next/navigation";
import { List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge, Body, Button, Card, Grid, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";

interface Service { id: string; name: string; category: string; price: number; description: string; }
const DEMO_SERVICES: Service[] = [
  { id: "1", name: "VIP Parking", category: "Parking", price: 50, description: "Reserved parking spot" },
  { id: "2", name: "Locker Rental", category: "Storage", price: 25, description: "Secure storage locker" },
  { id: "3", name: "Meal Package", category: "Food", price: 75, description: "3 meals + drinks" },
];

export default function EventServicesPage() {
  const params = useParams();
  const eventId = params.eventId as string;

  const { data: services = [], isLoading, error, refetch } = useQuery({
    queryKey: ["event-services", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/services`);
      if (!response.ok) return DEMO_SERVICES;
      return (await response.json()).services?.length ? (await response.json()).services : DEMO_SERVICES;
    },
  });

  const formatCurrency = (a: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(a);

  const tabs = [{
    id: "services", label: "Services", icon: <List className="size-4" />,
    content: (
      <Section>
        <SectionHeader title="Add-On Services" description="Enhance your experience" />
        <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mt-4">
          {services.map((service: Service) => (
            <Card key={service.id} className="p-6">
              <Badge variant="outline" className="mb-3">{service.category}</Badge>
              <Body className="font-weight-bold">{service.name}</Body>
              <Body size="sm" className="text-on-dark-muted mt-1">{service.description}</Body>
              <Box className="flex items-center justify-between mt-4">
                <Body className="font-weight-bold">{formatCurrency(service.price)}</Body>
                <Button variant="outline" size="sm">Add</Button>
              </Box>
            </Card>
          ))}
        </Grid>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Event", title: "Services", description: "Add-on services and upgrades" }} backButton={{ label: "Event", href: `/e/${eventId}` }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
