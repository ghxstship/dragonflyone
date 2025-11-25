"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Alert,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface Contest {
  id: string;
  name: string;
  type: "Giveaway" | "Photo Contest" | "Video Contest" | "Hashtag Challenge" | "Sweepstakes";
  eventId?: string;
  eventName?: string;
  prize: string;
  prizeValue: number;
  startDate: string;
  endDate: string;
  status: "Draft" | "Active" | "Ended" | "Selecting Winner";
  entries: number;
  platforms: string[];
  rules?: string;
  winnerId?: string;
  winnerName?: string;
}

interface Entry {
  id: string;
  contestId: string;
  userName: string;
  userEmail: string;
  platform: string;
  submissionUrl?: string;
  submittedAt: string;
  votes: number;
  isWinner: boolean;
}

const mockContests: Contest[] = [
  { id: "CNT-001", name: "Summer Fest VIP Giveaway", type: "Giveaway", eventId: "EVT-001", eventName: "Summer Fest 2024", prize: "2 VIP Tickets + Meet & Greet", prizeValue: 500, startDate: "2024-11-01", endDate: "2024-11-20", status: "Ended", entries: 2450, platforms: ["Instagram", "Twitter"], winnerId: "USR-123", winnerName: "Sarah M." },
  { id: "CNT-002", name: "Best Concert Photo", type: "Photo Contest", eventId: "EVT-001", eventName: "Summer Fest 2024", prize: "Free tickets to next 3 events", prizeValue: 300, startDate: "2024-11-15", endDate: "2024-12-01", status: "Active", entries: 156, platforms: ["Instagram"] },
  { id: "CNT-003", name: "#SummerFestVibes Challenge", type: "Hashtag Challenge", eventId: "EVT-001", eventName: "Summer Fest 2024", prize: "Exclusive Merch Bundle", prizeValue: 150, startDate: "2024-11-10", endDate: "2024-11-25", status: "Active", entries: 892, platforms: ["TikTok", "Instagram"] },
  { id: "CNT-004", name: "Holiday Sweepstakes", type: "Sweepstakes", prize: "Year of Free Concerts", prizeValue: 2000, startDate: "2024-12-01", endDate: "2024-12-25", status: "Draft", entries: 0, platforms: ["Instagram", "Twitter", "Facebook"] },
];

const mockEntries: Entry[] = [
  { id: "ENT-001", contestId: "CNT-002", userName: "Alex Thompson", userEmail: "alex@email.com", platform: "Instagram", submissionUrl: "https://instagram.com/p/abc123", submittedAt: "2024-11-16T14:30:00Z", votes: 45, isWinner: false },
  { id: "ENT-002", contestId: "CNT-002", userName: "Jordan Lee", userEmail: "jordan@email.com", platform: "Instagram", submissionUrl: "https://instagram.com/p/def456", submittedAt: "2024-11-17T09:15:00Z", votes: 78, isWinner: false },
  { id: "ENT-003", contestId: "CNT-002", userName: "Casey Morgan", userEmail: "casey@email.com", platform: "Instagram", submissionUrl: "https://instagram.com/p/ghi789", submittedAt: "2024-11-18T16:45:00Z", votes: 123, isWinner: false },
];

export default function ContestsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("active");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [showEntriesModal, setShowEntriesModal] = useState(false);

  const activeContests = mockContests.filter(c => c.status === "Active").length;
  const totalEntries = mockContests.reduce((sum, c) => sum + c.entries, 0);
  const totalPrizeValue = mockContests.reduce((sum, c) => sum + c.prizeValue, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-green-600";
      case "Ended": return "text-gray-500";
      case "Draft": return "text-blue-600";
      case "Selecting Winner": return "text-yellow-600";
      default: return "text-gray-500";
    }
  };

  const filteredContests = activeTab === "all" ? mockContests : mockContests.filter(c => c.status.toLowerCase() === activeTab);

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>CONTESTS & GIVEAWAYS</H1>
            <Body className="text-gray-600">Create and manage social media contests and promotional giveaways</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Contests" value={activeContests} className="border-2 border-black" />
            <StatCard label="Total Entries" value={totalEntries.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Total Prize Value" value={`$${totalPrizeValue.toLocaleString()}`} className="border-2 border-black" />
            <StatCard label="Avg Entries/Contest" value={Math.round(totalEntries / mockContests.length)} className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "active"} onClick={() => setActiveTab("active")}>Active</Tab>
                <Tab active={activeTab === "draft"} onClick={() => setActiveTab("draft")}>Drafts</Tab>
                <Tab active={activeTab === "ended"} onClick={() => setActiveTab("ended")}>Ended</Tab>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Contest</Button>
          </Stack>

          <Grid cols={2} gap={6}>
            {filteredContests.map((contest) => (
              <Card key={contest.id} className="border-2 border-black overflow-hidden">
                <Card className="p-4 bg-black text-white">
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack gap={1}>
                      <Body className="font-bold">{contest.name}</Body>
                      {contest.eventName && <Label size="xs" className="text-gray-400">{contest.eventName}</Label>}
                    </Stack>
                    <Badge variant="outline" className="text-white border-white">{contest.type}</Badge>
                  </Stack>
                </Card>
                <Stack className="p-4" gap={4}>
                  <Grid cols={2} gap={4}>
                    <Stack gap={1}>
                      <Label size="xs" className="text-gray-500">Prize</Label>
                      <Label>{contest.prize}</Label>
                    </Stack>
                    <Stack gap={1}>
                      <Label size="xs" className="text-gray-500">Value</Label>
                      <Label className="font-mono">${contest.prizeValue}</Label>
                    </Stack>
                  </Grid>
                  <Grid cols={2} gap={4}>
                    <Stack gap={1}>
                      <Label size="xs" className="text-gray-500">Period</Label>
                      <Label className="text-sm">{contest.startDate} - {contest.endDate}</Label>
                    </Stack>
                    <Stack gap={1}>
                      <Label size="xs" className="text-gray-500">Entries</Label>
                      <Label className="font-mono">{contest.entries.toLocaleString()}</Label>
                    </Stack>
                  </Grid>
                  <Stack direction="horizontal" gap={2}>
                    {contest.platforms.map(p => <Badge key={p} variant="outline">{p}</Badge>)}
                  </Stack>
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Label className={getStatusColor(contest.status)}>{contest.status}</Label>
                    {contest.winnerName && <Label className="text-green-600">Winner: {contest.winnerName}</Label>}
                  </Stack>
                  <Grid cols={2} gap={2}>
                    <Button variant="outline" onClick={() => { setSelectedContest(contest); setShowEntriesModal(true); }}>View Entries</Button>
                    <Button variant="outline" onClick={() => setSelectedContest(contest)}>
                      {contest.status === "Active" ? "Manage" : "Details"}
                    </Button>
                  </Grid>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Button variant="outline" onClick={() => router.push("/admin/marketing")}>Back to Marketing</Button>
        </Stack>
      </Container>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Contest</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Contest Name" />
            <Select>
              <option value="">Contest Type...</option>
              <option value="Giveaway">Giveaway</option>
              <option value="Photo Contest">Photo Contest</option>
              <option value="Video Contest">Video Contest</option>
              <option value="Hashtag Challenge">Hashtag Challenge</option>
              <option value="Sweepstakes">Sweepstakes</option>
            </Select>
            <Select>
              <option value="">Link to Event (optional)...</option>
              <option value="EVT-001">Summer Fest 2024</option>
              <option value="EVT-002">Winter Gala</option>
            </Select>
            <Input placeholder="Prize Description" />
            <Input type="number" placeholder="Prize Value ($)" />
            <Grid cols={2} gap={4}>
              <Stack gap={2}>
                <Label>Start Date</Label>
                <Input type="date" />
              </Stack>
              <Stack gap={2}>
                <Label>End Date</Label>
                <Input type="date" />
              </Stack>
            </Grid>
            <Stack gap={2}>
              <Label>Platforms</Label>
              <Grid cols={2} gap={2}>
                {["Instagram", "Twitter", "Facebook", "TikTok"].map(p => (
                  <Card key={p} className="p-2 border border-gray-200 cursor-pointer hover:border-black">
                    <Label className="text-sm">{p}</Label>
                  </Card>
                ))}
              </Grid>
            </Stack>
            <Textarea placeholder="Contest Rules & Terms..." rows={3} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="outline">Save Draft</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Launch Contest</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showEntriesModal && !!selectedContest} onClose={() => { setShowEntriesModal(false); setSelectedContest(null); }}>
        <ModalHeader><H3>Contest Entries</H3></ModalHeader>
        <ModalBody>
          {selectedContest && (
            <Stack gap={4}>
              <Body className="font-bold">{selectedContest.name}</Body>
              <Label className="text-gray-500">{selectedContest.entries} total entries</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Entrant</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Votes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockEntries.filter(e => e.contestId === selectedContest.id).map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <Stack gap={0}>
                          <Label className="font-bold">{entry.userName}</Label>
                          <Label size="xs" className="text-gray-500">{entry.userEmail}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell><Badge variant="outline">{entry.platform}</Badge></TableCell>
                      <TableCell><Label className="font-mono">{entry.votes}</Label></TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="outline" size="sm">Select Winner</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowEntriesModal(false); setSelectedContest(null); }}>Close</Button>
          <Button variant="solid">Random Winner</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedContest && !showEntriesModal} onClose={() => setSelectedContest(null)}>
        <ModalHeader><H3>Contest Details</H3></ModalHeader>
        <ModalBody>
          {selectedContest && (
            <Stack gap={4}>
              <Body className="font-bold text-lg">{selectedContest.name}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Type</Label><Badge variant="outline">{selectedContest.type}</Badge></Stack>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Status</Label><Label className={getStatusColor(selectedContest.status)}>{selectedContest.status}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-gray-500">Prize</Label><Label>{selectedContest.prize}</Label></Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Value</Label><Label className="font-mono">${selectedContest.prizeValue}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-gray-500">Entries</Label><Label className="font-mono">{selectedContest.entries.toLocaleString()}</Label></Stack>
              </Grid>
              <Stack gap={1}><Label size="xs" className="text-gray-500">Period</Label><Label>{selectedContest.startDate} to {selectedContest.endDate}</Label></Stack>
              {selectedContest.winnerName && (
                <Alert variant="success">Winner: {selectedContest.winnerName}</Alert>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedContest(null)}>Close</Button>
          {selectedContest?.status === "Active" && <Button variant="solid">End Contest</Button>}
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
