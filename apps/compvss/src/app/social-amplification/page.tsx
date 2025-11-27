"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, ProgressBar,
} from "@ghxstship/ui";

interface ArtistProfile {
  id: string;
  name: string;
  genre: string;
  followers: number;
  platforms: { name: string; handle: string; followers: number }[];
  scheduledPosts: number;
  engagement: number;
  status: "Active" | "Pending" | "Inactive";
}

interface AmplificationCampaign {
  id: string;
  name: string;
  eventName: string;
  artists: string[];
  startDate: string;
  endDate: string;
  status: "Active" | "Scheduled" | "Completed";
  reach: number;
  engagement: number;
  posts: number;
}

const mockArtists: ArtistProfile[] = [
  { id: "ART-001", name: "The Headliners", genre: "Rock", followers: 2500000, platforms: [{ name: "Instagram", handle: "@theheadliners", followers: 1500000 }, { name: "Twitter", handle: "@headliners", followers: 800000 }, { name: "TikTok", handle: "@theheadliners", followers: 200000 }], scheduledPosts: 5, engagement: 4.2, status: "Active" },
  { id: "ART-002", name: "DJ Pulse", genre: "Electronic", followers: 850000, platforms: [{ name: "Instagram", handle: "@djpulse", followers: 500000 }, { name: "Twitter", handle: "@djpulse", followers: 350000 }], scheduledPosts: 3, engagement: 5.1, status: "Active" },
  { id: "ART-003", name: "Indie Collective", genre: "Indie", followers: 320000, platforms: [{ name: "Instagram", handle: "@indiecollective", followers: 200000 }, { name: "TikTok", handle: "@indiecollective", followers: 120000 }], scheduledPosts: 0, engagement: 3.8, status: "Pending" },
];

const mockCampaigns: AmplificationCampaign[] = [
  { id: "CAMP-001", name: "Summer Fest Launch", eventName: "Summer Fest 2024", artists: ["The Headliners", "DJ Pulse"], startDate: "2024-11-01", endDate: "2024-11-30", status: "Active", reach: 3200000, engagement: 156000, posts: 24 },
  { id: "CAMP-002", name: "Ticket Sale Push", eventName: "Summer Fest 2024", artists: ["The Headliners", "DJ Pulse", "Indie Collective"], startDate: "2024-12-01", endDate: "2024-12-15", status: "Scheduled", reach: 0, engagement: 0, posts: 12 },
];

export default function SocialAmplificationPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("artists");
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<AmplificationCampaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const totalReach = mockArtists.reduce((sum, a) => sum + a.followers, 0);
  const activeArtists = mockArtists.filter(a => a.status === "Active").length;
  const activeCampaigns = mockCampaigns.filter(c => c.status === "Active").length;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-400";
      case "Scheduled": return "text-info-400";
      case "Pending": return "text-warning-400";
      case "Completed": return "text-ink-400";
      default: return "text-ink-400";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <CreatorNavigationAuthenticated />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Social Amplification</H1>
            <Label className="text-ink-400">Coordinate artist and performer social media promotion</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Reach" value={formatNumber(totalReach)} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active Artists" value={activeArtists} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active Campaigns" value={activeCampaigns} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Avg Engagement" value="4.3%" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "artists"} onClick={() => setActiveTab("artists")}>Artists</Tab>
                <Tab active={activeTab === "campaigns"} onClick={() => setActiveTab("campaigns")}>Campaigns</Tab>
                <Tab active={activeTab === "content"} onClick={() => setActiveTab("content")}>Content Library</Tab>
              </TabsList>
            </Tabs>
            <Button variant="outlineWhite" onClick={() => setShowCreateModal(true)}>Create Campaign</Button>
          </Stack>

          <TabPanel active={activeTab === "artists"}>
            <Grid cols={3} gap={4}>
              {mockArtists.map((artist) => (
                <Card key={artist.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between items-start">
                      <Stack gap={1}>
                        <Body className="font-display text-white text-lg">{artist.name}</Body>
                        <Badge variant="outline">{artist.genre}</Badge>
                      </Stack>
                      <Label className={getStatusColor(artist.status)}>{artist.status}</Label>
                    </Stack>
                    <Stack gap={1}>
                      <Label size="xs" className="text-ink-500">Total Followers</Label>
                      <Label className="font-mono text-white text-xl">{formatNumber(artist.followers)}</Label>
                    </Stack>
                    <Stack gap={2}>
                      <Label size="xs" className="text-ink-500">Platforms</Label>
                      {artist.platforms.map((p) => (
                        <Stack key={p.name} direction="horizontal" className="justify-between">
                          <Label className="text-ink-300">{p.name}</Label>
                          <Label className="font-mono text-ink-400">{formatNumber(p.followers)}</Label>
                        </Stack>
                      ))}
                    </Stack>
                    <Grid cols={2} gap={4}>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Scheduled</Label>
                        <Label className="text-white">{artist.scheduledPosts} posts</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Engagement</Label>
                        <Label className="text-white">{artist.engagement}%</Label>
                      </Stack>
                    </Grid>
                    <Button variant="outline" size="sm" onClick={() => setSelectedArtist(artist)}>Manage</Button>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel active={activeTab === "campaigns"}>
            <Stack gap={4}>
              {mockCampaigns.map((campaign) => (
                <Card key={campaign.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Grid cols={6} gap={4} className="items-center">
                    <Stack gap={1}>
                      <Body className="font-display text-white">{campaign.name}</Body>
                      <Label className="text-ink-400">{campaign.eventName}</Label>
                    </Stack>
                    <Stack gap={1}>
                      <Label size="xs" className="text-ink-500">Artists</Label>
                      <Label className="text-white">{campaign.artists.length}</Label>
                    </Stack>
                    <Stack gap={1}>
                      <Label size="xs" className="text-ink-500">Duration</Label>
                      <Label className="text-ink-300">{campaign.startDate} - {campaign.endDate}</Label>
                    </Stack>
                    <Stack gap={1}>
                      <Label size="xs" className="text-ink-500">Reach</Label>
                      <Label className="font-mono text-white">{formatNumber(campaign.reach)}</Label>
                    </Stack>
                    <Label className={getStatusColor(campaign.status)}>{campaign.status}</Label>
                    <Button variant="outline" size="sm" onClick={() => setSelectedCampaign(campaign)}>Details</Button>
                  </Grid>
                </Card>
              ))}
            </Stack>
          </TabPanel>

          <TabPanel active={activeTab === "content"}>
            <Grid cols={4} gap={4}>
              {["Promo Graphics", "Video Clips", "Story Templates", "Post Captions", "Hashtag Sets", "Bio Links", "Press Photos", "Logo Pack"].map((item, idx) => (
                <Card key={idx} className="border-2 border-ink-800 bg-ink-900/50 p-4 cursor-pointer hover:border-white">
                  <Stack gap={2} className="text-center">
                    <Label className="text-4xl">{["🖼️", "🎬", "📱", "📝", "#️⃣", "🔗", "📷", "🎨"][idx]}</Label>
                    <Label className="text-white">{item}</Label>
                    <Label size="xs" className="text-ink-500">{Math.floor(Math.random() * 20) + 5} items</Label>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </TabPanel>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Analytics</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/marketing")}>Marketing</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/projects")}>Projects</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedArtist} onClose={() => setSelectedArtist(null)}>
        <ModalHeader><H3>{selectedArtist?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedArtist && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Badge variant="outline">{selectedArtist.genre}</Badge>
                <Label className={getStatusColor(selectedArtist.status)}>{selectedArtist.status}</Label>
              </Stack>
              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">Total Reach</Label>
                <Label className="font-mono text-white text-2xl">{formatNumber(selectedArtist.followers)}</Label>
              </Stack>
              <Stack gap={2}>
                <Label className="text-ink-400">Platform Breakdown</Label>
                {selectedArtist.platforms.map((p) => (
                  <Card key={p.name} className="p-3 border border-ink-700">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack gap={0}>
                        <Label className="text-white">{p.name}</Label>
                        <Label size="xs" className="text-ink-500">{p.handle}</Label>
                      </Stack>
                      <Label className="font-mono text-white">{formatNumber(p.followers)}</Label>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Scheduled Posts</Label><Label className="text-white">{selectedArtist.scheduledPosts}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Avg Engagement</Label><Label className="text-white">{selectedArtist.engagement}%</Label></Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedArtist(null)}>Close</Button>
          <Button variant="solid">Schedule Post</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Campaign</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Campaign name" className="border-ink-700 bg-black text-white" />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Select Event...</option>
              <option value="EVT-001">Summer Fest 2024</option>
            </Select>
            <Grid cols={2} gap={4}>
              <Input type="date" className="border-ink-700 bg-black text-white" />
              <Input type="date" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Textarea placeholder="Campaign description..." className="border-ink-700 bg-black text-white" rows={3} />
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
