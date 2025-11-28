"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  Container, H2, H3, Body, Label, Grid, Stack, StatCard, Select, Button,
  Section, Card, Tabs, TabsList, Tab, Badge, Textarea,
  Modal, ModalHeader, ModalBody, ModalFooter,
  PageLayout, Footer, FooterColumn, FooterLink, Display, Kicker,
} from "@ghxstship/ui";

interface SocialMessage {
  id: string;
  platform: "Twitter" | "Instagram" | "Facebook" | "TikTok";
  type: "DM" | "Comment" | "Mention" | "Review";
  author: string;
  authorHandle: string;
  content: string;
  timestamp: string;
  status: "New" | "In Progress" | "Resolved" | "Escalated";
  assignedTo?: string;
  sentiment: "Positive" | "Neutral" | "Negative";
  priority: "High" | "Medium" | "Low";
}

const mockMessages: SocialMessage[] = [
  { id: "SM-001", platform: "Twitter", type: "Mention", author: "John Doe", authorHandle: "@johndoe", content: "Having trouble purchasing tickets for @SummerFest. The checkout keeps timing out. Help!", timestamp: "5 min ago", status: "New", sentiment: "Negative", priority: "High" },
  { id: "SM-002", platform: "Instagram", type: "DM", author: "Sarah M", authorHandle: "@sarahm_music", content: "Hi! What time do gates open on Saturday? Want to make sure I dont miss the opener!", timestamp: "15 min ago", status: "New", sentiment: "Neutral", priority: "Medium" },
  { id: "SM-003", platform: "Facebook", type: "Comment", author: "Mike Wilson", authorHandle: "Mike Wilson", content: "Best festival Ive ever been to! Already bought tickets for next year 🎉", timestamp: "1 hr ago", status: "Resolved", sentiment: "Positive", priority: "Low" },
  { id: "SM-004", platform: "Twitter", type: "DM", author: "Emily Chen", authorHandle: "@emilyc", content: "Is there wheelchair accessible seating available? My mom uses a wheelchair.", timestamp: "2 hrs ago", status: "In Progress", assignedTo: "Support Team", sentiment: "Neutral", priority: "High" },
  { id: "SM-005", platform: "TikTok", type: "Comment", author: "festivalfan99", authorHandle: "@festivalfan99", content: "The sound quality was terrible at stage 2. Couldnt hear anything!", timestamp: "3 hrs ago", status: "Escalated", sentiment: "Negative", priority: "High" },
];

export default function SocialInboxPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState<SocialMessage | null>(null);
  const [platformFilter, setPlatformFilter] = useState("All");

  const newCount = mockMessages.filter(m => m.status === "New").length;
  const escalatedCount = mockMessages.filter(m => m.status === "Escalated").length;
  const negativeCount = mockMessages.filter(m => m.sentiment === "Negative").length;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Twitter": return "𝕏";
      case "Instagram": return "📷";
      case "Facebook": return "📘";
      case "TikTok": return "🎵";
      default: return "💬";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "text-info-600";
      case "In Progress": return "text-warning-600";
      case "Resolved": return "text-success-600";
      case "Escalated": return "text-error-600";
      default: return "text-ink-600";
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "Positive": return "text-success-600";
      case "Neutral": return "text-ink-600";
      case "Negative": return "text-error-600";
      default: return "text-ink-600";
    }
  };

  const filteredMessages = mockMessages.filter(m => {
    const matchesPlatform = platformFilter === "All" || m.platform === platformFilter;
    const matchesTab = activeTab === "all" || m.status.toLowerCase().replace(" ", "") === activeTab;
    return matchesPlatform && matchesTab;
  });

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Social">
            <FooterLink href="/social">Social Hub</FooterLink>
            <FooterLink href="/social/inbox">Inbox</FooterLink>
          </FooterColumn>
          <FooterColumn title="Legal">
            <FooterLink href="/legal/privacy">Privacy</FooterLink>
            <FooterLink href="/legal/terms">Terms</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <Section background="black" className="relative min-h-screen overflow-hidden py-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />
        <Container className="relative z-10">
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Social</Kicker>
              <H2 size="lg" className="text-white">Social Inbox</H2>
              <Body className="text-on-dark-muted">Unified social customer service inbox</Body>
            </Stack>

            <Grid cols={4} gap={6}>
              <StatCard label="New Messages" value={newCount.toString()} inverted />
              <StatCard label="Escalated" value={escalatedCount.toString()} inverted />
              <StatCard label="Negative Sentiment" value={negativeCount.toString()} inverted />
              <StatCard label="Avg Response" value="< 15 min" inverted />
            </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
                <Tab active={activeTab === "new"} onClick={() => setActiveTab("new")}>New</Tab>
                <Tab active={activeTab === "inprogress"} onClick={() => setActiveTab("inprogress")}>In Progress</Tab>
                <Tab active={activeTab === "escalated"} onClick={() => setActiveTab("escalated")}>Escalated</Tab>
              </TabsList>
            </Tabs>
            <Select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className="border-2 border-black">
              <option value="All">All Platforms</option>
              <option value="Twitter">Twitter</option>
              <option value="Instagram">Instagram</option>
              <option value="Facebook">Facebook</option>
              <option value="TikTok">TikTok</option>
            </Select>
          </Stack>

          <Stack gap={4}>
            {filteredMessages.map((message) => (
              <Card key={message.id} inverted variant={message.priority === "High" ? "elevated" : "default"}>
                <Grid cols={6} gap={4} className="items-center">
                  <Stack direction="horizontal" gap={3}>
                    <Label className="text-h5-md">{getPlatformIcon(message.platform)}</Label>
                    <Stack gap={1}>
                      <Label className="font-bold">{message.author}</Label>
                      <Label size="xs" className="text-ink-500">{message.authorHandle}</Label>
                    </Stack>
                  </Stack>
                  <Stack gap={1} className="col-span-2">
                    <Badge variant="outline">{message.type}</Badge>
                    <Label className="text-ink-700 truncate">{message.content}</Label>
                  </Stack>
                  <Label className={getSentimentColor(message.sentiment)}>{message.sentiment}</Label>
                  <Label className={getStatusColor(message.status)}>{message.status}</Label>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="outline" size="sm" onClick={() => setSelectedMessage(message)}>Reply</Button>
                  </Stack>
                </Grid>
              </Card>
            ))}
          </Stack>

          <Button variant="outlineInk" onClick={() => router.push("/social")}>Back to Social</Button>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedMessage} onClose={() => setSelectedMessage(null)}>
        <ModalHeader><H3>Reply to Message</H3></ModalHeader>
        <ModalBody>
          {selectedMessage && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Label className="text-h6-md">{getPlatformIcon(selectedMessage.platform)}</Label>
                <Badge variant="outline">{selectedMessage.platform}</Badge>
                <Badge variant="outline">{selectedMessage.type}</Badge>
              </Stack>
              <Stack gap={1}>
                <Label className="font-bold">{selectedMessage.author}</Label>
                <Label className="text-ink-500">{selectedMessage.authorHandle}</Label>
              </Stack>
              <Card className="p-4 border border-ink-200 bg-ink-50">
                <Body>{selectedMessage.content}</Body>
              </Card>
              <Label className="text-ink-500">{selectedMessage.timestamp}</Label>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-ink-500">Sentiment</Label><Label className={getSentimentColor(selectedMessage.sentiment)}>{selectedMessage.sentiment}</Label></Stack>
                <Stack gap={1}><Label className="text-ink-500">Priority</Label><Label className={selectedMessage.priority === "High" ? "text-error-600" : "text-ink-600"}>{selectedMessage.priority}</Label></Stack>
              </Grid>
              <Textarea placeholder="Type your reply..." rows={3} className="border-2 border-black" />
              <Stack direction="horizontal" gap={2}>
                <Select className="border-2 border-black flex-1">
                  <option value="">Use template...</option>
                  <option value="ticket">Ticket Support</option>
                  <option value="info">General Info</option>
                  <option value="accessibility">Accessibility</option>
                </Select>
                <Select className="border-2 border-black">
                  <option value="">Assign to...</option>
                  <option value="support">Support Team</option>
                  <option value="social">Social Team</option>
                  <option value="escalate">Escalate</option>
                </Select>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedMessage(null)}>Cancel</Button>
          <Button variant="outline">Mark Resolved</Button>
          <Button variant="solid">Send Reply</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
