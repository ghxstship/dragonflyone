"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
// Layout provided by route group
import { Radio, Headphones, MessageSquare, Satellite, Smartphone } from "lucide-react";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Select,
  Button,
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
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  useChannels,
  type Channel,
} from "../../../../hooks/useChannels";

const departments = ["All", "Production", "Audio", "Lighting", "Video", "Stage", "Rigging", "Security", "Hospitality"];

export default function ChannelsPage() {
  const router = useRouter();
  const { data: channels = [] } = useChannels();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'all',
    validTabs: ['all', 'radio', 'intercom', 'chat'],
  });
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState("All");

  const filteredChannels = departmentFilter === "All" ? channels : channels.filter(c => c.department === departmentFilter);
  const activeChannels = channels.filter(c => c.is_active).length;
  const totalMembers = channels.reduce((s, c) => s + (c.members?.length || 0), 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Radio": return <Radio className="size-5" />;
      case "Intercom": return <Headphones className="size-5" />;
      case "Chat": return <MessageSquare className="size-5" />;
      case "All": return <Satellite className="size-5" />;
      default: return <Smartphone className="size-5" />;
    }
  };

  return (
    <>
      <EnterprisePageHeader
        title="Communication Channels"
        subtitle="Department-specific channels and groups"


        primaryAction={{ label: 'Create Channel', onClick: () => setShowCreateModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard value={channels.length.toString()} label="Total Channels" />
              <StatCard value={activeChannels.toString()} label="Active" />
              <StatCard value={totalMembers.toString()} label="Total Members" />
              <StatCard value={(departments.length - 1).toString()} label="Departments" />
            </Grid>

            <Stack direction="horizontal" className="justify-between">
              <Stack direction="horizontal" gap={4}>
                <Tabs>
                  <TabsList>
                    <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
                    <Tab active={isActive('radio')} onClick={() => setActiveTab('radio')}>Radio</Tab>
                    <Tab active={isActive('intercom')} onClick={() => setActiveTab('intercom')}>Intercom</Tab>
                    <Tab active={isActive('chat')} onClick={() => setActiveTab('chat')}>Chat</Tab>
                  </TabsList>
                </Tabs>
                <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </Stack>
              <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Channel</Button>
            </Stack>

            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              {filteredChannels.filter(c => activeTab === "all" || c.type.toLowerCase() === activeTab).map((channel) => (
                <Card key={channel.id} className="p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack direction="horizontal" gap={3}>
                        <Body className="text-h5-md">{getTypeIcon(channel.type)}</Body>
                        <Stack gap={1}>
                          <Body className="font-display">{channel.name}</Body>
                          <Body size="sm" className="">{channel.department}</Body>
                        </Stack>
                      </Stack>
                      <Stack gap={1} className="text-right">
                        <Badge variant="outline">{channel.type}</Badge>
                        {channel.frequency && <Body size="sm" className="">{channel.frequency}</Body>}
                      </Stack>
                    </Stack>
                    <Body size="sm" className="">{channel.description}</Body>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body size="sm" className="">{channel.members?.length || 0} members</Body>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm" onClick={() => setSelectedChannel(channel)}>Manage</Button>
                        <Button variant="solid" size="sm">Join</Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>

            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" onClick={() => router.push("/communications")}>Communications Hub</Button>
              <Button variant="outline" onClick={() => router.push("/crew")}>Crew Directory</Button>
              <Button variant="outline" onClick={() => router.push("/projects")}>Projects</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

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
                <Body>{selectedChannel.members?.length || 0}</Body>
              </Stack>
              <Stack gap={2}>
                <Body className="font-display">Recent Members</Body>
                <Stack direction="horizontal" gap={2}>
                  {selectedChannel.members?.slice(0, 5).map((member, idx) => (
                    <Card key={idx} className="flex size-10 items-center justify-center rounded-avatar">
                      <Body size="sm" className="">{member.initials}</Body>
                    </Card>
                  ))}
                  <Card className="flex size-10 items-center justify-center rounded-avatar">
                    <Body size="sm" className="">+{(selectedChannel.members?.length || 0) - 5}</Body>
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
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
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
    </>
  );
}
