"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Plus, Minus, ShoppingCart, List } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Body, Button, Card, DetailPage, Section } from "@ghxstship/ui";

interface TicketType { id: string; name: string; price: number; available: number; description: string; }
const DEMO_TICKETS: TicketType[] = [
  { id: "1", name: "General Admission", price: 75, available: 500, description: "Standard entry" },
  { id: "2", name: "VIP", price: 150, available: 100, description: "VIP area access" },
  { id: "3", name: "Premium", price: 250, available: 50, description: "Premium experience" },
];

export default function EventTicketsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const { data: tickets = [], isLoading, error, refetch } = useQuery({
    queryKey: ["event-tickets", eventId],
    queryFn: async () => {
      const response = await fetch(`/api/events/${eventId}/tickets`);
      if (!response.ok) return DEMO_TICKETS;
      return (await response.json()).tickets?.length ? (await response.json()).tickets : DEMO_TICKETS;
    },
  });

  const addToCart = useMutation({
    mutationFn: async (items: { ticketId: string; quantity: number }[]) => {
      const response = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items }) });
      if (!response.ok) throw new Error("Failed to add to cart");
      return response.json();
    },
    onSuccess: () => router.push("/cart"),
  });

  const formatCurrency = (a: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(a);
  const updateQuantity = (id: string, delta: number) => setQuantities((prev) => ({ ...prev, [id]: Math.max(0, (prev[id] || 0) + delta) }));
  const total = tickets.reduce((sum: number, t: TicketType) => sum + t.price * (quantities[t.id] || 0), 0);
  const hasItems = Object.values(quantities).some((q) => q > 0);

  const handleCheckout = () => {
    const items = Object.entries(quantities).filter(([, q]) => q > 0).map(([ticketId, quantity]) => ({ ticketId, quantity }));
    addToCart.mutate(items);
  };

  const tabs = [{
    id: "tickets", label: "Tickets", icon: <List className="size-4" />,
    content: (
      <Section>
        <div className="space-y-4 mb-6">
          {tickets.map((ticket: TicketType) => (
            <Card key={ticket.id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <Body className="font-weight-bold">{ticket.name}</Body>
                  <Body size="sm" className="text-grey-400">{ticket.description}</Body>
                  <Body size="sm" className="text-grey-500 mt-1">{ticket.available} available</Body>
                </div>
                <div className="flex items-center gap-6">
                  <Body className="font-weight-bold">{formatCurrency(ticket.price)}</Body>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(ticket.id, -1)} disabled={(quantities[ticket.id] || 0) === 0}><Minus className="size-4" /></Button>
                    <Body className="w-8 text-center font-weight-bold">{quantities[ticket.id] || 0}</Body>
                    <Button variant="outline" size="sm" onClick={() => updateQuantity(ticket.id, 1)} disabled={(quantities[ticket.id] || 0) >= ticket.available}><Plus className="size-4" /></Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {hasItems && (
          <Card className="p-6 border-primary">
            <div className="flex items-center justify-between">
              <div><Body className="text-grey-400">Total</Body><Body className="font-weight-bold">{formatCurrency(total)}</Body></div>
              <Button variant="solid" icon={<ShoppingCart className="size-4" />} iconPosition="left" onClick={handleCheckout} disabled={addToCart.isPending}>{addToCart.isPending ? "Adding..." : "Add to Cart"}</Button>
            </div>
          </Card>
        )}
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Event", title: "Select Tickets", description: "Choose your tickets" }} backButton={{ label: "Event", href: `/e/${eventId}` }} loading={isLoading} error={error instanceof Error ? error : null} onRetry={refetch} tabs={tabs} />;
}
