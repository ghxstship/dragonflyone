"use client";

import { useRouter } from "next/navigation";
import { HelpCircle, MessageSquare, FileText, Phone, List } from "lucide-react";
import { Body, Button, Card, Grid, DetailPage, Section, SectionHeader, Box} from "@ghxstship/ui";

export default function HelpPage() {
  const router = useRouter();

  const tabs = [{
    id: "help", label: "Help", icon: <List className="size-4" />,
    content: (
      <Section>
        <SectionHeader title="How can we help?" description="Find answers and get support" />
        <Grid cols={3} gap={6} className="grid-cols-1 md:grid-cols-3 mt-6">
          <Card className="p-6 text-center cursor-pointer hover:border-primary transition-colors" onClick={() => router.push("/help/faq")}>
            <HelpCircle className="size-12 text-primary mx-auto mb-4" />
            <Body className="font-weight-bold">FAQ</Body>
            <Body size="sm" className="text-on-dark-muted mt-2">Find answers to common questions</Body>
          </Card>
          <Card className="p-6 text-center cursor-pointer hover:border-primary transition-colors" onClick={() => router.push("/support/chat")}>
            <MessageSquare className="size-12 text-primary mx-auto mb-4" />
            <Body className="font-weight-bold">Live Chat</Body>
            <Body size="sm" className="text-on-dark-muted mt-2">Chat with our support team</Body>
          </Card>
          <Card className="p-6 text-center cursor-pointer hover:border-primary transition-colors" onClick={() => router.push("/help/docs")}>
            <FileText className="size-12 text-primary mx-auto mb-4" />
            <Body className="font-weight-bold">Documentation</Body>
            <Body size="sm" className="text-on-dark-muted mt-2">Browse our help articles</Body>
          </Card>
        </Grid>
        <Card className="p-6 mt-6">
          <Box className="flex items-center justify-between">
            <Box className="flex items-center gap-4">
              <Phone className="size-8 text-primary" />
              <Box><Body className="font-weight-bold">Need immediate help?</Body><Body size="sm" className="text-on-dark-muted">Call us at 1-800-GVTEWAY</Body></Box>
            </Box>
            <Button variant="outline">Call Now</Button>
          </Box>
        </Card>
      </Section>
    ),
  }];

  return <DetailPage header={{ kicker: "Support", title: "Help Center", description: "Get the help you need" }} tabs={tabs} />;
}
