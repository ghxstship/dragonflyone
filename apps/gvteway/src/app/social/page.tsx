'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ConsumerNavigationPublic } from '@/components/navigation';
import { Container, Section, H2, H3, Body, Button, Card, Grid, Stack, useNotifications, PageLayout, Footer, FooterColumn, FooterLink, Display, Kicker, Label } from '@ghxstship/ui';
import { Share2, ThumbsUp, MessageCircle, Users, TrendingUp, Image as ImageIcon } from 'lucide-react';

export default function SocialPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [likedPosts, setLikedPosts] = useState<string[]>([]);

  const handleLike = (postId: string) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter(id => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
      addNotification({ type: 'success', title: 'Liked!', message: 'Post added to your likes' });
    }
  };

  const handleComment = (postId: string) => {
    router.push(`/social/post/${postId}#comments`);
  };

  const handleShare = (postId: string) => {
    navigator.share?.({ title: 'Check out this post', url: `/social/post/${postId}` }) || 
      addNotification({ type: 'info', title: 'Link Copied', message: 'Post link copied to clipboard' });
  };

  const posts = [
    {
      id: '1',
      user: 'Sarah Johnson',
      content: 'Can\'t wait for Ultra 2025! Who else is going?',
      likes: 234,
      comments: 45,
      shares: 12,
      timestamp: '2 hours ago',
      image: true,
    },
    {
      id: '2',
      user: 'Mike Peters',
      content: 'Best lineup announcement ever! Already got my tickets 🎉',
      likes: 189,
      comments: 32,
      shares: 8,
      timestamp: '5 hours ago',
      image: false,
    },
  ];

  const trending = [
    { tag: '#Ultra2025', posts: 12400 },
    { tag: '#EDMFamily', posts: 8900 },
    { tag: '#FestivalSeason', posts: 6700 },
  ];

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Community">
            <FooterLink href="/social">Social Feed</FooterLink>
            <FooterLink href="/community">Community</FooterLink>
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
              <Kicker colorScheme="on-dark">Community</Kicker>
              <H2 size="lg" className="text-white">Social Feed</H2>
              <Body className="text-on-dark-muted">Connect with the community</Body>
            </Stack>

            <Grid cols={3} gap={6}>
              {/* Main Feed */}
              <Card inverted variant="elevated" className="col-span-2 p-0">
                <Stack gap={0}>
                  <Stack className="border-b-2 border-ink-800 p-6">
                    <H2 className="text-white">COMMUNITY FEED</H2>
                  </Stack>
                  
                  <Stack gap={0}>
                    {posts.map((post) => (
                      <Card key={post.id} inverted className="border-b border-ink-800 p-6">
                        <Stack gap={4}>
                          <Stack gap={4} direction="horizontal" className="items-start">
                            <Stack className="size-12 shrink-0 rounded-avatar bg-ink-700" />
                            <Stack gap={1} className="flex-1">
                              <Body className="font-display text-white">{post.user}</Body>
                              <Label size="xs" className="text-on-dark-muted">{post.timestamp}</Label>
                            </Stack>
                          </Stack>
                          
                          <Body className="text-white">{post.content}</Body>
                          
                          {post.image && (
                            <Card inverted className="flex h-64 w-full items-center justify-center bg-ink-800">
                              <ImageIcon className="size-12 text-on-dark-muted" />
                            </Card>
                          )}
                          
                          <Stack direction="horizontal" gap={6}>
                            <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                              <ThumbsUp className={`mr-2 size-4 ${likedPosts.includes(post.id) ? 'fill-white' : ''}`} />
                              {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleComment(post.id)}>
                              <MessageCircle className="mr-2 size-4" />
                              {post.comments}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleShare(post.id)}>
                              <Share2 className="mr-2 size-4" />
                              {post.shares}
                            </Button>
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                  </Stack>
                </Stack>
              </Card>

              {/* Sidebar */}
              <Stack gap={6}>
                <Card inverted className="p-6">
                  <Stack gap={4}>
                    <H3 className="text-white">TRENDING TAGS</H3>
                    <Stack gap={3}>
                      {trending.map((item, idx) => (
                        <Stack key={idx} gap={2} direction="horizontal" className="items-center justify-between">
                          <Stack gap={2} direction="horizontal" className="items-center">
                            <TrendingUp className="size-4 text-on-dark-muted" />
                            <Body className="font-display text-white">{item.tag}</Body>
                          </Stack>
                          <Label size="xs" className="text-on-dark-muted">{item.posts.toLocaleString()} posts</Label>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Card>

                <Card inverted className="p-6">
                  <Stack gap={4}>
                    <H3 className="text-white">SUGGESTED GROUPS</H3>
                    <Stack gap={4}>
                      {[
                        { name: 'Miami EDM Crew', members: 2345 },
                        { name: 'Festival Veterans', members: 1876 },
                      ].map((group, idx) => (
                        <Stack key={idx} gap={2} className="border-b border-ink-800 pb-4 last:border-0 last:pb-0">
                          <Body className="font-display text-white">{group.name}</Body>
                          <Stack gap={2} direction="horizontal" className="items-center justify-between">
                            <Stack gap={2} direction="horizontal" className="items-center">
                              <Users className="size-4 text-on-dark-muted" />
                              <Label size="xs" className="text-on-dark-muted">{group.members.toLocaleString()} members</Label>
                            </Stack>
                            <Button variant="outlineInk" size="sm" onClick={() => router.push(`/community/groups/${idx}`)}>JOIN</Button>
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Card>

                <Card inverted variant="elevated" className="p-6 text-center">
                  <Stack gap={4} className="items-center">
                    <Share2 className="size-12 text-on-dark-muted" />
                    <H3 className="text-white">SHARE YOUR STORY</H3>
                    <Body className="text-on-dark-muted">
                      Connect with fans and share your festival experiences
                    </Body>
                    <Button variant="solid" inverted fullWidth onClick={() => router.push('/social/new')}>CREATE POST</Button>
                  </Stack>
                </Card>
              </Stack>
            </Grid>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
