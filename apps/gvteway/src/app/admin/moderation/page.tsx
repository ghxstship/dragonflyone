"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface FlaggedContent {
  id: string;
  type: "Comment" | "Review" | "Post" | "Photo";
  content: string;
  author: string;
  reportedBy: string;
  reason: string;
  timestamp: string;
  status: "Pending" | "Approved" | "Removed" | "Escalated";
}

interface KeywordFilter {
  id: string;
  keyword: string;
  action: "Flag" | "Block" | "Replace";
  replacement?: string;
  matches: number;
}

const mockFlagged: FlaggedContent[] = [
  { id: "FLAG-001", type: "Comment", content: "This event was terrible! Total waste of money...", author: "user123", reportedBy: "moderator", reason: "Spam/Inappropriate", timestamp: "2024-11-25 10:30", status: "Pending" },
  { id: "FLAG-002", type: "Review", content: "Best concert ever! 10/10 would recommend to everyone!", author: "musicfan", reportedBy: "auto-filter", reason: "Suspicious activity", timestamp: "2024-11-25 09:15", status: "Pending" },
  { id: "FLAG-003", type: "Post", content: "Selling tickets at half price! DM me now!", author: "ticketseller", reportedBy: "user456", reason: "Unauthorized sales", timestamp: "2024-11-24 18:45", status: "Removed" },
  { id: "FLAG-004", type: "Photo", content: "[Image flagged for review]", author: "partygoer", reportedBy: "auto-filter", reason: "Potentially inappropriate", timestamp: "2024-11-24 16:20", status: "Approved" },
];

const mockFilters: KeywordFilter[] = [
  { id: "KW-001", keyword: "scam", action: "Block", matches: 45 },
  { id: "KW-002", keyword: "selling tickets", action: "Flag", matches: 128 },
  { id: "KW-003", keyword: "profanity1", action: "Replace", replacement: "****", matches: 234 },
  { id: "KW-004", keyword: "competitor name", action: "Flag", matches: 12 },
];

export default function ModerationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("queue");
  const [selectedContent, setSelectedContent] = useState<FlaggedContent | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const pendingCount = mockFlagged.filter(f => f.status === "Pending").length;
  const removedToday = mockFlagged.filter(f => f.status === "Removed").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "text-green-600";
      case "Pending": return "text-yellow-600";
      case "Removed": return "text-red-600";
      case "Escalated": return "text-orange-600";
      default: return "text-gray-600";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Comment": return "💬";
      case "Review": return "⭐";
      case "Post": return "📝";
      case "Photo": return "📷";
      default: return "📄";
    }
  };

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>CONTENT MODERATION</H1>
            <Body className="text-gray-600">Review flagged content and manage keyword filters</Body>
          </Stack>

          {pendingCount > 0 && (
            <Alert variant="warning">
              ⚠️ {pendingCount} item(s) pending review
            </Alert>
          )}

          <Grid cols={4} gap={6}>
            <StatCard label="Pending Review" value={pendingCount} className="border-2 border-black" />
            <StatCard label="Removed Today" value={removedToday} className="border-2 border-black" />
            <StatCard label="Active Filters" value={mockFilters.length} className="border-2 border-black" />
            <StatCard label="Auto-Flagged" value={mockFlagged.filter(f => f.reportedBy === "auto-filter").length} className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "queue"} onClick={() => setActiveTab("queue")}>Review Queue</Tab>
              <Tab active={activeTab === "filters"} onClick={() => setActiveTab("filters")}>Keyword Filters</Tab>
              <Tab active={activeTab === "history"} onClick={() => setActiveTab("history")}>History</Tab>
            </TabsList>

            <TabPanel active={activeTab === "queue"}>
              <Stack gap={4}>
                {mockFlagged.filter(f => f.status === "Pending").map((content) => (
                  <Card key={content.id} className="border-2 border-black p-4">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack direction="horizontal" gap={2}>
                        <Label className="text-xl">{getTypeIcon(content.type)}</Label>
                        <Stack gap={1}>
                          <Badge variant="outline">{content.type}</Badge>
                          <Label size="xs" className="text-gray-500">{content.timestamp}</Label>
                        </Stack>
                      </Stack>
                      <Body className="text-gray-700 col-span-2 truncate">{content.content}</Body>
                      <Stack gap={1}>
                        <Label size="xs" className="text-gray-500">Author</Label>
                        <Label>{content.author}</Label>
                      </Stack>
                      <Badge variant="outline">{content.reason}</Badge>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm" onClick={() => setSelectedContent(content)}>Review</Button>
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "filters"}>
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-end">
                  <Button variant="solid" onClick={() => setShowFilterModal(true)}>Add Filter</Button>
                </Stack>
                <Table className="border-2 border-black">
                  <TableHeader>
                    <TableRow className="bg-black text-white">
                      <TableHead>Keyword</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Replacement</TableHead>
                      <TableHead>Matches</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockFilters.map((filter) => (
                      <TableRow key={filter.id}>
                        <TableCell><Label className="font-mono">{filter.keyword}</Label></TableCell>
                        <TableCell><Badge variant={filter.action === "Block" ? "solid" : "outline"}>{filter.action}</Badge></TableCell>
                        <TableCell><Label className="text-gray-500">{filter.replacement || "-"}</Label></TableCell>
                        <TableCell><Label className="font-mono">{filter.matches}</Label></TableCell>
                        <TableCell>
                          <Stack direction="horizontal" gap={2}>
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
            </TabPanel>

            <TabPanel active={activeTab === "history"}>
              <Stack gap={4}>
                {mockFlagged.filter(f => f.status !== "Pending").map((content) => (
                  <Card key={content.id} className="border border-gray-200 p-4">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack direction="horizontal" gap={2}>
                        <Label className="text-xl">{getTypeIcon(content.type)}</Label>
                        <Badge variant="outline">{content.type}</Badge>
                      </Stack>
                      <Body className="text-gray-500 col-span-2 truncate">{content.content}</Body>
                      <Label className="text-gray-500">{content.author}</Label>
                      <Label className={getStatusColor(content.status)}>{content.status}</Label>
                      <Label className="text-gray-400">{content.timestamp}</Label>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>
          </Tabs>

          <Button variant="outline" onClick={() => router.push("/admin")}>Back to Admin</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedContent} onClose={() => setSelectedContent(null)}>
        <ModalHeader><H3>Review Content</H3></ModalHeader>
        <ModalBody>
          {selectedContent && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Label className="text-xl">{getTypeIcon(selectedContent.type)}</Label>
                <Badge variant="outline">{selectedContent.type}</Badge>
              </Stack>
              <Card className="p-4 border border-gray-200 bg-gray-50">
                <Body>{selectedContent.content}</Body>
              </Card>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label className="text-gray-500">Author</Label><Label>{selectedContent.author}</Label></Stack>
                <Stack gap={1}><Label className="text-gray-500">Reported By</Label><Label>{selectedContent.reportedBy}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label className="text-gray-500">Reason</Label><Badge variant="outline">{selectedContent.reason}</Badge></Stack>
              <Stack gap={1}><Label className="text-gray-500">Timestamp</Label><Label>{selectedContent.timestamp}</Label></Stack>
              <Textarea placeholder="Moderation notes (optional)..." rows={2} className="border-2 border-black" />
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedContent(null)}>Cancel</Button>
          <Button variant="outline" className="text-green-600">Approve</Button>
          <Button variant="outline" className="text-orange-600">Escalate</Button>
          <Button variant="solid" className="bg-red-600">Remove</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showFilterModal} onClose={() => setShowFilterModal(false)}>
        <ModalHeader><H3>Add Keyword Filter</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Keyword or phrase" className="border-2 border-black" />
            <Select className="border-2 border-black">
              <option value="">Action...</option>
              <option value="Flag">Flag for Review</option>
              <option value="Block">Block Automatically</option>
              <option value="Replace">Replace with Text</option>
            </Select>
            <Input placeholder="Replacement text (if applicable)" className="border-2 border-black" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowFilterModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowFilterModal(false)}>Add Filter</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
