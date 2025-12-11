"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Tabs, TabsList, Tab, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_FAN_CONTENT,
  type DemoFanContent as FanContent,
} from "@/lib/demo-data";

const mockContent = DEMO_FAN_CONTENT;

function FanContentPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'featured',
    validTabs: ['featured', 'photo', 'video', 'story', 'all'],
  });
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
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Community</Kicker>
              <H2 size="lg" className="text-white">Fan Content Showcase</H2>
              <Body className="text-on-dark-muted">Discover and share fan-created content from events</Body>
            </Stack>

            <Grid cols={4} gap={6}>
              <StatCard label="Total Submissions" value={mockContent.length.toString()} inverted />
              <StatCard label="Featured" value={featuredCount.toString()} inverted />
              <StatCard label="Total Likes" value={totalLikes.toLocaleString()} inverted />
              <StatCard label="This Week" value={mockContent.filter(c => c.createdAt >= "2024-11-20").length.toString()} inverted />
            </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={isActive('featured')} onClick={() => setActiveTab('featured')}>Featured</Tab>
                <Tab active={isActive('photo')} onClick={() => setActiveTab('photo')}>Photos</Tab>
                <Tab active={isActive('video')} onClick={() => setActiveTab('video')}>Videos</Tab>
                <Tab active={isActive('story')} onClick={() => setActiveTab('story')}>Stories</Tab>
                <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowSubmitModal(true)}>Share Your Content</Button>
          </Stack>

          <Grid cols={3} gap={4}>
            {filteredContent.map((content) => (
              <Card key={content.id} inverted interactive className="cursor-pointer overflow-hidden" onClick={() => setSelectedContent(content)}>
                <Stack className="flex h-48 items-center justify-center bg-ink-900">
                  <Label className="text-h1-sm">{getTypeIcon(content.type)}</Label>
                </Stack>
                <Stack className="p-4" gap={3}>
                  <Stack direction="horizontal" className="items-start justify-between">
                    <Body className="font-display text-white">{content.title}</Body>
                    {content.featured && <Badge variant="solid">Featured</Badge>}
                  </Stack>
                  <Label className="text-on-dark-muted">by {content.creator}</Label>
                  <Label size="xs" className="text-on-dark-disabled">{content.eventName}</Label>
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

          <Button variant="outlineInk" onClick={() => router.push("/community")}>Back to Community</Button>
          </Stack>

      <Modal open={!!selectedContent} onClose={() => setSelectedContent(null)}>
        <ModalHeader><H3>{selectedContent?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedContent && (
            <Stack gap={4}>
              <Stack className="flex h-64 items-center justify-center rounded-card bg-ink-100">
                <Label className="text-h1-sm">{getTypeIcon(selectedContent.type)}</Label>
              </Stack>
              <Stack direction="horizontal" className="justify-between">
                <Stack gap={1}>
                  <Body className="font-display">{selectedContent.creator}</Body>
                  <Label className="text-on-light-muted">{selectedContent.eventName}</Label>
                </Stack>
                <Label className="text-on-light-muted">{selectedContent.createdAt}</Label>
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
            <Input placeholder="Title" />
            <Select>
              <option value="">Content Type...</option>
              <option value="photo">Photo</option>
              <option value="video">Video</option>
              <option value="story">Story</option>
              <option value="review">Review</option>
            </Select>
            <Select>
              <option value="">Select Event...</option>
              <option value="EVT-001">Summer Fest 2024</option>
              <option value="EVT-002">Fall Concert</option>
            </Select>
            <Textarea placeholder="Description..." rows={3} />
            <Input placeholder="Tags (comma separated)" />
            <Card className="cursor-pointer border-2 border-dashed border-ink-400 p-8 text-center">
              <Label className="text-on-light-muted">Drop file or click to upload</Label>
            </Card>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSubmitModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowSubmitModal(false)}>Submit</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}

export default function FanContentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <FanContentPageContent />
    </Suspense>
  );
}
