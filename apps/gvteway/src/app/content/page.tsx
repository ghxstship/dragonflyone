'use client';

import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useTabState } from '@ghxstship/config/hooks';
import Image from 'next/image';
import { Video, Music, Camera, FileText, Theater, Folder, Heart, Play } from 'lucide-react';
import { GvtewayAppLayout, GvtewayLoadingLayout } from '@/components/app-layout';
import {
  H2,
  H3,
  Body,
  Button,
  Card,
  Field,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  Tabs,
  TabsList,
  Tab,
  StatCard,
  Kicker,
} from '@ghxstship/ui';
import { useContentData, type ExclusiveContent } from '@/hooks/useContent';

function ExclusiveContentPageContent() {
  const router = useRouter();
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'all',
    validTabs: ['all', 'video', 'audio', 'photo_gallery', 'behind_the_scenes'],
  });
  const [selectedContent, setSelectedContent] = useState<ExclusiveContent | null>(null);
  const [filter, setFilter] = useState({
    type: '',
    event_id: '',
    access_level: '',
  });
  const [localError, setLocalError] = useState<string | null>(null);

  const {
    content,
    categories,
    isLoading: loading,
    error,
    likeContent,
  } = useContentData(filter);

  const handleLike = async (contentId: string) => {
    try {
      await likeContent(contentId);
    } catch {
      setLocalError('Failed to like content');
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { color: string; icon: React.ReactNode }> = {
      video: { color: 'bg-success-100 text-success-800', icon: <Video className="size-3 inline mr-1" /> },
      audio: { color: 'bg-violet-500 text-white', icon: <Music className="size-3 inline mr-1" /> },
      photo_gallery: { color: 'bg-info-500 text-white', icon: <Camera className="size-3 inline mr-1" /> },
      document: { color: 'bg-ink-500 text-white', icon: <FileText className="size-3 inline mr-1" /> },
      behind_the_scenes: { color: 'bg-warning-500 text-white', icon: <Theater className="size-3 inline mr-1" /> },
    };
    const variant = variants[type] || { color: '', icon: <Folder className="size-3 inline mr-1" /> };
    return (
      <Badge className={variant.color}>
        {variant.icon}{type.replace('_', ' ')}
      </Badge>
    );
  };

  const getAccessBadge = (level: string) => {
    const variants: Record<string, string> = {
      all: 'bg-success-500 text-white',
      attendees: 'bg-info-500 text-white',
      vip: 'bg-violet-500 text-white',
      members: 'bg-warning-500 text-white',
    };
    return <Badge className={variants[level] || ''}>{level}</Badge>;
  };

  const filteredContent = activeTab === 'all'
    ? content
    : content.filter(c => c.type === activeTab);

  if (loading) {
    return <GvtewayLoadingLayout text="Loading content..." />;
  }

  const totalViews = content.reduce((sum, c) => sum + c.views, 0);
  const newContent = content.filter(c => c.is_new).length;

  return (
    <GvtewayAppLayout>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Media</Kicker>
              <H2 size="lg" className="text-white">Exclusive Content</H2>
              <Body className="text-on-dark-muted">Recordings, highlights, and behind-the-scenes from your events</Body>
            </Stack>

        {(error || localError) && (
          <Alert variant="error" className="mb-6" onClose={() => setLocalError(null)}>
            {error instanceof Error ? error.message : localError || String(error)}
          </Alert>
        )}

        <Grid cols={4} gap={6}>
          <StatCard
            label="Total Content"
            value={content.length.toString()}
            inverted
          />
          <StatCard
            label="New This Week"
            value={newContent.toString()}
            inverted
          />
          <StatCard
            label="Total Views"
            value={totalViews.toLocaleString()}
            inverted
          />
          <StatCard
            label="Categories"
            value={categories.length.toString()}
            inverted
          />
        </Grid>

        <Stack direction="horizontal" gap={4} className="flex-wrap">
          <Field label="" className="w-48" inverted>
            <Select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              inverted
            >
              <option value="">All Types</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="photo_gallery">Photo Galleries</option>
              <option value="behind_the_scenes">Behind the Scenes</option>
            </Select>
          </Field>
          <Field label="" className="w-48" inverted>
            <Select
              value={filter.access_level}
              onChange={(e) => setFilter({ ...filter, access_level: e.target.value })}
              inverted
            >
              <option value="">All Access Levels</option>
              <option value="all">Public</option>
              <option value="attendees">Attendees Only</option>
              <option value="vip">VIP Only</option>
              <option value="members">Members Only</option>
            </Select>
          </Field>
        </Stack>

        <Tabs>
          <TabsList>
            <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>
              All Content
            </Tab>
            <Tab active={isActive('video')} onClick={() => setActiveTab('video')}>
              Videos
            </Tab>
            <Tab active={isActive('audio')} onClick={() => setActiveTab('audio')}>
              Audio
            </Tab>
            <Tab active={isActive('photo_gallery')} onClick={() => setActiveTab('photo_gallery')}>
              Photos
            </Tab>
            <Tab active={isActive('behind_the_scenes')} onClick={() => setActiveTab('behind_the_scenes')}>
              Behind the Scenes
            </Tab>
          </TabsList>
        </Tabs>

        <Grid cols={3} gap={6} className="mt-6">
          {filteredContent.length > 0 ? (
            filteredContent.map(item => (
              <Card
                key={item.id}
                inverted
                interactive
                className="cursor-pointer overflow-hidden"
                onClick={() => setSelectedContent(item)}
              >
                <Stack className="relative h-48 bg-ink-900">
                  {item.thumbnail_url ? (
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Stack className="flex size-full items-center justify-center">
                      <Body className="text-h3-md">
                        {item.type === 'video' ? <Video className="size-8" /> : item.type === 'audio' ? <Music className="size-8" /> : <Camera className="size-8" />}
                      </Body>
                    </Stack>
                  )}
                  {item.is_new && (
                    <Stack className="absolute left-2 top-2">
                      <Badge variant="solid">NEW</Badge>
                    </Stack>
                  )}
                  <Stack className="absolute right-2 top-2">
                    {getAccessBadge(item.access_level)}
                  </Stack>
                  {item.duration && (
                    <Stack className="absolute bottom-2 right-2">
                      <Badge variant="solid">{item.duration}</Badge>
                    </Stack>
                  )}
                </Stack>
                <Stack className="p-4" gap={2}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    {getTypeBadge(item.type)}
                  </Stack>
                  <H3 className="line-clamp-2 text-white">{item.title}</H3>
                  <Body size="sm" className="line-clamp-2 text-on-dark-muted">
                    {item.description}
                  </Body>
                  <Body size="sm" className="font-mono text-on-dark-disabled">
                    {item.event_name}
                  </Body>
                  <Stack direction="horizontal" className="mt-2 items-center justify-between">
                    <Body size="sm" className="font-mono text-on-dark-disabled">
                      {item.views.toLocaleString()} views
                    </Body>
                    <Stack direction="horizontal" gap={2}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(item.id);
                        }}
                      >
                        <Heart className="size-4 inline mr-1" /> {item.likes}
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))
          ) : (
            <Card inverted className="col-span-3 p-12 text-center">
              <H3 className="mb-4 text-white">No Content Available</H3>
              <Body className="mb-6 text-on-dark-muted">
                Exclusive content from your events will appear here
              </Body>
              <Button variant="solid" inverted onClick={() => router.push('/events')}>
                Browse Events
              </Button>
            </Card>
          )}
        </Grid>

        <Modal
          open={!!selectedContent}
          onClose={() => setSelectedContent(null)}
          title=""
        >
          {selectedContent && (
            <Stack gap={4}>
              <Stack className="relative aspect-video bg-ink-100 rounded overflow-hidden">
                {selectedContent.thumbnail_url ? (
                  <Image
                    src={selectedContent.thumbnail_url}
                    alt={selectedContent.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Stack className="w-full h-full flex items-center justify-center">
                    <Body className="text-h1-sm">
                      {selectedContent.type === 'video' ? <Play className="size-12" /> : selectedContent.type === 'audio' ? <Music className="size-12" /> : <Camera className="size-12" />}
                    </Body>
                  </Stack>
                )}
                {selectedContent.type === 'video' && (
                  <Stack className="absolute inset-0 flex items-center justify-center">
                    <Button variant="solid" className="rounded-avatar w-16 h-16">
                      <Play className="size-6" />
                    </Button>
                  </Stack>
                )}
              </Stack>
              <Stack gap={2}>
                <Stack direction="horizontal" gap={2}>
                  {getTypeBadge(selectedContent.type)}
                  {getAccessBadge(selectedContent.access_level)}
                </Stack>
                <H2>{selectedContent.title}</H2>
                <Body className="text-ink-600">{selectedContent.description}</Body>
                <Stack direction="horizontal" gap={4} size="sm" className=" text-ink-500">
                  <Body>{selectedContent.event_name}</Body>
                  <Body>{new Date(selectedContent.release_date).toLocaleDateString()}</Body>
                  {selectedContent.duration && <Body>{selectedContent.duration}</Body>}
                </Stack>
                <Stack direction="horizontal" gap={4} className="mt-4">
                  <Button variant="solid">
                    {selectedContent.type === 'video' ? 'Watch Now' :
                     selectedContent.type === 'audio' ? 'Listen Now' : 'View Gallery'}
                  </Button>
                  <Button variant="outline" onClick={() => handleLike(selectedContent.id)}>
                    <Heart className="size-4 inline mr-1" /> Like ({selectedContent.likes})
                  </Button>
                  <Button variant="outline">
                    Share
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          )}
        </Modal>
          </Stack>
    </GvtewayAppLayout>
  );
}

export default function ExclusiveContentPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <ExclusiveContentPageContent />
    </Suspense>
  );
}
