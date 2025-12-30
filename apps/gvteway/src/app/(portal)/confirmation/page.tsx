"use client";

import { useRouter } from "next/navigation";
import { CheckCircle, Ticket, Download, Share2, List } from "lucide-react";
import { Body, Button, Card, Grid, DetailPage, Section } from "@ghxstship/ui";

export default function ConfirmationPage() {
  const router = useRouter();

  const tabs = [{
    id: "confirmation", label: "Confirmation", icon: <List className="size-4" />,
    content: (
      <Section>
        <Card className="p-8 text-center mb-6">
          <CheckCircle className="size-16 text-success mx-auto mb-4" />
          <Body className="font-weight-bold mb-2">Order Confirmed!</Body>
          <Body className="text-on-dark-muted">Your tickets have been sent to your email</Body>
          <Body className="font-weight-bold mt-4">Order #GVT-2024-001234</Body>
        </Card>
        <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mb-6">
          <Card className="p-6 text-center cursor-pointer hover:border-primary transition-colors">
            <Ticket className="size-8 text-primary mx-auto mb-3" />
            <Body className="font-weight-bold">View Tickets</Body>
            <Body size="sm" className="text-on-dark-muted">Access your digital tickets</Body>
          </Card>
          <Card className="p-6 text-center cursor-pointer hover:border-primary transition-colors">
            <Download className="size-8 text-primary mx-auto mb-3" />
            <Body className="font-weight-bold">Download PDF</Body>
            <Body size="sm" className="text-on-dark-muted">Save tickets to your device</Body>
          </Card>
        </Grid>
        <div className="flex gap-4 justify-center">
          <Button variant="solid" onClick={() => router.push("/browse")}>Browse More Events</Button>
          <Button variant="outline" icon={<Share2 className="size-4" />} iconPosition="left">Share</Button>
        </div>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Success", title: "Order Confirmed", description: "Thank you for your purchase" }} tabs={tabs} />;
}
