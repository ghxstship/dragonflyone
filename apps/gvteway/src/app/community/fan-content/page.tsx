"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { Camera, Video, FileText, Star, Heart, MessageCircle } from "lucide-react";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Tabs, TabsList, Tab, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Kicker,
} from "@ghxstship/ui";

import { useFanContentData, type FanContent } from "@/hooks/useFanContent";

function FanContentPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'featured',
    validTabs: ['featured', 'photo', 'video', 'story', 'all'],
  });
  const [selectedContent, setSelectedContent] = useState<FanContent | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // React Query hook for fan content data
  const { content, isLoading, error, likeContent, shareContent, isSubmitting } = useFanContentData();

  const featuredCount = content.filter((c: FanContent) => c.is_featured).length;
  const totalLikes = content.reduce((sum: number, c: FanContent) => sum + c.likes, 0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Photo": return <Camera className="size-8" />;
      case "Video": return <Video className="size-8" />;
      case "Story": return <FileText className="size-8" />;
      case "Review": return <Star className="size-8" />;
      default: return <FileText className="size-8" />;
    }
  };

  const filteredContent = activeTab === "all" ? content :
    activeTab === "featured" ? content.filter((c: FanContent) => c.is_featured) :
    content.filter((c: FanContent) => c.type.toLowerCase() === activeTab);

  // Loading state
  if (isLoading) {
    return (
      <GvtewayAppLayout>
        <Stack gap={10}>
          <Stack gap={2}>
            <Kicker colorScheme="on-dark">Community</Kicker>
            <H2 size="lg" className="text-white">Fan Content Showcase</H2>
          </Stack>
          <Card inverted className="p-8 text-center">
            <Body className="text-on-dark-muted">Loading fan content...</Body>
          </Card>
        </Stack>
      </GvtewayAppLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <GvtewayAppLayout>
        <Stack gap={10}>
          <Stack gap={2}>
            <Kicker colorScheme="on-dark">Community</Kicker>
            <H2 size="lg" className="text-white">Fan Content Showcase</H2>
          </Stack>
          <Card inverted className="p-8 text-center">
            <Body className="text-on-dark-muted">Failed to load fan content. Please try again.</Body>
            <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">Retry</Button>
          </Card>
        </Stack>
      </GvtewayAppLayout>
    );
  }

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Community</Kicker>
              <H2 size="lg" className="text-white">Fan Content Showcase</H2>
              <Body className="text-on-dark-muted">Discover and share fan-created content from events</Body>
            </Stack>

            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total Submissions" value={content.length.toString()} inverted />
              <StatCard label="Featured" value={featuredCount.toString()} inverted />
              <StatCard label="Total Likes" value={totalLikes.toLocaleString()} inverted />
              <StatCard label="Approved" value={content.filter((c: FanContent) => c.status === 'approved' || c.status === 'featured').length.toString()} inverted />
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

          {filteredContent.length === 0 ? (
            <Card inverted className="p-8 text-center">
              <Body className="text-on-dark-muted">No fan content found. Be the first to share!</Body>
            </Card>
          ) : (
          <Grid cols={3} gap={4} className="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredContent.map((item: FanContent) => (
              <Card key={item.id} inverted interactive className="cursor-pointer overflow-hidden" onClick={() => setSelectedContent(item)} onKeyDown={(e) => e.key === 'Enter' && setSelectedContent(item)} role="button" tabIndex={0} aria-label={`${item.title} by ${item.creator_name}, ${item.likes} likes`}>
                <Stack className="flex h-48 items-center justify-center bg-ink-900">
                  {getTypeIcon(item.type)}
                </Stack>
                <Stack className="p-4" gap={3}>
                  <Stack direction="horizontal" className="items-start justify-between">
                    <Body className="font-display text-white">{item.title}</Body>
                    {item.is_featured && <Badge variant="solid">Featured</Badge>}
                  </Stack>
                  <Label className="text-on-dark-muted">by {item.creator_name}</Label>
                  <Label size="xs" className="text-on-dark-disabled">{item.event_name || 'General'}</Label>
                  <Stack direction="horizontal" gap={4}>
                    <Label size="xs"><Heart className="size-3 inline mr-1" /> {item.likes}</Label>
                    <Label size="xs"><MessageCircle className="size-3 inline mr-1" /> {item.comments}</Label>
                  </Stack>
                  <Badge variant="outline">{item.status}</Badge>
                </Stack>
              </Card>
            ))}
          </Grid>
          )}

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
                  <Body className="font-display">{selectedContent.creator_name}</Body>
                  <Label className="text-on-light-muted">{selectedContent.event_name || 'General'}</Label>
                </Stack>
                <Label className="text-on-light-muted">{new Date(selectedContent.submitted_at).toLocaleDateString()}</Label>
              </Stack>
              <Stack direction="horizontal" gap={6}>
                <Label><Heart className="size-4 inline mr-1" /> {selectedContent.likes} likes</Label>
                <Label><MessageCircle className="size-4 inline mr-1" /> {selectedContent.comments} comments</Label>
              </Stack>
              <Badge variant="outline">{selectedContent.status}</Badge>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedContent(null)}>Close</Button>
          <Button variant="solid" onClick={() => selectedContent && likeContent(selectedContent.id)}>Like</Button>
          <Button variant="outline" onClick={() => selectedContent && shareContent(selectedContent.id)}>Share</Button>
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
          <Button variant="solid" onClick={() => setShowSubmitModal(false)} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : 'Submit'}</Button>
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
