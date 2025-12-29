"use client";

/**
 * Proposal Page
 * Public proposal viewing and acceptance page
 * Uses DetailPage template for consistent layout
 */

import { useParams, useRouter } from "next/navigation";
import { FileText, CheckCircle, Clock, DollarSign, Calendar, List, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface Proposal {
  id: string;
  title: string;
  client: string;
  amount: number;
  validUntil: string;
  status: "pending" | "accepted" | "declined";
  sections: { title: string; content: string }[];
}

const DEMO_PROPOSAL: Proposal = {
  id: "1",
  title: "Summer Festival Production Services",
  client: "Acme Productions",
  amount: 75000,
  validUntil: "2024-12-31",
  status: "pending",
  sections: [
    { title: "Overview", content: "Complete production services for your summer festival including staging, lighting, and sound." },
    { title: "Scope of Work", content: "Full production management, equipment rental, crew staffing, and on-site coordination." },
    { title: "Timeline", content: "Pre-production: 4 weeks, Load-in: 3 days, Event: 2 days, Load-out: 2 days" },
  ],
};

export default function ProposalPage() {
  const params = useParams();
  const router = useRouter();
  const token = params.token as string;

  const { data: proposal = DEMO_PROPOSAL, isLoading, error, refetch } = useQuery({
    queryKey: ["proposal", token],
    queryFn: async () => {
      const response = await fetch(`/api/proposals/${token}`);
      if (!response.ok) return DEMO_PROPOSAL;
      const data = await response.json();
      return data.proposal || DEMO_PROPOSAL;
    },
  });

  const updateProposal = useMutation({
    mutationFn: async (status: "accepted" | "declined") => {
      const response = await fetch(`/api/proposals/${token}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("Failed to update proposal");
      return response.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

  const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(amount);
  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const STATUS_CONFIG = {
    pending: { label: "Pending Review", variant: "warning" as const },
    accepted: { label: "Accepted", variant: "success" as const },
    declined: { label: "Declined", variant: "error" as const },
  };

  const tabs = [
    {
      id: "proposal",
      label: "Proposal",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <Body className="font-weight-bold font-weight-bold">{proposal.title}</Body>
                <Body className="text-grey-400">Prepared for {proposal.client}</Body>
              </div>
              <Badge variant={STATUS_CONFIG[proposal.status].variant}>{STATUS_CONFIG[proposal.status].label}</Badge>
            </div>
          </Card>

          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mb-6">
            <Card className="p-4 text-center">
              <DollarSign className="size-6 text-primary mx-auto mb-2" />
              <Body className="font-weight-bold font-weight-bold">{formatCurrency(proposal.amount)}</Body>
              <Body size="sm" className="text-grey-400">Total Investment</Body>
            </Card>
            <Card className="p-4 text-center">
              <Calendar className="size-6 text-primary mx-auto mb-2" />
              <Body className="font-weight-bold">{formatDate(proposal.validUntil)}</Body>
              <Body size="sm" className="text-grey-400">Valid Until</Body>
            </Card>
            <Card className="p-4 text-center">
              <Clock className="size-6 text-primary mx-auto mb-2" />
              <Body className="font-weight-bold">30 Days</Body>
              <Body size="sm" className="text-grey-400">Payment Terms</Body>
            </Card>
          </Grid>

          {proposal.sections.map((section, idx) => (
            <Card key={idx} className="p-6 mb-4">
              <Body className="font-weight-bold font-weight-medium mb-2">{section.title}</Body>
              <Body className="text-grey-300">{section.content}</Body>
            </Card>
          ))}

          {proposal.status === "pending" && (
            <Card className="p-6 mt-6">
              <SectionHeader title="Ready to proceed?" description="Accept or decline this proposal" />
              <div className="flex gap-4 mt-4">
                <Button variant="solid" onClick={() => updateProposal.mutate("accepted")} disabled={updateProposal.isPending}>
                  Accept Proposal
                </Button>
                <Button variant="outline" onClick={() => updateProposal.mutate("declined")} disabled={updateProposal.isPending}>
                  Decline
                </Button>
              </div>
            </Card>
          )}

          {proposal.status === "accepted" && (
            <Card className="p-6 mt-6 border-success">
              <div className="flex items-center gap-4">
                <CheckCircle className="size-8 text-success" />
                <div>
                  <Body className="font-weight-bold font-weight-medium">Proposal Accepted</Body>
                  <Body className="text-grey-400">Thank you! We will be in touch shortly to begin the project.</Body>
                </div>
              </div>
            </Card>
          )}
        </Section>
      ),
    },
    {
      id: "questions",
      label: "Questions",
      icon: <MessageSquare className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Have Questions?" description="Contact us about this proposal" />
          <Card className="p-8 text-center mt-4">
            <MessageSquare className="size-12 text-primary mx-auto mb-4" />
            <Body className="font-weight-medium font-weight-medium mb-2">Need clarification?</Body>
            <Body className="text-grey-400 mb-4">We are happy to answer any questions about this proposal</Body>
            <Button variant="outline">Contact Us</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Proposal", title: proposal.title, description: `For ${proposal.client}` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
    />
  );
}
