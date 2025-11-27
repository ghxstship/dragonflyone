"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "../../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface FanContent {
  id: string;
  type: "Photo" | "Video" | "Story" | "Review";
  title: string;
  creator: string;
  eventName: string;
  createdAt: string;
  likes: number;
  comments: number;
  featured: boolean;
  status: "Published" | "Pending" | "Featured";
  tags: string[];
}

const mockContent: FanContent[] = [
  { id: "FC-001", type: "Photo", title: "Front Row Magic", creator: "Sarah M.", eventName: "Summer Fest 2024", createdAt: "2024-11-24", likes: 342, comments: 28, featured: true, status: "Featured", tags: ["concert", "crowd"] },
  { id: "FC-002", type: "Video", title: "Epic Encore", creator: "Mike T.", eventName: "Summer Fest 2024", createdAt: "2024-11-24", likes: 892, comments: 67, featured: true, status: "Featured", tags: ["encore", "fireworks"] },
  { id: "FC-003", type: "Story", title: "My First Festival", creator: "Emily C.", eventName: "Summer Fest 2024", createdAt: "2024-11-25", likes: 156, comments: 42, featured: false, status: "Published", tags: ["firsttime", "memories"] },
  { id: "FC-004", type: "Photo", title: "Sunset Stage", creator: "Alex R.", eventName: "Fall Concert", createdAt: "2024-11-20", likes: 234, comments: 19, featured: false, status: "Published", tags: ["sunset", "stage"] },
  { id: "FC-005", type: "Review", title: "Best Night Ever", creator: "Jordan K.", eventName: "Summer Fest 2024", createdAt: "2024-11-25", likes: 89, comments: 12, featured: false, status: "Pending", tags: ["review", "amazing"] },
];

export default function FanContentPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("featured");
  const [selectedContent, setSelectedContent] = useState<FanContent | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const featuredCount = mockContent.filter(c => c.featured).length;
  const totalLikes = mockContent.reduce((sum, c) => sum + c.likes, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Photo": return "📷";
      case "Video": return "🎬";
      case "Story": return "📝";
      case "Review": return "⭐";
      default: return "📄";
    }
  };

  const filteredContent = activeTab === "all" ? mockContent :
    activeTab === "featured" ? mockContent.filter(c => c.featured) :
    mockContent.filter(c => c.type.toLowerCase() === activeTab);

  return (
    <Section className="min-h-screen bg-white">
      <ConsumerNavigationPublic />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2} className="border-b-2 border-black pb-8">
            <H1>Fan Content Showcase</H1>
            <Body className="text-grey-600">Discover and share fan-created content from events</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Submissions" value={mockContent.length} className="border-2 border-black" />
            <StatCard label="Featured" value={featuredCount} className="border-2 border-black" />
            <StatCard label="Total Likes" value={totalLikes.toLocaleString()} className="border-2 border-black" />
            <StatCard label="This Week" value={mockContent.filter(c => c.createdAt >= "2024-11-20").length} className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "featured"} onClick={() => setActiveTab("featured")}>Featured</Tab>
                <Tab active={activeTab === "photo"} onClick={() => setActiveTab("photo")}>Photos</Tab>
                <Tab active={activeTab === "video"} onClick={() => setActiveTab("video")}>Videos</Tab>
                <Tab active={activeTab === "story"} onClick={() => setActiveTab("story")}>Stories</Tab>
                <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowSubmitModal(true)}>Share Your Content</Button>
          </Stack>

          <Grid cols={3} gap={4}>
            {filteredContent.map((content) => (
              <Card key={content.id} className="border-2 border-black overflow-hidden cursor-pointer" onClick={() => setSelectedContent(content)}>
                <Card className="h-48 bg-grey-100 flex items-center justify-center">
                  <Label className="text-6xl">{getTypeIcon(content.type)}</Label>
                </Card>
                <Stack className="p-4" gap={3}>
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Body className="font-bold">{content.title}</Body>
                    {content.featured && <Badge variant="solid">Featured</Badge>}
                  </Stack>
                  <Label className="text-grey-500">by {content.creator}</Label>
                  <Label size="xs" className="text-grey-600">{content.eventName}</Label>
                  <Stack direction="horizontal" gap={4}>
                    <Label size="xs">❤️ {content.likes}</Label>
                    <Label size="xs">💬 {content.comments}</Label>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    {content.tags.map(tag => <Badge key={tag} variant="outline">#{tag}</Badge>)}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Button variant="outline" onClick={() => router.push("/community")}>Back to Community</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedContent} onClose={() => setSelectedContent(null)}>
        <ModalHeader><H3>{selectedContent?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedContent && (
            <Stack gap={4}>
              <Card className="h-64 bg-grey-100 flex items-center justify-center">
                <Label className="text-6xl">{getTypeIcon(selectedContent.type)}</Label>
              </Card>
              <Stack direction="horizontal" className="justify-between">
                <Stack gap={1}>
                  <Body className="font-bold">{selectedContent.creator}</Body>
                  <Label className="text-grey-500">{selectedContent.eventName}</Label>
                </Stack>
                <Label className="text-grey-600">{selectedContent.createdAt}</Label>
              </Stack>
              <Stack direction="horizontal" gap={6}>
                <Label>❤️ {selectedContent.likes} likes</Label>
                <Label>💬 {selectedContent.comments} comments</Label>
              </Stack>
              <Stack direction="horizontal" gap={2}>
                {selectedContent.tags.map(tag => <Badge key={tag} variant="outline">#{tag}</Badge>)}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedContent(null)}>Close</Button>
          <Button variant="solid">Like</Button>
          <Button variant="outline">Share</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showSubmitModal} onClose={() => setShowSubmitModal(false)}>
        <ModalHeader><H3>Share Your Content</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Title" className="border-2 border-black" />
            <Select className="border-2 border-black">
              <option value="">Content Type...</option>
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="story">Story</option>
              <option value="review">Review</option>
            </Select>
            <Select className="border-2 border-black">
              <option value="">Select Event...</option>
              <option value="EVT-001">Summer Fest 2024</option>
              <option value="EVT-002">Fall Concert</option>
            </Select>
            <Textarea placeholder="Description..." rows={3} className="border-2 border-black" />
            <Input placeholder="Tags (comma separated)" className="border-2 border-black" />
            <Card className="p-8 border-2 border-dashed border-grey-400 text-center cursor-pointer">
              <Label className="text-grey-500">Drop file or click to upload</Label>
            </Card>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowSubmitModal(false)}>Submit</Button>
        </ModalFooter>
      </Modal>
    </Section>
  );
}
