"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { Twitter, Camera, Music, Smartphone, Video, ImageIcon, Heart, RefreshCw } from "lucide-react";
import { GvtewayAppLayout } from "@/components/app-layout";
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_SOCIAL_POSTS,
  type DemoSocialPost as SocialPost,
} from "@/lib/demo-data";

const mockPosts = DEMO_SOCIAL_POSTS;

function SocialWallPageContent() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'all',
    validTabs: ['all', 'twitter', 'instagram', 'tiktok'],
  });
  const [posts, setPosts] = useState(mockPosts);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [isLive, setIsLive] = useState(true);

  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      const newPost: SocialPost = {
        id: `TW-${Date.now()}`,
        platform: "Twitter",
        author: ["Fan", "Attendee", "Guest"][Math.floor(Math.random() * 3)],
        handle: `@user${Math.floor(Math.random() * 1000)}`,
        content: ["What an incredible show!", "Best night of my life!", "This is amazing!", "The vibes are immaculate!"][Math.floor(Math.random() * 4)],
        timestamp: "Just now",
        likes: Math.floor(Math.random() * 50),
        retweets: Math.floor(Math.random() * 10),
        hashtags: ["SummerFest2024"],
        approved: true,
      };
      setPosts(prev => [newPost, ...prev.slice(0, 19)]);
    }, 8000);
    return () => clearInterval(interval);
  }, [isLive]);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Twitter": return <Twitter className="size-5" />;
      case "Instagram": return <Camera className="size-5" />;
      case "TikTok": return <Music className="size-5" />;
      default: return <Smartphone className="size-5" />;
    }
  };

  const filteredPosts = activeTab === "all" ? posts : posts.filter(p => p.platform.toLowerCase() === activeTab);

  return (
    <GvtewayAppLayout>
          <Stack gap={8}>
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Live Feed</Kicker>
              <H2 size="lg" className="text-white">Social Wall</H2>
              <Body className="text-on-dark-muted">Real-time social media feed from the event</Body>
            </Stack>
            <Stack direction="horizontal" className="items-center justify-between">
            <Stack direction="horizontal" gap={4} className="items-center">
              {isLive && <Badge variant="solid" className="bg-error-500 animate-pulse">LIVE</Badge>}
              <Button variant={isLive ? "solid" : "outline"} onClick={() => setIsLive(!isLive)}>
                {isLive ? "Pause Feed" : "Resume Feed"}
              </Button>
            </Stack>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Posts" value={posts.length} className="border-2 border-ink-700 bg-ink-900" />
            <StatCard label="Twitter" value={posts.filter(p => p.platform === "Twitter").length} className="border-2 border-ink-700 bg-ink-900" />
            <StatCard label="Instagram" value={posts.filter(p => p.platform === "Instagram").length} className="border-2 border-ink-700 bg-ink-900" />
            <StatCard label="TikTok" value={posts.filter(p => p.platform === "TikTok").length} className="border-2 border-ink-700 bg-ink-900" />
          </Grid>

          <Card className="p-4 border-2 border-ink-700 bg-ink-900">
            <Stack direction="horizontal" className="justify-between items-center">
              <Label className="text-ink-400">Tracking: #SummerFest2024, #LiveMusic, @SummerFest</Label>
              <Button variant="outline" size="sm">Manage Hashtags</Button>
            </Stack>
          </Card>

          <Tabs>
            <TabsList>
              <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
              <Tab active={isActive('twitter')} onClick={() => setActiveTab('twitter')}>Twitter</Tab>
              <Tab active={isActive('instagram')} onClick={() => setActiveTab('instagram')}>Instagram</Tab>
              <Tab active={isActive('tiktok')} onClick={() => setActiveTab('tiktok')}>TikTok</Tab>
            </TabsList>

            <TabPanel active={true}>
              <Grid cols={3} gap={4}>
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="border-2 border-ink-700 bg-ink-900 p-4 cursor-pointer hover:border-white transition-colors" onClick={() => setSelectedPost(post)}>
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack direction="horizontal" gap={2}>
                          <Card className="w-10 h-10 bg-ink-800 flex items-center justify-center rounded-avatar">
                            {getPlatformIcon(post.platform)}
                          </Card>
                          <Stack gap={0}>
                            <Label className="font-weight-bold">{post.author}</Label>
                            <Label size="xs" className="text-ink-500">{post.handle}</Label>
                          </Stack>
                        </Stack>
                        <Label size="xs" className="text-ink-500">{post.timestamp}</Label>
                      </Stack>
                      {post.mediaType && (
                        <Card className="h-32 bg-ink-800 flex items-center justify-center">
                          {post.mediaType === "video" ? <Video className="size-8" /> : <ImageIcon className="size-8" />}
                        </Card>
                      )}
                      <Body className="text-ink-200">{post.content}</Body>
                      <Stack direction="horizontal" gap={2} className="flex-wrap">
                        {post.hashtags.map(tag => <Badge key={tag} variant="outline">#{tag}</Badge>)}
                      </Stack>
                      <Stack direction="horizontal" gap={4}>
                        <Label size="xs" className="text-ink-500"><Heart className="size-3 inline mr-1" /> {post.likes}</Label>
                        {post.retweets !== undefined && <Label size="xs" className="text-ink-500"><RefreshCw className="size-3 inline mr-1" /> {post.retweets}</Label>}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={2} gap={4}>
            <Button variant="outlineInk" onClick={() => router.push(`/events/${eventId}`)}>Back to Event</Button>
            <Button variant="outlineInk" onClick={() => router.push(`/events/${eventId}/photo-booth`)}>Photo Booth</Button>
          </Grid>
          </Stack>

      <Modal open={!!selectedPost} onClose={() => setSelectedPost(null)}>
        <ModalHeader><H3>Post Details</H3></ModalHeader>
        <ModalBody>
          {selectedPost && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={3}>
                <Card className="size-12 bg-ink-800 flex items-center justify-center rounded-avatar">
                  {getPlatformIcon(selectedPost.platform)}
                </Card>
                <Stack gap={0}>
                  <Label className="font-weight-bold">{selectedPost.author}</Label>
                  <Label className="text-on-dark-muted">{selectedPost.handle}</Label>
                </Stack>
              </Stack>
              {selectedPost.mediaType && (
                <Card className="h-48 bg-ink-800 flex items-center justify-center">
                  {selectedPost.mediaType === "video" ? <Video className="size-12" /> : <ImageIcon className="size-12" />}
                </Card>
              )}
              <Body>{selectedPost.content}</Body>
              <Stack direction="horizontal" gap={2} className="flex-wrap">
                {selectedPost.hashtags.map(tag => <Badge key={tag} variant="outline">#{tag}</Badge>)}
              </Stack>
              <Stack direction="horizontal" gap={6}>
                <Label><Heart className="size-4 inline mr-1" /> {selectedPost.likes} likes</Label>
                {selectedPost.retweets !== undefined && <Label><RefreshCw className="size-4 inline mr-1" /> {selectedPost.retweets} retweets</Label>}
              </Stack>
              <Label className="text-on-dark-muted">{selectedPost.timestamp}</Label>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPost(null)}>Close</Button>
          <Button variant="outline">Feature on Screen</Button>
          <Button variant="solid">Share</Button>
        </ModalFooter>
      </Modal>
    </GvtewayAppLayout>
  );
}

export default function SocialWallPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <SocialWallPageContent />
    </Suspense>
  );
}
