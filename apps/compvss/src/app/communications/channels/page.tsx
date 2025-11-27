"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@ghxstship/ui";

interface Channel {
  id: string;
  name: string;
  department: string;
  type: "Radio" | "Intercom" | "Chat" | "All";
  members: number;
  frequency?: string;
  status: "Active" | "Inactive";
  description: string;
}

const mockChannels: Channel[] = [
  { id: "CH-001", name: "Production", department: "Production", type: "All", members: 45, frequency: "Ch 1", status: "Active", description: "Main production coordination channel" },
  { id: "CH-002", name: "Audio", department: "Audio", type: "Radio", members: 12, frequency: "Ch 2", status: "Active", description: "Audio department communications" },
  { id: "CH-003", name: "Lighting", department: "Lighting", type: "Radio", members: 8, frequency: "Ch 3", status: "Active", description: "Lighting department communications" },
  { id: "CH-004", name: "Video", department: "Video", type: "Radio", members: 6, frequency: "Ch 4", status: "Active", description: "Video department communications" },
  { id: "CH-005", name: "Stage Management", department: "Stage", type: "Intercom", members: 15, frequency: "PL 1", status: "Active", description: "Stage management and cue calling" },
  { id: "CH-006", name: "Rigging", department: "Rigging", type: "Radio", members: 10, frequency: "Ch 5", status: "Active", description: "Rigging crew coordination" },
  { id: "CH-007", name: "Security", department: "Security", type: "Radio", members: 20, frequency: "Ch 6", status: "Active", description: "Security team communications" },
  { id: "CH-008", name: "Catering", department: "Hospitality", type: "Chat", members: 8, status: "Active", description: "Catering and hospitality coordination" },
];

const departments = ["All", "Production", "Audio", "Lighting", "Video", "Stage", "Rigging", "Security", "Hospitality"];

export default function ChannelsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const filteredChannels = departmentFilter === "All" ? mockChannels : mockChannels.filter(c => c.department === departmentFilter);
  const activeChannels = mockChannels.filter(c => c.status === "Active").length;
  const totalMembers = mockChannels.reduce((s, c) => s + c.members, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Radio": return "📻";
      case "Intercom": return "🎧";
      case "Chat": return "💬";
      case "All": return "📡";
      default: return "📱";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Communication Channels</H1>
            <Label className="text-ink-400">Department-specific channels and groups</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Channels" value={mockChannels.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active" value={activeChannels} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Members" value={totalMembers} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Departments" value={departments.length - 1} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Stack direction="horizontal" gap={4}>
              <Tabs>
                <TabsList>
                  <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
                  <Tab active={activeTab === "radio"} onClick={() => setActiveTab("radio")}>Radio</Tab>
                  <Tab active={activeTab === "intercom"} onClick={() => setActiveTab("intercom")}>Intercom</Tab>
                  <Tab active={activeTab === "chat"} onClick={() => setActiveTab("chat")}>Chat</Tab>
                </TabsList>
              </Tabs>
              <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="border-ink-700 bg-black text-white">
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
            </Stack>
            <Button variant="outlineWhite" onClick={() => setShowCreateModal(true)}>Create Channel</Button>
          </Stack>

          <Grid cols={2} gap={4}>
            {filteredChannels.filter(c => activeTab === "all" || c.type.toLowerCase() === activeTab).map((channel) => (
              <Card key={channel.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between">
                    <Stack direction="horizontal" gap={3}>
                      <Label className="text-h5-md">{getTypeIcon(channel.type)}</Label>
                      <Stack gap={1}>
                        <Body className="font-display text-white">{channel.name}</Body>
                        <Label className="text-ink-400">{channel.department}</Label>
                      </Stack>
                    </Stack>
                    <Stack gap={1} className="text-right">
                      <Badge variant="outline">{channel.type}</Badge>
                      {channel.frequency && <Label className="font-mono text-ink-400">{channel.frequency}</Label>}
                    </Stack>
                  </Stack>
                  <Label className="text-ink-300">{channel.description}</Label>
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Label className="text-ink-500">{channel.members} members</Label>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outline" size="sm" onClick={() => setSelectedChannel(channel)}>Manage</Button>
                      <Button variant="solid" size="sm">Join</Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/communications")}>Communications Hub</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/crew")}>Crew Directory</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/projects")}>Projects</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedChannel} onClose={() => setSelectedChannel(null)}>
        <ModalHeader><H3>{selectedChannel?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedChannel && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedChannel.type}</Badge>
                <Badge variant="outline">{selectedChannel.department}</Badge>
              </Stack>
              <Stack gap={1}><Label className="text-ink-400">Description</Label><Body className="text-white">{selectedChannel.description}</Body></Stack>
              {selectedChannel.frequency && (
                <Stack gap={1}><Label className="text-ink-400">Frequency/Channel</Label><Label className="font-mono text-white text-h6-md">{selectedChannel.frequency}</Label></Stack>
              )}
              <Stack gap={1}><Label className="text-ink-400">Members</Label><Label className="text-white">{selectedChannel.members}</Label></Stack>
              <Stack gap={2}>
                <Label className="text-ink-400">Recent Members</Label>
                <Stack direction="horizontal" gap={2}>
                  {["JS", "MK", "AL", "RB", "TC"].map((initials, idx) => (
                    <Card key={idx} className="w-10 h-10 bg-ink-700 rounded-full flex items-center justify-center">
                      <Label size="xs">{initials}</Label>
                    </Card>
                  ))}
                  <Card className="w-10 h-10 bg-ink-800 rounded-full flex items-center justify-center">
                    <Label size="xs">+{selectedChannel.members - 5}</Label>
                  </Card>
                </Stack>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedChannel(null)}>Close</Button>
          <Button variant="outline">Edit</Button>
          <Button variant="solid">View Members</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Channel</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Channel Name" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Department...</option>
                {departments.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Type...</option>
                <option value="Radio">Radio</option>
                <option value="Intercom">Intercom</option>
                <option value="Chat">Chat</option>
                <option value="All">All (Multi-platform)</option>
              </Select>
            </Grid>
            <Input placeholder="Frequency/Channel (if applicable)" className="border-ink-700 bg-black text-white" />
            <Textarea placeholder="Description..." rows={3} className="border-ink-700 bg-black text-white" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
