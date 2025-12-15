"use client";

import { useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { Camera } from "lucide-react";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Input, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_PHOTO_BOOTHS,
  DEMO_PHOTO_BOOTH_SESSIONS,
  type DemoPhotoBooth as PhotoBooth,
} from "@/lib/demo-data";

const mockBooths = DEMO_PHOTO_BOOTHS;
const mockSessions = DEMO_PHOTO_BOOTH_SESSIONS;

function PhotoBoothPageContent() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'booths',
    validTabs: ['booths', 'gallery', 'recent'],
  });
  const [selectedBooth, setSelectedBooth] = useState<PhotoBooth | null>(null);

  const totalPhotos = mockBooths.reduce((sum, b) => sum + b.photosTaken, 0);
  const totalSessions = mockBooths.reduce((sum, b) => sum + b.sessionCount, 0);
  const activeBooths = mockBooths.filter(b => b.status === "Active").length;
  const sharedCount = mockSessions.filter(s => s.shared).length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-600";
      case "Offline": return "text-error-600";
      case "Maintenance": return "text-warning-600";
      default: return "text-ink-600";
    }
  };

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Events</Kicker>
              <H2 size="lg" className="text-white">Photo Booth</H2>
              <Body className="text-on-dark-muted">Capture memories and share instantly to social media</Body>
            </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Active Booths" value={activeBooths} className="border-2 border-black" />
            <StatCard label="Total Sessions" value={totalSessions} className="border-2 border-black" />
            <StatCard label="Photos Taken" value={totalPhotos.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Shared" value={`${Math.round((sharedCount / mockSessions.length) * 100)}%`} trend="up" className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={isActive('booths')} onClick={() => setActiveTab('booths')}>Booths</Tab>
              <Tab active={isActive('gallery')} onClick={() => setActiveTab('gallery')}>Gallery</Tab>
              <Tab active={isActive('recent')} onClick={() => setActiveTab('recent')}>Recent Sessions</Tab>
            </TabsList>

            <TabPanel active={isActive('booths')}>
              <Grid cols={2} gap={4}>
                {mockBooths.map((booth) => (
                  <Card key={booth.id} className="border-2 border-black overflow-hidden">
                    <Card className="p-4 bg-black text-white">
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Body className="font-weight-bold">{booth.name}</Body>
                        <Label className={getStatusColor(booth.status)}>{booth.status}</Label>
                      </Stack>
                    </Card>
                    <Stack className="p-4" gap={4}>
                      <Label className="text-ink-500">{booth.location}</Label>
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Sessions</Label>
                          <Label className="font-mono text-h6-md">{booth.sessionCount}</Label>
                        </Stack>
                        <Stack gap={1}>
                          <Label size="xs" className="text-ink-500">Photos</Label>
                          <Label className="font-mono text-h6-md">{booth.photosTaken}</Label>
                        </Stack>
                      </Grid>
                      <Button variant="outline" onClick={() => setSelectedBooth(booth)}>View Details</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={isActive('gallery')}>
              <Stack gap={4}>
                <Grid cols={4} gap={4}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                    <Card key={i} className="aspect-square bg-ink-100 border-2 border-black flex items-center justify-center cursor-pointer hover:bg-ink-200">
                      <Stack gap={2} className="text-center">
                        <Camera className="size-8" />
                        <Label size="xs" className="text-ink-500">Photo {i}</Label>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
                <Button variant="outline">Load More</Button>
              </Stack>
            </TabPanel>

            <TabPanel active={isActive('recent')}>
              <Stack gap={3}>
                {mockSessions.map((session) => (
                  <Card key={session.id} className="border-2 border-black p-4">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Label className="font-mono">{session.id}</Label>
                        <Label size="xs" className="text-ink-500">{session.boothName}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Time</Label>
                        <Label>{new Date(session.timestamp).toLocaleTimeString()}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Photos</Label>
                        <Label>{session.photoCount}</Label>
                      </Stack>
                      <Stack direction="horizontal" gap={2}>
                        {session.shared && session.sharedTo?.map(platform => (
                          <Badge key={platform} variant="outline">{platform}</Badge>
                        ))}
                        {session.printed && <Badge variant="solid">Printed</Badge>}
                      </Stack>
                      <Button variant="outline" size="sm">View</Button>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>
          </Tabs>

          <Card className="border-2 border-black p-6">
            <Stack gap={4}>
              <H3>Share Your Photos</H3>
              <Body className="text-ink-600">Enter your session code to access and share your photos</Body>
              <Grid cols={3} gap={4}>
                <Input placeholder="Session Code (e.g., SES-001)" className="col-span-2 border-2 border-black" />
                <Button variant="solid">Find My Photos</Button>
              </Grid>
            </Stack>
          </Card>

          <Grid cols={2} gap={4}>
            <Button variant="outlineInk" onClick={() => router.push(`/events/${eventId}`)}>Back to Event</Button>
            <Button variant="outlineInk" onClick={() => router.push(`/events/${eventId}/photos`)}>Photo Gallery</Button>
          </Grid>
          </Stack>

      <Modal open={!!selectedBooth} onClose={() => setSelectedBooth(null)}>
        <ModalHeader><H3>Booth Details</H3></ModalHeader>
        <ModalBody>
          {selectedBooth && (
            <Stack gap={4}>
              <Body className="font-weight-bold text-body-md">{selectedBooth.name}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Location</Label><Label>{selectedBooth.location}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Status</Label><Label className={getStatusColor(selectedBooth.status)}>{selectedBooth.status}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Sessions Today</Label><Label className="font-mono text-h6-md">{selectedBooth.sessionCount}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Photos Taken</Label><Label className="font-mono text-h6-md">{selectedBooth.photosTaken}</Label></Stack>
              </Grid>
              <Stack gap={2}>
                <Label className="text-ink-500">Recent Activity</Label>
                {mockSessions.filter(s => s.boothId === selectedBooth.id).slice(0, 3).map(session => (
                  <Card key={session.id} className="p-3 bg-ink-50 border-2 border-ink-200">
                    <Stack direction="horizontal" className="justify-between">
                      <Label>{new Date(session.timestamp).toLocaleTimeString()}</Label>
                      <Label>{session.photoCount} photos</Label>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedBooth(null)}>Close</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}

export default function PhotoBoothPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <PhotoBoothPageContent />
    </Suspense>
  );
}
