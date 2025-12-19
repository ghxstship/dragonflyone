"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { Twitter, Camera, Facebook, Music, MessageCircle } from "lucide-react";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Select, Button,
  Card, Tabs, TabsList, Tab, Badge, Textarea,
  Modal, ModalHeader, ModalBody, ModalFooter,
  Kicker,
} from "@ghxstship/ui";

import {
  DEMO_SOCIAL_MESSAGES,
  type DemoSocialMessage as SocialMessage,
} from "@/lib/demo-data";

const mockMessages = DEMO_SOCIAL_MESSAGES;

function SocialInboxPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'all',
    validTabs: ['all', 'new', 'inprogress', 'escalated'],
  });
  const [selectedMessage, setSelectedMessage] = useState<SocialMessage | null>(null);
  const [platformFilter, setPlatformFilter] = useState("All");

  const newCount = mockMessages.filter(m => m.status === "New").length;
  const escalatedCount = mockMessages.filter(m => m.status === "Escalated").length;
  const negativeCount = mockMessages.filter(m => m.sentiment === "Negative").length;

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Twitter": return <Twitter className="size-4" />;
      case "Instagram": return <Camera className="size-4" />;
      case "Facebook": return <Facebook className="size-4" />;
      case "TikTok": return <Music className="size-4" />;
      default: return <MessageCircle className="size-4" />;
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
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Social</Kicker>
              <H2 size="lg" className="text-white">Social Inbox</H2>
              <Body className="text-on-dark-muted">Unified social customer service inbox</Body>
            </Stack>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="New Messages" value={newCount.toString()} inverted />
              <StatCard label="Escalated" value={escalatedCount.toString()} inverted />
              <StatCard label="Negative Sentiment" value={negativeCount.toString()} inverted />
              <StatCard label="Avg Response" value="< 15 min" inverted />
            </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
                <Tab active={isActive('new')} onClick={() => setActiveTab('new')}>New</Tab>
                <Tab active={isActive('inprogress')} onClick={() => setActiveTab('inprogress')}>In Progress</Tab>
                <Tab active={isActive('escalated')} onClick={() => setActiveTab('escalated')}>Escalated</Tab>
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
                      <Label className="font-weight-bold">{message.author}</Label>
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
                <Label className="font-weight-bold">{selectedMessage.author}</Label>
                <Label className="text-ink-500">{selectedMessage.authorHandle}</Label>
              </Stack>
              <Card className="p-4 border-2 border-ink-200 bg-ink-50">
                <Body>{selectedMessage.content}</Body>
              </Card>
              <Label className="text-ink-500">{selectedMessage.timestamp}</Label>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
    </GvtewayAppLayout>
  );
}

export default function SocialInboxPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <SocialInboxPageContent />
    </Suspense>
  );
}
