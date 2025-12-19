'use client';

import { useState, Suspense } from 'react';
import { useTabState } from '@ghxstship/config/hooks';
import Image from 'next/image';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import { Camera, Twitter, Music, User, Play, Smartphone, Heart, Flame, Megaphone, Star, MessageCircle, RefreshCw } from 'lucide-react';
import {
  H2,
  H3,
  Body,
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
  StatCard,
  Tabs,
  TabsList,
  Tab,
  Form,
  Kicker,
} from '@ghxstship/ui';
import { useUGCData, type UGCPost } from '@/hooks/useUGC';

function UGCPageContent() {
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'feed',
    validTabs: ['feed', 'hashtags', 'campaigns', 'featured'],
  });
  const [selectedPost, setSelectedPost] = useState<UGCPost | null>(null);
  const [searchHashtag, setSearchHashtag] = useState('');
  const [filter, setFilter] = useState({
    platform: '',
    content_type: '',
    hashtag: '',
  });

  const {
    posts,
    hashtags,
    campaigns,
    isLoading: loading,
    error,
  } = useUGCData(filter.hashtag);

  const handleHashtagSearch = () => {
    if (searchHashtag.trim()) {
      setFilter({ ...filter, hashtag: searchHashtag.replace('#', '') });
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Camera className="size-4" />;
      case 'twitter': return <Twitter className="size-4" />;
      case 'tiktok': return <Music className="size-4" />;
      case 'facebook': return <User className="size-4" />;
      case 'youtube': return <Play className="size-4" />;
      default: return <Smartphone className="size-4" />;
    }
  };

  const getPlatformBadge = (platform: string) => {
    const variants: Record<string, string> = {
      instagram: 'bg-pink-500 text-white',
      twitter: 'bg-info-400 text-white',
      tiktok: 'bg-black text-white',
      facebook: 'bg-info-600 text-white',
      youtube: 'bg-error-600 text-white',
    };
    return <Badge className={variants[platform] || ''}><span className="mr-1">{getPlatformIcon(platform)}</span> {platform}</Badge>;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loading) {
    return <GvtewayLoadingLayout text="Loading content..." />;
  }

  const totalEngagement = posts.reduce((sum, p) => sum + p.likes + p.comments + p.shares, 0);
  const featuredPosts = posts.filter(p => p.is_featured);
  const trendingHashtags = hashtags.filter(h => h.trending);
  const activeCampaigns = campaigns.filter(c => c.status === 'active');

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Community</Kicker>
              <H2 size="lg" className="text-white">User Content</H2>
              <Body className="text-on-dark-muted">Fan photos, videos, and social posts from events</Body>
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
            icon={<Smartphone className="size-5" />}
          />
          <StatCard
            label="Total Engagement"
            value={formatNumber(totalEngagement)}
            icon={<Heart className="size-5" />}
          />
          <StatCard
            label="Trending Tags"
            value={trendingHashtags.length}
            icon={<Flame className="size-5" />}
          />
          <StatCard
            label="Active Campaigns"
            value={activeCampaigns.length}
            icon={<Megaphone className="size-5" />}
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
            <Tab active={isActive('feed')} onClick={() => setActiveTab('feed')}>
              Content Feed
            </Tab>
            <Tab active={isActive('hashtags')} onClick={() => setActiveTab('hashtags')}>
              Trending Hashtags
            </Tab>
            <Tab active={isActive('campaigns')} onClick={() => setActiveTab('campaigns')}>
              Campaigns
            </Tab>
            <Tab active={isActive('featured')} onClick={() => setActiveTab('featured')}>
              Featured
            </Tab>
          </TabsList>
        </Tabs>

        {isActive('feed') && (
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

            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
              {posts.length > 0 ? (
                posts.map(post => (
                  <Card
                    key={post.id}
                    className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setSelectedPost(post)}
                  >
                    <Stack className="relative aspect-square bg-ink-100">
                      {post.thumbnail_url || post.content_url ? (
                        <Image
                          src={post.thumbnail_url || post.content_url}
                          alt={post.caption || 'User content'}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <Stack className="w-full h-full flex items-center justify-center">
                          <Body className="text-h3-md">{getPlatformIcon(post.platform)}</Body>
                        </Stack>
                      )}
                      {post.content_type === 'video' || post.content_type === 'reel' && (
                        <Stack className="absolute inset-0 flex items-center justify-center">
                          <Play className="size-8 text-white drop-shadow-lg" />
                        </Stack>
                      )}
                      {post.is_featured && (
                        <Stack className="absolute top-2 left-2">
                          <Badge className="bg-warning-500 text-white"><Star className="size-3 inline mr-1" /> Featured</Badge>
                        </Stack>
                      )}
                      <Stack className="absolute top-2 right-2">
                        {getPlatformBadge(post.platform)}
                      </Stack>
                    </Stack>
                    <Stack className="p-3" gap={2}>
                      <Stack direction="horizontal" gap={2} className="items-center">
                        <Stack className="w-6 h-6 rounded-avatar bg-ink-200 overflow-hidden relative">
                          {post.author_avatar ? (
                            <Image src={post.author_avatar} alt={post.author_name} fill className="object-cover" />
                          ) : (
                            <Stack className="w-full h-full flex items-center justify-center text-mono-xs"><User className="size-4" /></Stack>
                          )}
                        </Stack>
                        <Body size="sm" className=" font-weight-bold truncate">{post.author_name}</Body>
                      </Stack>
                      {post.caption && (
                        <Body className="text-mono-xs text-ink-600 line-clamp-2">{post.caption}</Body>
                      )}
                      <Stack direction="horizontal" gap={3} className="text-mono-xs text-ink-500">
                        <Body><Heart className="size-3 inline mr-1" /> {formatNumber(post.likes)}</Body>
                        <Body><MessageCircle className="size-3 inline mr-1" /> {formatNumber(post.comments)}</Body>
                        <Body><RefreshCw className="size-3 inline mr-1" /> {formatNumber(post.shares)}</Body>
                      </Stack>
                    </Stack>
                  </Card>
                ))
              ) : (
                <Card className="col-span-4 p-12 text-center">
                  <H3 className="mb-4">NO CONTENT FOUND</H3>
                  <Body className="text-ink-600">
                    Share your event experience with our hashtags!
                  </Body>
                </Card>
              )}
            </Grid>
          </Stack>
        )}

        {isActive('hashtags') && (
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
                        <Badge className="bg-error-500 text-white"><Flame className="size-3 inline mr-1" /> Trending</Badge>
                      )}
                    </Stack>
                    <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                      <Stack>
                        <Body className="text-h5-md font-weight-bold">{formatNumber(hashtag.post_count)}</Body>
                        <Body className="text-mono-xs text-ink-500">Posts</Body>
                      </Stack>
                      <Stack>
                        <Body className="text-h5-md font-weight-bold">{formatNumber(hashtag.engagement)}</Body>
                        <Body className="text-mono-xs text-ink-500">Engagement</Body>
                      </Stack>
                    </Grid>
                  </Stack>
                </Card>
              ))
            ) : (
              <Card className="col-span-3 p-12 text-center">
                <H3 className="mb-4">NO HASHTAGS</H3>
                <Body className="text-ink-600">
                  Hashtag data will appear here
                </Body>
              </Card>
            )}
          </Grid>
        )}

        {isActive('campaigns') && (
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
                          'bg-ink-500 text-white'
                        }>
                          {campaign.status}
                        </Badge>
                      </Stack>
                      <Body className="text-h6-md font-weight-bold">#{campaign.hashtag}</Body>
                      {campaign.event_name && (
                        <Body size="sm" className=" text-ink-600">{campaign.event_name}</Body>
                      )}
                      <Body className="text-mono-xs text-ink-500">
                        {new Date(campaign.start_date).toLocaleDateString()}
                        {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString()}`}
                      </Body>
                    </Stack>
                    <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
                      <Stack className="text-center">
                        <Body className="text-h4-md font-weight-bold">{formatNumber(campaign.post_count)}</Body>
                        <Body className="text-mono-xs text-ink-500">Posts</Body>
                      </Stack>
                      <Stack className="text-center">
                        <Body className="text-h4-md font-weight-bold">{formatNumber(campaign.total_engagement)}</Body>
                        <Body className="text-mono-xs text-ink-500">Engagement</Body>
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
                <Body className="text-ink-600">
                  Hashtag campaigns will appear here
                </Body>
              </Card>
            )}
          </Stack>
        )}

        {isActive('featured') && (
          <Grid cols={3} gap={6} className="mt-6">
            {featuredPosts.length > 0 ? (
              featuredPosts.map(post => (
                <Card
                  key={post.id}
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedPost(post)}
                >
                  <Stack className="relative aspect-video bg-ink-100">
                    {post.thumbnail_url || post.content_url ? (
                      <Image
                        src={post.thumbnail_url || post.content_url}
                        alt={post.caption || 'Featured content'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Stack className="w-full h-full flex items-center justify-center">
                        <Body className="text-h3-md">{getPlatformIcon(post.platform)}</Body>
                      </Stack>
                    )}
                  </Stack>
                  <Stack className="p-4" gap={2}>
                    <Stack direction="horizontal" gap={2} className="items-center">
                      {getPlatformBadge(post.platform)}
                      <Badge className="bg-warning-500 text-white"><Star className="size-3 inline mr-1" /> Featured</Badge>
                    </Stack>
                    <Body className="font-weight-bold">{post.author_name}</Body>
                    {post.caption && (
                      <Body size="sm" className=" text-ink-600 line-clamp-2">{post.caption}</Body>
                    )}
                  </Stack>
                </Card>
              ))
            ) : (
              <Card className="col-span-3 p-12 text-center">
                <H3 className="mb-4">NO FEATURED CONTENT</H3>
                <Body className="text-ink-600">
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
              <Stack className="relative aspect-video bg-ink-100 rounded overflow-hidden">
                {selectedPost.thumbnail_url || selectedPost.content_url ? (
                  <Image
                    src={selectedPost.thumbnail_url || selectedPost.content_url}
                    alt={selectedPost.caption || 'User content'}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <Stack className="w-full h-full flex items-center justify-center">
                    <Body className="text-h1-sm">{getPlatformIcon(selectedPost.platform)}</Body>
                  </Stack>
                )}
              </Stack>
              <Stack gap={2}>
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Stack className="w-10 h-10 rounded-avatar bg-ink-200 overflow-hidden relative">
                    {selectedPost.author_avatar ? (
                      <Image src={selectedPost.author_avatar} alt={selectedPost.author_name} fill className="object-cover" />
                    ) : (
                      <Stack className="w-full h-full flex items-center justify-center"><User className="size-6" /></Stack>
                    )}
                  </Stack>
                  <Stack>
                    <Body className="font-weight-bold">{selectedPost.author_name}</Body>
                    <Body size="sm" className=" text-ink-500">@{selectedPost.author_handle}</Body>
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
                <Stack direction="horizontal" gap={6} className="text-ink-500">
                  <Body><Heart className="size-4 inline mr-1" /> {formatNumber(selectedPost.likes)}</Body>
                  <Body><MessageCircle className="size-4 inline mr-1" /> {formatNumber(selectedPost.comments)}</Body>
                  <Body><RefreshCw className="size-4 inline mr-1" /> {formatNumber(selectedPost.shares)}</Body>
                </Stack>
                {selectedPost.event_name && (
                  <Body size="sm" className=" text-ink-500">
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
    </GvtewayAppLayout>
  );
}

export default function UGCPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <UGCPageContent />
    </Suspense>
  );
}
