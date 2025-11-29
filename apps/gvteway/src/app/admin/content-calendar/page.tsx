"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Tabs, TabsList, Tab, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
  Kicker,
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

  // Status color helper - now using Badge variants instead
  const _getStatusColor = (status: string) => {
    switch (status) {
      case "Published": return "text-success-600";
      case "Scheduled": return "text-info-600";
      case "Draft": return "text-ink-500";
      default: return "text-ink-600";
    }
  };

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Admin</Kicker>
              <H2 size="lg" className="text-white">Content Calendar</H2>
              <Body className="text-on-dark-muted">Schedule and manage social media content</Body>
            </Stack>

            <Grid cols={4} gap={6}>
              <StatCard label="Scheduled" value={scheduledCount.toString()} inverted />
              <StatCard label="Published" value={publishedCount.toString()} inverted />
              <StatCard label="Drafts" value={mockPosts.filter(p => p.status === "Draft").length.toString()} inverted />
              <StatCard label="This Week" value={mockPosts.length.toString()} inverted />
            </Grid>

            <Stack direction="horizontal" className="justify-between">
              <Tabs>
                <TabsList>
                  <Tab active={activeTab === "list"} onClick={() => setActiveTab("list")}>List</Tab>
                  <Tab active={activeTab === "drafts"} onClick={() => setActiveTab("drafts")}>Drafts</Tab>
                </TabsList>
              </Tabs>
              <Button variant="solid" inverted onClick={() => setShowCreateModal(true)}>Create Post</Button>
            </Stack>

            <Stack gap={3}>
              {mockPosts.filter(p => activeTab === "list" || p.status === "Draft").map((post) => (
                <Card key={post.id} inverted>
                  <Grid cols={6} gap={4} className="items-center">
                    <Stack gap={1}>
                      <Body className="font-display text-white">{post.title}</Body>
                      <Label size="xs" className="text-on-dark-muted">{post.author}</Label>
                    </Stack>
                    <Badge variant="outline">{post.platform}</Badge>
                    <Stack gap={1}>
                      <Label className="text-white">{post.scheduledDate}</Label>
                      <Label size="xs" className="text-on-dark-muted">{post.scheduledTime}</Label>
                    </Stack>
                    <Badge variant="outline">{post.mediaType}</Badge>
                    <Badge variant={post.status === "Published" ? "solid" : post.status === "Scheduled" ? "outline" : "ghost"}>{post.status}</Badge>
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outlineInk" size="sm" onClick={() => setSelectedPost(post)}>Edit</Button>
                      {post.status === "Draft" && <Button variant="solid" size="sm" inverted>Schedule</Button>}
                    </Stack>
                  </Grid>
                </Card>
              ))}
            </Stack>

            <Button variant="outlineInk" onClick={() => router.push("/admin")}>Back to Admin</Button>
          </Stack>

      <Modal open={!!selectedPost} onClose={() => setSelectedPost(null)}>
        <ModalHeader><H3>Edit Post</H3></ModalHeader>
        <ModalBody>
          {selectedPost && (
            <Stack gap={4}>
              <Input defaultValue={selectedPost.title} />
              <Textarea defaultValue={selectedPost.content} rows={3} />
              <Grid cols={2} gap={4}>
                <Select defaultValue={selectedPost.platform}>
                  <option value="All">All Platforms</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Facebook">Facebook</option>
                  <option value="Twitter">Twitter</option>
                  <option value="TikTok">TikTok</option>
                </Select>
                <Select defaultValue={selectedPost.mediaType}>
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                  <option value="Carousel">Carousel</option>
                  <option value="Story">Story</option>
                </Select>
              </Grid>
              <Grid cols={2} gap={4}>
                <Input type="date" defaultValue={selectedPost.scheduledDate} />
                <Input type="time" defaultValue={selectedPost.scheduledTime} />
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
            <Input placeholder="Post title" />
            <Textarea placeholder="Content..." rows={3} />
            <Grid cols={2} gap={4}>
              <Select>
                <option value="">Platform...</option>
                <option value="All">All Platforms</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="TikTok">TikTok</option>
              </Select>
              <Select>
                <option value="">Media Type...</option>
                <option value="Image">Image</option>
                <option value="Video">Video</option>
                <option value="Carousel">Carousel</option>
              </Select>
            </Grid>
            <Grid cols={2} gap={4}>
              <Input type="date" />
              <Input type="time" />
            </Grid>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Save Draft</Button>
          <Button variant="solid" onClick={() => setShowCreateModal(false)}>Schedule</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}
