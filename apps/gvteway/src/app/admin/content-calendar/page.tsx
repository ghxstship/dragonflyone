"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface ScheduledPost {
  id: string;
  title: string;
  content: string;
  platform: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "Scheduled" | "Published" | "Draft";
  eventName?: string;
  mediaType: string;
  author: string;
}

const mockPosts: ScheduledPost[] = [
  { id: "POST-001", title: "Lineup Reveal", content: "Check out our lineup!", platform: "All", scheduledDate: "2024-11-26", scheduledTime: "10:00", status: "Scheduled", eventName: "Summer Fest", mediaType: "Carousel", author: "Marketing" },
  { id: "POST-002", title: "Early Bird Reminder", content: "Last chance for early bird!", platform: "Instagram", scheduledDate: "2024-11-26", scheduledTime: "14:00", status: "Scheduled", eventName: "Summer Fest", mediaType: "Story", author: "Sarah M." },
  { id: "POST-003", title: "Behind the Scenes", content: "Production setup peek", platform: "TikTok", scheduledDate: "2024-11-27", scheduledTime: "12:00", status: "Draft", mediaType: "Video", author: "Content Team" },
  { id: "POST-004", title: "Artist Spotlight", content: "Meet our headliner!", platform: "Facebook", scheduledDate: "2024-11-25", scheduledTime: "18:00", status: "Published", eventName: "Summer Fest", mediaType: "Image", author: "Marketing" },
];

export default function ContentCalendarPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("list");
  const [selectedPost, setSelectedPost] = useState<ScheduledPost | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const scheduledCount = mockPosts.filter(p => p.status === "Scheduled").length;
  const publishedCount = mockPosts.filter(p => p.status === "Published").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "text-success-600";
      case "Scheduled": return "text-info-600";
      case "Draft": return "text-grey-500";
      default: return "text-grey-600";
    }
  };

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>Content Calendar</H1>
            <Body className="text-grey-600">Schedule and manage social media content</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Scheduled" value={scheduledCount} className="border-2 border-black" />
            <StatCard label="Published" value={publishedCount} className="border-2 border-black" />
            <StatCard label="Drafts" value={mockPosts.filter(p => p.status === "Draft").length} className="border-2 border-black" />
            <StatCard label="This Week" value={mockPosts.length} className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "list"} onClick={() => setActiveTab("list")}>List</Tab>
                <Tab active={activeTab === "drafts"} onClick={() => setActiveTab("drafts")}>Drafts</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowCreateModal(true)}>Create Post</Button>
          </Stack>

          <Stack gap={3}>
            {mockPosts.filter(p => activeTab === "list" || p.status === "Draft").map((post) => (
              <Card key={post.id} className="border-2 border-black p-4">
                <Grid cols={6} gap={4} className="items-center">
                  <Stack gap={1}>
                    <Body className="font-bold">{post.title}</Body>
                    <Label className="text-grey-500">{post.author}</Label>
                  </Stack>
                  <Badge variant="outline">{post.platform}</Badge>
                  <Stack gap={1}>
                    <Label>{post.scheduledDate}</Label>
                    <Label className="text-grey-500">{post.scheduledTime}</Label>
                  </Stack>
                  <Badge variant="outline">{post.mediaType}</Badge>
                  <Label className={getStatusColor(post.status)}>{post.status}</Label>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="outline" size="sm" onClick={() => setSelectedPost(post)}>Edit</Button>
                    {post.status === "Draft" && <Button variant="solid" size="sm">Schedule</Button>}
                  </Stack>
                </Grid>
              </Card>
            ))}
          </Stack>

          <Button variant="outline" onClick={() => router.push("/admin")}>Back to Admin</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedPost} onClose={() => setSelectedPost(null)}>
        <ModalHeader><H3>Edit Post</H3></ModalHeader>
        <ModalBody>
          {selectedPost && (
            <Stack gap={4}>
              <Input defaultValue={selectedPost.title} className="border-2 border-black" />
              <Textarea defaultValue={selectedPost.content} rows={3} className="border-2 border-black" />
              <Grid cols={2} gap={4}>
                <Select defaultValue={selectedPost.platform} className="border-2 border-black">
                  <option value="All">All Platforms</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Twitter">Twitter</option>
                  <option value="TikTok">TikTok</option>
                </Select>
                <Select defaultValue={selectedPost.mediaType} className="border-2 border-black">
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                  <option value="Carousel">Carousel</option>
                  <option value="Story">Story</option>
                </Select>
              </Grid>
              <Grid cols={2} gap={4}>
                <Input type="date" defaultValue={selectedPost.scheduledDate} className="border-2 border-black" />
                <Input type="time" defaultValue={selectedPost.scheduledTime} className="border-2 border-black" />
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPost(null)}>Cancel</Button>
          <Button variant="solid" onClick={() => setSelectedPost(null)}>Save</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <ModalHeader><H3>Create Post</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Post title" className="border-2 border-black" />
            <Textarea placeholder="Content..." rows={3} className="border-2 border-black" />
            <Grid cols={2} gap={4}>
              <Select className="border-2 border-black">
                <option value="">Platform...</option>
                <option value="All">All Platforms</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
              </Select>
              <Select className="border-2 border-black">
                <option value="">Media Type...</option>
                <option value="Image">Image</option>
                <option value="Video">Video</option>
                <option value="Carousel">Carousel</option>
              </Select>
            </Grid>
            <Grid cols={2} gap={4}>
              <Input type="date" className="border-2 border-black" />
              <Input type="time" className="border-2 border-black" />
            </Grid>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Save Draft</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Schedule</Button>
        </ModalFooter>
      </Modal>
    </Section>
  );
}
