'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Section, Display, H2, H3, Body, Button, Card, Grid, Badge, Stack, useNotifications } from '@ghxstship/ui';
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
    <Section className="min-h-screen bg-white py-12">
      <Container>
        <Display className="mb-8">SOCIAL FEED</Display>

        <Grid cols={3} gap={6} className="mb-8">
          <Card className="col-span-2">
            <Stack gap={0}>
              <Card className="p-6 border-b-2 border-grey-200 rounded-none">
                <H2>COMMUNITY FEED</H2>
              </Card>
              
              <Stack gap={0}>
                {posts.map((post) => (
                  <Card key={post.id} className="p-6 border-b border-grey-200 rounded-none">
                    <Stack gap={4}>
                      <Stack gap={4} direction="horizontal" className="items-start">
                        <Card className="w-12 h-12 bg-grey-300 rounded-full flex-shrink-0" />
                        <Stack gap={1} className="flex-1">
                          <Body className="font-bold">{post.user}</Body>
                          <Body className="text-sm text-grey-600">{post.timestamp}</Body>
                        </Stack>
                      </Stack>
                      
                      <Body>{post.content}</Body>
                      
                      {post.image && (
                        <Card className="w-full h-64 bg-grey-200 flex items-center justify-center">
                          <ImageIcon className="w-12 h-12 text-grey-400" />
                        </Card>
                      )}
                      
                      <Stack direction="horizontal" gap={6} className="text-sm text-grey-600">
                        <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}>
                          <ThumbsUp className={`w-4 h-4 mr-2 ${likedPosts.includes(post.id) ? 'fill-black' : ''}`} />
                          {post.likes + (likedPosts.includes(post.id) ? 1 : 0)}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleComment(post.id)}>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          {post.comments}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleShare(post.id)}>
                          <Share2 className="w-4 h-4 mr-2" />
                          {post.shares}
                        </Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          </Card>

          <Stack gap={6}>
            <Card className="p-6">
              <Stack gap={4}>
                <H2>TRENDING TAGS</H2>
                <Stack gap={3}>
                  {trending.map((item, idx) => (
                    <Stack key={idx} gap={2} direction="horizontal" className="justify-between items-center">
                      <Stack gap={2} direction="horizontal" className="items-center">
                        <TrendingUp className="w-4 h-4 text-grey-600" />
                        <Body className="font-bold">{item.tag}</Body>
                      </Stack>
                      <Body className="text-sm text-grey-600">{item.posts.toLocaleString()} posts</Body>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </Card>

            <Card className="p-6">
              <Stack gap={4}>
                <H2>SUGGESTED GROUPS</H2>
                <Stack gap={4}>
                  {[
                    { name: 'Miami EDM Crew', members: 2345 },
                    { name: 'Festival Veterans', members: 1876 },
                  ].map((group, idx) => (
                    <Card key={idx} className="pb-4 border-b border-grey-200 last:border-0 last:pb-0 rounded-none">
                      <Stack gap={2}>
                        <H3>{group.name}</H3>
                        <Stack gap={2} direction="horizontal" className="justify-between items-center">
                          <Stack gap={2} direction="horizontal" className="items-center text-sm text-grey-600">
                            <Users className="w-4 h-4" />
                            <Body className="text-sm">{group.members.toLocaleString()} members</Body>
                          </Stack>
                          <Button variant="outline" size="sm" onClick={() => router.push(`/community/groups/${idx}`)}>JOIN</Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Stack>
              </Stack>
            </Card>

            <Card className="p-6 bg-black text-white text-center">
              <Stack gap={4} className="items-center">
                <Share2 className="w-12 h-12" />
                <H3>SHARE YOUR STORY</H3>
                <Body className="text-grey-400">
                  Connect with fans and share your festival experiences
                </Body>
                <Button className="w-full" onClick={() => router.push('/social/new')}>CREATE POST</Button>
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Container>
    </Section>
  );
}
