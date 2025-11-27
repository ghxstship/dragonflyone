'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navigation } from '../../components/navigation';
import {
  Container,
  Section,
  H1,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  LoadingSpinner,
  StatCard,
  Tabs,
  TabsList,
  Tab,
  Form,
} from '@ghxstship/ui';

interface UGCPost {
  id: string;
  platform: 'instagram' | 'twitter' | 'tiktok' | 'facebook' | 'youtube';
  content_type: 'image' | 'video' | 'text' | 'story' | 'reel';
  content_url: string;
  thumbnail_url?: string;
  caption?: string;
  author_name: string;
  author_handle: string;
  author_avatar?: string;
  hashtags: string[];
  event_id?: string;
  event_name?: string;
  likes: number;
  comments: number;
  shares: number;
  is_featured: boolean;
  created_at: string;
}

interface Hashtag {
  tag: string;
  post_count: number;
  engagement: number;
  trending: boolean;
}

interface Campaign {
  id: string;
  name: string;
  hashtag: string;
  event_id?: string;
  event_name?: string;
  start_date: string;
  end_date?: string;
  post_count: number;
  total_engagement: number;
  status: 'active' | 'ended' | 'scheduled';
}

export default function UGCPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<UGCPost[]>([]);
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');
  const [selectedPost, setSelectedPost] = useState<UGCPost | null>(null);
  const [searchHashtag, setSearchHashtag] = useState('');
  const [filter, setFilter] = useState({
    platform: '',
    content_type: '',
    hashtag: '',
  });
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.platform) params.set('platform', filter.platform);
      if (filter.content_type) params.set('content_type', filter.content_type);
      if (filter.hashtag) params.set('hashtag', filter.hashtag);

      const [postsRes, hashtagsRes, campaignsRes] = await Promise.all([
        fetch(`/api/ugc/posts?${params}`),
        fetch('/api/ugc/hashtags'),
        fetch('/api/ugc/campaigns'),
      ]);

      if (postsRes.ok) {
        const data = await postsRes.json();
        setPosts(data.posts || []);
      }

      if (hashtagsRes.ok) {
        const data = await hashtagsRes.json();
        setHashtags(data.hashtags || []);
      }

      if (campaignsRes.ok) {
        const data = await campaignsRes.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleHashtagSearch = () => {
    if (searchHashtag.trim()) {
      setFilter({ ...filter, hashtag: searchHashtag.replace('#', '') });
    }
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      instagram: '📸',
      twitter: '🐦',
      tiktok: '🎵',
      facebook: '👤',
      youtube: '▶️',
    };
    return icons[platform] || '📱';
  };

  const getPlatformBadge = (platform: string) => {
    const variants: Record<string, string> = {
      instagram: 'bg-pink-500 text-white',
      twitter: 'bg-info-400 text-white',
      tiktok: 'bg-black text-white',
      facebook: 'bg-info-600 text-white',
      youtube: 'bg-error-600 text-white',
    };
    return <Badge className={variants[platform] || ''}>{getPlatformIcon(platform)} {platform}</Badge>;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading content..." />
        </Container>
      </Section>
    );
  }

  const totalEngagement = posts.reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0);
  const featuredPosts = posts.filter(p => p.is_featured);
  const trendingHashtags = hashtags.filter(h => h.trending);
  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack gap={2} className="border-b-2 border-black pb-8">
          <H1>User Content</H1>
          <Body className="text-grey-600">
            Fan photos, videos, and social posts from events
          </Body>
        </Stack>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid cols={4} gap={6} className="mb-8">
          <StatCard
            label="Total Posts"
            value={posts.length}
            icon={<Body>📱</Body>}
          />
          <StatCard
            label="Total Engagement"
            value={formatNumber(totalEngagement)}
            icon={<Body>❤️</Body>}
          />
          <StatCard
            label="Trending Tags"
            value={trendingHashtags.length}
            icon={<Body>🔥</Body>}
          />
          <StatCard
            label="Active Campaigns"
            value={activeCampaigns.length}
            icon={<Body>📢</Body>}
          />
        </Grid>

        <Stack className="mb-6">
        <Form onSubmit={handleHashtagSearch}>
          <Stack direction="horizontal" gap={4}>
            <Field label="" className="flex-1">
              <Input
                value={searchHashtag}
                onChange={(e) => setSearchHashtag(e.target.value)}
                placeholder="Search by hashtag..."
              />
            </Field>
            <Button type="submit" variant="solid">
              Search
            </Button>
            {filter.hashtag && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setFilter({ ...filter, hashtag: '' });
                  setSearchHashtag('');
                }}
              >
                Clear
              </Button>
            )}
          </Stack>
        </Form>
        </Stack>

        <Tabs>
          <TabsList>
            <Tab active={activeTab === 'feed'} onClick={() => setActiveTab('feed')}>
              Content Feed
            </Tab>
            <Tab active={activeTab === 'hashtags'} onClick={() => setActiveTab('hashtags')}>
              Trending Hashtags
            </Tab>
            <Tab active={activeTab === 'campaigns'} onClick={() => setActiveTab('campaigns')}>
              Campaigns
            </Tab>
            <Tab active={activeTab === 'featured'} onClick={() => setActiveTab('featured')}>
              Featured
            </Tab>
          </TabsList>
        </Tabs>

        {activeTab === 'feed' && (
          <Stack gap={6} className="mt-6">
            <Stack direction="horizontal" gap={4} className="flex-wrap">
              <Field label="" className="w-40">
                <Select
                  value={filter.platform}
                  onChange={(e) => setFilter({ ...filter, platform: e.target.value })}
                >
                  <option value="">All Platforms</option>
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                  <option value="tiktok">TikTok</option>
                  <option value="facebook">Facebook</option>
                  <option value="youtube">YouTube</option>
                </Select>
              </Field>
              <Field label="" className="w-40">
                <Select
                  value={filter.content_type}
                  onChange={(e) => setFilter({ ...filter, content_type: e.target.value })}
                >
                  <option value="">All Types</option>
                  <option value="image">Images</option>
                  <option value="video">Videos</option>
                  <option value="reel">Reels</option>
                  <option value="story">Stories</option>
                </Select>
              </Field>
            </Stack>

            <Grid cols={4} gap={4}>
              {posts.length > 0 ? (
                posts.map(post => (
                  <Card
                    key={post.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedPost(post)}
                  >
                    <Stack className="relative aspect-square bg-grey-100">
                      {post.thumbnail_url || post.content_url ? (
                        <Image
                          src={post.thumbnail_url || post.content_url}
                          alt={post.caption || 'User content'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Stack className="w-full h-full flex items-center justify-center">
                          <Body className="text-4xl">{getPlatformIcon(post.platform)}</Body>
                        </Stack>
                      )}
                      {post.content_type === 'video' || post.content_type === 'reel' && (
                        <Stack className="absolute inset-0 flex items-center justify-center">
                          <Body className="text-4xl text-white drop-shadow-lg">▶️</Body>
                        </Stack>
                      )}
                      {post.is_featured && (
                        <Stack className="absolute top-2 left-2">
                          <Badge className="bg-warning-500 text-white">⭐ Featured</Badge>
                        </Stack>
                      )}
                      <Stack className="absolute top-2 right-2">
                        {getPlatformBadge(post.platform)}
                      </Stack>
                    </Stack>
                    <Stack className="p-3" gap={2}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Stack className="w-6 h-6 rounded-full bg-grey-200 overflow-hidden relative">
                          {post.author_avatar ? (
                            <Image src={post.author_avatar} alt={post.author_name} fill className="object-cover" />
                          ) : (
                            <Stack className="w-full h-full flex items-center justify-center text-xs">👤</Stack>
                          )}
                        </Stack>
                        <Body className="text-sm font-bold truncate">{post.author_name}</Body>
                      </Stack>
                      {post.caption && (
                        <Body className="text-xs text-grey-600 line-clamp-2">{post.caption}</Body>
                      )}
                      <Stack direction="horizontal" gap={3} className="text-xs text-grey-500">
                        <Body>❤️ {formatNumber(post.likes)}</Body>
                        <Body>💬 {formatNumber(post.comments)}</Body>
                        <Body>🔄 {formatNumber(post.shares)}</Body>
                      </Stack>
                    </Stack>
                  </Card>
                ))
              ) : (
                <Card className="col-span-4 p-12 text-center">
                  <H3 className="mb-4">NO CONTENT FOUND</H3>
                  <Body className="text-grey-600">
                    Share your event experience with our hashtags!
                  </Body>
                </Card>
              )}
            </Grid>
          </Stack>
        )}

        {activeTab === 'hashtags' && (
          <Grid cols={3} gap={6} className="mt-6">
            {hashtags.length > 0 ? (
              hashtags.map(hashtag => (
                <Card
                  key={hashtag.tag}
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setFilter({ ...filter, hashtag: hashtag.tag })}
                >
                  <Stack gap={3}>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <H3>#{hashtag.tag}</H3>
                      {hashtag.trending && (
                        <Badge className="bg-error-500 text-white">🔥 Trending</Badge>
                      )}
                    </Stack>
                    <Grid cols={2} gap={4}>
                      <Stack>
                        <Body className="text-2xl font-bold">{formatNumber(hashtag.post_count)}</Body>
                        <Body className="text-xs text-grey-500">Posts</Body>
                      </Stack>
                      <Stack>
                        <Body className="text-2xl font-bold">{formatNumber(hashtag.engagement)}</Body>
                        <Body className="text-xs text-grey-500">Engagement</Body>
                      </Stack>
                    </Grid>
                  </Stack>
                </Card>
              ))
            ) : (
              <Card className="col-span-3 p-12 text-center">
                <H3 className="mb-4">NO HASHTAGS</H3>
                <Body className="text-grey-600">
                  Hashtag data will appear here
                </Body>
              </Card>
            )}
          </Grid>
        )}

        {activeTab === 'campaigns' && (
          <Stack gap={6} className="mt-6">
            {campaigns.length > 0 ? (
              campaigns.map(campaign => (
                <Card key={campaign.id} className="p-6">
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack gap={2}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <H3>{campaign.name}</H3>
                        <Badge className={
                          campaign.status === 'active' ? 'bg-success-500 text-white' :
                          campaign.status === 'scheduled' ? 'bg-info-500 text-white' :
                          'bg-grey-500 text-white'
                        }>
                          {campaign.status}
                        </Badge>
                      </Stack>
                      <Body className="text-xl font-bold">#{campaign.hashtag}</Body>
                      {campaign.event_name && (
                        <Body className="text-sm text-grey-600">{campaign.event_name}</Body>
                      )}
                      <Body className="text-xs text-grey-500">
                        {new Date(campaign.start_date).toLocaleDateString()}
                        {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString()}`}
                      </Body>
                    </Stack>
                    <Grid cols={2} gap={6}>
                      <Stack className="text-center">
                        <Body className="text-3xl font-bold">{formatNumber(campaign.post_count)}</Body>
                        <Body className="text-xs text-grey-500">Posts</Body>
                      </Stack>
                      <Stack className="text-center">
                        <Body className="text-3xl font-bold">{formatNumber(campaign.total_engagement)}</Body>
                        <Body className="text-xs text-grey-500">Engagement</Body>
                      </Stack>
                    </Grid>
                  </Stack>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setFilter({ ...filter, hashtag: campaign.hashtag })}
                  >
                    View Posts
                  </Button>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <H3 className="mb-4">NO CAMPAIGNS</H3>
                <Body className="text-grey-600">
                  Hashtag campaigns will appear here
                </Body>
              </Card>
            )}
          </Stack>
        )}

        {activeTab === 'featured' && (
          <Grid cols={3} gap={6} className="mt-6">
            {featuredPosts.length > 0 ? (
              featuredPosts.map(post => (
                <Card
                  key={post.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedPost(post)}
                >
                  <Stack className="relative aspect-video bg-grey-100">
                    {post.thumbnail_url || post.content_url ? (
                      <Image
                        src={post.thumbnail_url || post.content_url}
                        alt={post.caption || 'Featured content'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Stack className="w-full h-full flex items-center justify-center">
                        <Body className="text-4xl">{getPlatformIcon(post.platform)}</Body>
                      </Stack>
                    )}
                  </Stack>
                  <Stack className="p-4" gap={2}>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      {getPlatformBadge(post.platform)}
                      <Badge className="bg-warning-500 text-white">⭐ Featured</Badge>
                    </Stack>
                    <Body className="font-bold">{post.author_name}</Body>
                    {post.caption && (
                      <Body className="text-sm text-grey-600 line-clamp-2">{post.caption}</Body>
                    )}
                  </Stack>
                </Card>
              ))
            ) : (
              <Card className="col-span-3 p-12 text-center">
                <H3 className="mb-4">NO FEATURED CONTENT</H3>
                <Body className="text-grey-600">
                  Featured posts will appear here
                </Body>
              </Card>
            )}
          </Grid>
        )}

        <Modal
          open={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          title=""
        >
          {selectedPost && (
            <Stack gap={4}>
              <Stack className="relative aspect-video bg-grey-100 rounded overflow-hidden">
                {selectedPost.thumbnail_url || selectedPost.content_url ? (
                  <Image
                    src={selectedPost.thumbnail_url || selectedPost.content_url}
                    alt={selectedPost.caption || 'User content'}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <Stack className="w-full h-full flex items-center justify-center">
                    <Body className="text-6xl">{getPlatformIcon(selectedPost.platform)}</Body>
                  </Stack>
                )}
              </Stack>
              <Stack gap={2}>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Stack className="w-10 h-10 rounded-full bg-grey-200 overflow-hidden relative">
                    {selectedPost.author_avatar ? (
                      <Image src={selectedPost.author_avatar} alt={selectedPost.author_name} fill className="object-cover" />
                    ) : (
                      <Stack className="w-full h-full flex items-center justify-center">👤</Stack>
                    )}
                  </Stack>
                  <Stack>
                    <Body className="font-bold">{selectedPost.author_name}</Body>
                    <Body className="text-sm text-grey-500">@{selectedPost.author_handle}</Body>
                  </Stack>
                  {getPlatformBadge(selectedPost.platform)}
                </Stack>
                {selectedPost.caption && (
                  <Body>{selectedPost.caption}</Body>
                )}
                {selectedPost.hashtags.length > 0 && (
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {selectedPost.hashtags.map(tag => (
                      <Badge key={tag} variant="outline" className="cursor-pointer" onClick={() => {
                        setFilter({ ...filter, hashtag: tag });
                        setSelectedPost(null);
                      }}>
                        #{tag}
                      </Badge>
                    ))}
                  </Stack>
                )}
                <Stack direction="horizontal" gap={6} className="text-grey-500">
                  <Body>❤️ {formatNumber(selectedPost.likes)}</Body>
                  <Body>💬 {formatNumber(selectedPost.comments)}</Body>
                  <Body>🔄 {formatNumber(selectedPost.shares)}</Body>
                </Stack>
                {selectedPost.event_name && (
                  <Body className="text-sm text-grey-500">
                    Event: {selectedPost.event_name}
                  </Body>
                )}
              </Stack>
              <Stack direction="horizontal" gap={4}>
                <Button variant="solid">
                  View on {selectedPost.platform}
                </Button>
                <Button variant="outline">
                  Share
                </Button>
              </Stack>
            </Stack>
          )}
        </Modal>
        </Stack>
      </Container>
    </Section>
  );
}
