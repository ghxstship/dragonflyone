"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../../components/navigation";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Select,
  Button,
  Section,
  Card,
  Tabs,
  TabsList,
  Tab,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  Input,
  PageLayout,
  SectionHeader,
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
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <SectionHeader
              kicker="COMPVSS"
              title="Communication Channels"
              description="Department-specific channels and groups"
              colorScheme="on-light"
              gap="lg"
            />

            <Grid cols={4} gap={6}>
              <StatCard value={mockChannels.length.toString()} label="Total Channels" />
              <StatCard value={activeChannels.toString()} label="Active" />
              <StatCard value={totalMembers.toString()} label="Total Members" />
              <StatCard value={(departments.length - 1).toString()} label="Departments" />
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
                <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </Stack>
              <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Channel</Button>
            </Stack>

            <Grid cols={2} gap={4}>
              {filteredChannels.filter(c => activeTab === "all" || c.type.toLowerCase() === activeTab).map((channel) => (
                <Card key={channel.id} className="p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack direction="horizontal" gap={3}>
                        <Body className="text-h5-md">{getTypeIcon(channel.type)}</Body>
                        <Stack gap={1}>
                          <Body className="font-display">{channel.name}</Body>
                          <Body className="text-body-sm">{channel.department}</Body>
                        </Stack>
                      </Stack>
                      <Stack gap={1} className="text-right">
                        <Badge variant="outline">{channel.type}</Badge>
                        {channel.frequency && <Body className="text-body-sm">{channel.frequency}</Body>}
                      </Stack>
                    </Stack>
                    <Body className="text-body-sm">{channel.description}</Body>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body className="text-body-sm">{channel.members} members</Body>
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
              <Button variant="outline" onClick={() => router.push("/communications")}>Communications Hub</Button>
              <Button variant="outline" onClick={() => router.push("/crew")}>Crew Directory</Button>
              <Button variant="outline" onClick={() => router.push("/projects")}>Projects</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedChannel} onClose={() => setSelectedChannel(null)}>
        <ModalHeader><H3>{selectedChannel?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedChannel && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedChannel.type}</Badge>
                <Badge variant="outline">{selectedChannel.department}</Badge>
              </Stack>
              <Stack gap={1}>
                <Body className="font-display">Description</Body>
                <Body>{selectedChannel.description}</Body>
              </Stack>
              {selectedChannel.frequency && (
                <Stack gap={1}>
                  <Body className="font-display">Frequency/Channel</Body>
                  <Body className="text-h6-md">{selectedChannel.frequency}</Body>
                </Stack>
              )}
              <Stack gap={1}>
                <Body className="font-display">Members</Body>
                <Body>{selectedChannel.members}</Body>
              </Stack>
              <Stack gap={2}>
                <Body className="font-display">Recent Members</Body>
                <Stack direction="horizontal" gap={2}>
                  {["JS", "MK", "AL", "RB", "TC"].map((initials, idx) => (
                    <Card key={idx} className="flex size-10 items-center justify-center rounded-avatar">
                      <Body className="text-body-sm">{initials}</Body>
                    </Card>
                  ))}
                  <Card className="flex size-10 items-center justify-center rounded-avatar">
                    <Body className="text-body-sm">+{selectedChannel.members - 5}</Body>
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
            <Input placeholder="Channel Name" />
            <Grid cols={2} gap={4}>
              <Select>
                <option value="">Department...</option>
                {departments.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Select>
                <option value="">Type...</option>
                <option value="Radio">Radio</option>
                <option value="Intercom">Intercom</option>
                <option value="Chat">Chat</option>
                <option value="All">All (Multi-platform)</option>
              </Select>
            </Grid>
            <Input placeholder="Frequency/Channel (if applicable)" />
            <Textarea placeholder="Description..." rows={3} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
