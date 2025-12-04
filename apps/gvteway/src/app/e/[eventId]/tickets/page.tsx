"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Badge } from "@ghxstship/ui";
import { Ticket, Clock, Grid } from "lucide-react";
import { gvtewayDemoEvents } from "../../../../data/gvteway";

export default function EventTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;
  const event = gvtewayDemoEvents.find((e) => e.id === eventId);

  const ticketTypes = [
    { id: "1", name: "General Admission", price: 75, available: 300, status: "available" },
    { id: "2", name: "VIP Access", price: 150, available: 50, status: "available" },
    { id: "3", name: "Premium Package", price: 250, available: 10, status: "low" },
    { id: "4", name: "Early Bird", price: 60, available: 0, status: "sold_out" },
  ];

  const statusColors: Record<string, "success" | "warning" | "error" | "info" | "solid"> = {
    available: "success", low: "warning", sold_out: "error",
  };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={event?.name || "Event"}
          title="Tickets"
          description="Select your ticket type"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="outline" size="sm" onClick={() => router.push(`/e/${eventId}/seating`)}>
            <Grid size={16} className="mr-2" />
            View Seating
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(`/e/${eventId}/waitlist`)}>
            <Clock size={16} className="mr-2" />
            Join Waitlist
          </Button>
        </Stack>
      </Stack>

      <Stack gap={4}>
        {ticketTypes.map((ticket) => (
          <Card key={ticket.id} variant="elevated" inverted>
            <CardBody>
              <Stack direction="horizontal" gap={4} className="items-center justify-between">
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Ticket size={24} className="text-primary" />
                  <Stack gap={1}>
                    <Body className="font-weight-bold text-white">{ticket.name}</Body>
                    <Body className="text-body-sm text-on-dark-muted">
                      {ticket.available > 0 ? `${ticket.available} available` : "Sold out"}
                    </Body>
                  </Stack>
                </Stack>
                <Stack direction="horizontal" gap={4} className="items-center">
                  <Body className="font-weight-bold text-white">${ticket.price}</Body>
                  <Badge variant={statusColors[ticket.status]}>
                    {ticket.status === "sold_out" ? "SOLD OUT" : ticket.status === "low" ? "LOW STOCK" : "AVAILABLE"}
                  </Badge>
                  <Button 
                    variant={ticket.status === "sold_out" ? "outline" : "solid"} 
                    size="sm"
                    disabled={ticket.status === "sold_out"}
                  >
                    {ticket.status === "sold_out" ? "Notify Me" : "Select"}
                  </Button>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
