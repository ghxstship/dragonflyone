"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  Container, H2, H3, Body, Label, Grid, Stack, Button,
  Section, Card, Input, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter,
  PageLayout, Footer, FooterColumn, FooterLink, Display, Kicker,
} from "@ghxstship/ui";

interface Friend {
  id: string;
  name: string;
  avatar?: string;
  status: "attending" | "interested" | "invited";
  location?: { section?: string; row?: string; seat?: string };
  lastSeen?: string;
  shareLocation: boolean;
}

interface MeetupSpot {
  id: string;
  name: string;
  description: string;
  type: "food" | "drinks" | "merch" | "restroom" | "custom";
}

const mockFriends: Friend[] = [
  { id: "F-001", name: "Alex Thompson", status: "attending", location: { section: "A", row: "12", seat: "5" }, lastSeen: "2 min ago", shareLocation: true },
  { id: "F-002", name: "Jordan Lee", status: "attending", location: { section: "B", row: "8" }, lastSeen: "5 min ago", shareLocation: true },
  { id: "F-003", name: "Casey Morgan", status: "interested", shareLocation: false },
  { id: "F-004", name: "Riley Chen", status: "invited", shareLocation: false },
];

const meetupSpots: MeetupSpot[] = [
  { id: "MS-001", name: "Main Bar", description: "Near Section A entrance", type: "drinks" },
  { id: "MS-002", name: "Food Court", description: "Ground level, east side", type: "food" },
  { id: "MS-003", name: "Merch Booth", description: "Main concourse", type: "merch" },
];

export default function FriendFinderPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const [shareLocation, setShareLocation] = useState(true);
  const [showMeetupModal, setShowMeetupModal] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);

  const attendingFriends = mockFriends.filter(f => f.status === "attending");

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Events">
            <FooterLink href="/events">Events</FooterLink>
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
              <Kicker colorScheme="on-dark">Events</Kicker>
              <H2 size="lg" className="text-white">Friend Finder</H2>
              <Body className="text-on-dark-muted">Find and meet up with friends at this event</Body>
            </Stack>

          <Card className="p-4 border-2 border-black">
            <Stack direction="horizontal" className="justify-between items-center">
              <Stack gap={1}>
                <Label className="font-bold">Share My Location</Label>
                <Label size="xs" className="text-ink-500">Let friends see where you are</Label>
              </Stack>
              <Button variant={shareLocation ? "solid" : "outline"} onClick={() => setShareLocation(!shareLocation)}>
                {shareLocation ? "Sharing" : "Off"}
              </Button>
            </Stack>
          </Card>

          {shareLocation && (
            <Alert variant="info">Your location is being shared with friends attending this event</Alert>
          )}

          <Stack gap={4}>
            <H3>FRIENDS ATTENDING ({attendingFriends.length})</H3>
            <Grid cols={2} gap={4}>
              {attendingFriends.map((friend) => (
                <Card key={friend.id} className="p-4 border-2 border-black">
                  <Stack gap={3}>
                    <Stack direction="horizontal" className="justify-between items-start">
                      <Stack gap={1}>
                        <Body className="font-bold">{friend.name}</Body>
                        {friend.shareLocation && friend.location && (
                          <Label size="xs" className="text-ink-500">
                            Section {friend.location.section}{friend.location.row && `, Row ${friend.location.row}`}
                          </Label>
                        )}
                      </Stack>
                      {friend.shareLocation && (
                        <Badge variant="solid">{friend.lastSeen}</Badge>
                      )}
                    </Stack>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outline" size="sm" onClick={() => { setSelectedFriend(friend); setShowMeetupModal(true); }}>
                        Meet Up
                      </Button>
                      <Button variant="ghost" size="sm">Message</Button>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>

          <Stack gap={4}>
            <H3>SUGGESTED MEETUP SPOTS</H3>
            <Grid cols={3} gap={4}>
              {meetupSpots.map((spot) => (
                <Card key={spot.id} className="p-4 border border-ink-200">
                  <Stack gap={2}>
                    <Body className="font-bold">{spot.name}</Body>
                    <Label size="xs" className="text-ink-500">{spot.description}</Label>
                    <Badge variant="outline">{spot.type}</Badge>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>

          <Stack gap={4}>
            <H3>INVITE FRIENDS</H3>
            <Card className="p-4 border border-ink-200">
              <Stack gap={4}>
                <Input placeholder="Search contacts..." className="border-ink-300" />
                <Grid cols={2} gap={2}>
                  {mockFriends.filter(f => f.status !== "attending").map((friend) => (
                    <Card key={friend.id} className="p-3 border border-ink-200">
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Label>{friend.name}</Label>
                        <Button variant="outline" size="sm">
                          {friend.status === "invited" ? "Invited" : "Invite"}
                        </Button>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Card>
          </Stack>

          <Button variant="outlineInk" onClick={() => router.push(`/events/${eventId}`)}>Back to Event</Button>
          </Stack>
        </Container>
      </Section>

      <Modal open={showMeetupModal} onClose={() => setShowMeetupModal(false)}>
        <ModalHeader><H3>Set Meetup Point</H3></ModalHeader>
        <ModalBody>
          {selectedFriend && (
            <Stack gap={4}>
              <Body>Meet up with {selectedFriend.name}</Body>
              <Stack gap={2}>
                <Label>Select Location</Label>
                {meetupSpots.map((spot) => (
                  <Card key={spot.id} className="p-3 border border-ink-200 cursor-pointer hover:border-black">
                    <Stack gap={1}>
                      <Label className="font-bold">{spot.name}</Label>
                      <Label size="xs" className="text-ink-500">{spot.description}</Label>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Input type="time" className="border-ink-300" />
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowMeetupModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowMeetupModal(false)}>Send Invite</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
