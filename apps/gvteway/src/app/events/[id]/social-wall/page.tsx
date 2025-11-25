"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "@ghxstship/ui";

interface SocialPost {
  id: string;
  platform: "Twitter" | "Instagram" | "TikTok";
  author: string;
  handle: string;
  content: string;
  timestamp: string;
  likes: number;
  retweets?: number;
  hashtags: string[];
  mediaType?: "image" | "video";
  approved: boolean;
}

const mockPosts: SocialPost[] = [
  { id: "TW-001", platform: "Twitter", author: "Sarah M", handle: "@sarahm", content: "This concert is AMAZING! Best night ever! 🎵🔥", timestamp: "2 min ago", likes: 45, retweets: 12, hashtags: ["SummerFest2024", "LiveMusic"], approved: true },
  { id: "TW-002", platform: "Twitter", author: "Mike T", handle: "@miket", content: "The energy in this crowd is unreal! 🙌", timestamp: "5 min ago", likes: 89, retweets: 23, hashtags: ["SummerFest2024"], approved: true },
  { id: "IG-001", platform: "Instagram", author: "Emily C", handle: "@emilyc", content: "Front row vibes ✨ Living my best life!", timestamp: "8 min ago", likes: 234, hashtags: ["SummerFest2024", "FrontRow"], mediaType: "image", approved: true },
  { id: "TW-003", platform: "Twitter", author: "Alex R", handle: "@alexr", content: "That guitar solo just gave me chills! 🎸", timestamp: "10 min ago", likes: 67, retweets: 8, hashtags: ["SummerFest2024", "GuitarSolo"], approved: true },
  { id: "TK-001", platform: "TikTok", author: "Jordan K", handle: "@jordank", content: "POV: You're at the best festival of the year 🎪", timestamp: "12 min ago", likes: 1245, hashtags: ["SummerFest2024", "Festival"], mediaType: "video", approved: true },
  { id: "TW-004", platform: "Twitter", author: "Chris P", handle: "@chrisp", content: "The production quality is insane! Those lights! 💡", timestamp: "15 min ago", likes: 34, retweets: 5, hashtags: ["SummerFest2024", "Production"], approved: true },
];

export default function SocialWallPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;
  const [activeTab, setActiveTab] = useState("all");
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
      case "Twitter": return "🐦";
      case "Instagram": return "📸";
      case "TikTok": return "🎵";
      default: return "📱";
    }
  };

  const filteredPosts = activeTab === "all" ? posts : posts.filter(p => p.platform.toLowerCase() === activeTab);

  return (
    <UISection className="min-h-screen bg-black text-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack gap={2}>
              <H1>LIVE SOCIAL WALL</H1>
              <Body className="text-gray-400">Real-time social media feed from the event</Body>
            </Stack>
            <Stack direction="horizontal" gap={4} className="items-center">
              {isLive && <Badge variant="solid" className="bg-red-500 animate-pulse">● LIVE</Badge>}
              <Button variant={isLive ? "solid" : "outline"} onClick={() => setIsLive(!isLive)}>
                {isLive ? "Pause Feed" : "Resume Feed"}
              </Button>
            </Stack>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Posts" value={posts.length} className="border-2 border-gray-700 bg-gray-900" />
            <StatCard label="Twitter" value={posts.filter(p => p.platform === "Twitter").length} className="border-2 border-gray-700 bg-gray-900" />
            <StatCard label="Instagram" value={posts.filter(p => p.platform === "Instagram").length} className="border-2 border-gray-700 bg-gray-900" />
            <StatCard label="TikTok" value={posts.filter(p => p.platform === "TikTok").length} className="border-2 border-gray-700 bg-gray-900" />
          </Grid>

          <Card className="p-4 border-2 border-gray-700 bg-gray-900">
            <Stack direction="horizontal" className="justify-between items-center">
              <Label className="text-gray-400">Tracking: #SummerFest2024, #LiveMusic, @SummerFest</Label>
              <Button variant="outline" size="sm">Manage Hashtags</Button>
            </Stack>
          </Card>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
              <Tab active={activeTab === "twitter"} onClick={() => setActiveTab("twitter")}>Twitter</Tab>
              <Tab active={activeTab === "instagram"} onClick={() => setActiveTab("instagram")}>Instagram</Tab>
              <Tab active={activeTab === "tiktok"} onClick={() => setActiveTab("tiktok")}>TikTok</Tab>
            </TabsList>

            <TabPanel active={true}>
              <Grid cols={3} gap={4}>
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="border-2 border-gray-700 bg-gray-900 p-4 cursor-pointer hover:border-white transition-colors" onClick={() => setSelectedPost(post)}>
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack direction="horizontal" gap={2}>
                          <Card className="w-10 h-10 bg-gray-800 flex items-center justify-center rounded-full">
                            <Label>{getPlatformIcon(post.platform)}</Label>
                          </Card>
                          <Stack gap={0}>
                            <Label className="font-bold">{post.author}</Label>
                            <Label size="xs" className="text-gray-500">{post.handle}</Label>
                          </Stack>
                        </Stack>
                        <Label size="xs" className="text-gray-500">{post.timestamp}</Label>
                      </Stack>
                      {post.mediaType && (
                        <Card className="h-32 bg-gray-800 flex items-center justify-center">
                          <Label className="text-4xl">{post.mediaType === "video" ? "🎬" : "🖼️"}</Label>
                        </Card>
                      )}
                      <Body className="text-gray-200">{post.content}</Body>
                      <Stack direction="horizontal" gap={2} className="flex-wrap">
                        {post.hashtags.map(tag => <Badge key={tag} variant="outline">#{tag}</Badge>)}
                      </Stack>
                      <Stack direction="horizontal" gap={4}>
                        <Label size="xs" className="text-gray-500">❤️ {post.likes}</Label>
                        {post.retweets !== undefined && <Label size="xs" className="text-gray-500">🔄 {post.retweets}</Label>}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={2} gap={4}>
            <Button variant="outline" onClick={() => router.push(`/events/${eventId}`)}>Back to Event</Button>
            <Button variant="outline" onClick={() => router.push(`/events/${eventId}/photo-booth`)}>Photo Booth</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedPost} onClose={() => setSelectedPost(null)}>
        <ModalHeader><H3>Post Details</H3></ModalHeader>
        <ModalBody>
          {selectedPost && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={3}>
                <Card className="w-12 h-12 bg-gray-800 flex items-center justify-center rounded-full">
                  <Label className="text-2xl">{getPlatformIcon(selectedPost.platform)}</Label>
                </Card>
                <Stack gap={0}>
                  <Label className="font-bold">{selectedPost.author}</Label>
                  <Label className="text-gray-500">{selectedPost.handle}</Label>
                </Stack>
              </Stack>
              {selectedPost.mediaType && (
                <Card className="h-48 bg-gray-800 flex items-center justify-center">
                  <Label className="text-6xl">{selectedPost.mediaType === "video" ? "🎬" : "🖼️"}</Label>
                </Card>
              )}
              <Body>{selectedPost.content}</Body>
              <Stack direction="horizontal" gap={2} className="flex-wrap">
                {selectedPost.hashtags.map(tag => <Badge key={tag} variant="outline">#{tag}</Badge>)}
              </Stack>
              <Stack direction="horizontal" gap={6}>
                <Label>❤️ {selectedPost.likes} likes</Label>
                {selectedPost.retweets !== undefined && <Label>🔄 {selectedPost.retweets} retweets</Label>}
              </Stack>
              <Label className="text-gray-500">{selectedPost.timestamp}</Label>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPost(null)}>Close</Button>
          <Button variant="outline">Feature on Screen</Button>
          <Button variant="solid">Share</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
