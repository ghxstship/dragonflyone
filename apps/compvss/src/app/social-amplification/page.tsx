"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { CompvssAppLayout } from "../../components/app-layout";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Input,
  Select,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  useArtistProfiles,
  useAmplificationCampaigns,
  type ArtistProfile,
  type AmplificationCampaign,
} from "../../hooks/useSocialAmplification";

export default function SocialAmplificationPage() {
  const router = useRouter();
  const { data: artists = [] } = useArtistProfiles();
  const { data: campaigns = [] } = useAmplificationCampaigns();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'artists',
    validTabs: ['artists', 'campaigns', 'content'],
  });
  const [selectedArtist, setSelectedArtist] = useState<ArtistProfile | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<AmplificationCampaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const totalReach = artists.reduce((sum, a) => sum + a.followers, 0);
  const activeArtists = artists.filter(a => a.status === "Active").length;
  const activeCampaigns = campaigns.filter(c => c.status === "Active").length;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'error' | 'ghost' => {
    switch (status) {
      case "Active": return "success";
      case "Scheduled": return "info";
      case "Pending": return "warning";
      case "Completed": return "ghost";
      default: return "ghost";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Social Amplification"
        subtitle="Coordinate artist and performer social media promotion"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={formatNumber(totalReach)} label="Total Reach" />
              <StatCard value={activeArtists.toString()} label="Active Artists" />
              <StatCard value={activeCampaigns.toString()} label="Active Campaigns" />
              <StatCard value="4.3%" label="Avg Engagement" />
            </Grid>

            <Stack direction="horizontal" className="justify-between">
              <Tabs>
                <TabsList>
                  <Tab active={isActive('artists')} onClick={() => setActiveTab('artists')}>Artists</Tab>
                  <Tab active={isActive('campaigns')} onClick={() => setActiveTab('campaigns')}>Campaigns</Tab>
                  <Tab active={isActive('content')} onClick={() => setActiveTab('content')}>Content Library</Tab>
                </TabsList>
              </Tabs>
              <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Campaign</Button>
            </Stack>

            <TabPanel active={isActive('artists')}>
              <Grid cols={3} gap={4}>
                {artists.map((artist) => (
                  <Card key={artist.id} className="p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Body className="font-display">{artist.name}</Body>
                          <Badge variant="outline">{artist.genre}</Badge>
                        </Stack>
                        <Badge variant={getStatusVariant(artist.status)}>{artist.status}</Badge>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className="">Total Followers</Body>
                        <Body className="text-h6-md">{formatNumber(artist.followers)}</Body>
                      </Stack>
                      <Stack gap={2}>
                        <Body size="sm" className="">Platforms</Body>
                        {artist.platforms.map((p) => (
                          <Stack key={p.name} direction="horizontal" className="justify-between">
                            <Body size="sm" className="">{p.name}</Body>
                            <Body size="sm" className="">{formatNumber(p.followers)}</Body>
                          </Stack>
                        ))}
                      </Stack>
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Body size="sm" className="">Scheduled</Body>
                          <Body>{artist.scheduledPosts} posts</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body size="sm" className="">Engagement</Body>
                          <Body>{artist.engagement}%</Body>
                        </Stack>
                      </Grid>
                      <Button variant="outline" size="sm" onClick={() => setSelectedArtist(artist)}>Manage</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={isActive('campaigns')}>
              <Stack gap={4}>
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="p-6">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Body className="font-display">{campaign.name}</Body>
                        <Body size="sm" className="">{campaign.eventName}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className="">Artists</Body>
                        <Body>{campaign.artists.length}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className="">Duration</Body>
                        <Body size="sm" className="">{campaign.startDate} - {campaign.endDate}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body size="sm" className="">Reach</Body>
                        <Body>{formatNumber(campaign.reach)}</Body>
                      </Stack>
                      <Badge variant={getStatusVariant(campaign.status)}>{campaign.status}</Badge>
                      <Button variant="outline" size="sm" onClick={() => setSelectedCampaign(campaign)}>Details</Button>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>

            <TabPanel active={isActive('content')}>
              <Grid cols={4} gap={4}>
                {["Promo Graphics", "Video Clips", "Story Templates", "Post Captions", "Hashtag Sets", "Bio Links", "Press Photos", "Logo Pack"].map((item, idx) => (
                  <Card key={idx} className="cursor-pointer p-4">
                    <Stack gap={2} className="text-center">
                      <Body className="text-h3-md">{["🖼️", "🎬", "📱", "📝", "#️⃣", "🔗", "📷", "🎨"][idx]}</Body>
                      <Body>{item}</Body>
                      <Body size="sm" className="">{Math.floor(Math.random() * 20) + 5} items</Body>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <Grid cols={3} gap={4}>
              <Button variant="outline">Analytics</Button>
              <Button variant="outline" onClick={() => router.push("/marketing")}>Marketing</Button>
              <Button variant="outline" onClick={() => router.push("/projects")}>Projects</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedArtist} onClose={() => setSelectedArtist(null)}>
        <ModalHeader><H3>{selectedArtist?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedArtist && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Badge variant="outline">{selectedArtist.genre}</Badge>
                <Badge variant={getStatusVariant(selectedArtist.status)}>{selectedArtist.status}</Badge>
              </Stack>
              <Stack gap={1}>
                <Body size="sm" className="">Total Reach</Body>
                <Body className="text-h5-md">{formatNumber(selectedArtist.followers)}</Body>
              </Stack>
              <Stack gap={2}>
                <Body className="font-display">Platform Breakdown</Body>
                {selectedArtist.platforms.map((p) => (
                  <Card key={p.name} className="p-3">
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Stack gap={0}>
                        <Body>{p.name}</Body>
                        <Body size="sm" className="">{p.handle}</Body>
                      </Stack>
                      <Body>{formatNumber(p.followers)}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body size="sm" className="">Scheduled Posts</Body>
                  <Body>{selectedArtist.scheduledPosts}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Avg Engagement</Body>
                  <Body>{selectedArtist.engagement}%</Body>
                </Stack>
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
            <Input placeholder="Campaign name" />
            <Select>
              <option value="">Select Event...</option>
              <option value="EVT-001">Summer Fest 2024</option>
            </Select>
            <Grid cols={2} gap={4}>
              <Input type="date" />
              <Input type="date" />
            </Grid>
            <Textarea placeholder="Campaign description..." rows={3} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Create</Button>
        </ModalFooter>
      </Modal>

      {/* Campaign Details Modal */}
      <Modal open={!!selectedCampaign} onClose={() => setSelectedCampaign(null)}>
        <ModalHeader>
          <H3>{selectedCampaign?.name}</H3>
        </ModalHeader>
        <ModalBody>
          {selectedCampaign && (
            <Stack gap={4}>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body size="sm" className=" text-ink-500">Event</Body>
                  <Body className="font-display">{selectedCampaign.event}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className=" text-ink-500">Status</Body>
                  <Badge variant={getStatusVariant(selectedCampaign.status)}>{selectedCampaign.status}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className=" text-ink-500">Artists</Body>
                  <Body className="font-display">{selectedCampaign.artists}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className=" text-ink-500">Total Reach</Body>
                  <Body className="font-display">{formatNumber(selectedCampaign.reach)}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className=" text-ink-500">Posts</Body>
                  <Body className="font-display">{selectedCampaign.posts}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className=" text-ink-500">Engagement</Body>
                  <Body className="font-display">{selectedCampaign.engagement}</Body>
                </Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCampaign(null)}>Close</Button>
          <Button variant="solid">Edit Campaign</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
