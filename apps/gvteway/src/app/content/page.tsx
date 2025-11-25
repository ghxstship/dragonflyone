'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Container,
  Section,
  Display,
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
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  StatCard,
} from '@ghxstship/ui';

interface ExclusiveContent {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'audio' | 'photo_gallery' | 'document' | 'behind_the_scenes';
  event_id: string;
  event_name: string;
  thumbnail_url?: string;
  duration?: string;
  file_count?: number;
  access_level: 'all' | 'attendees' | 'vip' | 'members';
  release_date: string;
  views: number;
  likes: number;
  is_new: boolean;
}

interface ContentCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export default function ExclusiveContentPage() {
  const router = useRouter();
  const [content, setContent] = useState<ExclusiveContent[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedContent, setSelectedContent] = useState<ExclusiveContent | null>(null);
  const [filter, setFilter] = useState({
    type: '',
    event_id: '',
    access_level: '',
  });
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.type) params.set('type', filter.type);
      if (filter.event_id) params.set('event_id', filter.event_id);
      if (filter.access_level) params.set('access_level', filter.access_level);

      const [contentRes, categoriesRes] = await Promise.all([
        fetch(`/api/content/exclusive?${params}`),
        fetch('/api/content/categories'),
      ]);

      if (contentRes.ok) {
        const data = await contentRes.json();
        setContent(data.content || []);
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
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

  const handleLike = async (contentId: string) => {
    try {
      await fetch(`/api/content/${contentId}/like`, { method: 'POST' });
      setContent(content.map(c =>
        c.id === contentId ? { ...c, likes: c.likes + 1 } : c
      ));
    } catch (err) {
      setError('Failed to like content');
    }
  };

  const getTypeBadge = (type: string) => {
    const variants: Record<string, { color: string; icon: string }> = {
      video: { color: 'bg-red-500 text-white', icon: '🎬' },
      audio: { color: 'bg-purple-500 text-white', icon: '🎵' },
      photo_gallery: { color: 'bg-blue-500 text-white', icon: '📸' },
      document: { color: 'bg-gray-500 text-white', icon: '📄' },
      behind_the_scenes: { color: 'bg-yellow-500 text-white', icon: '🎭' },
    };
    const variant = variants[type] || { color: '', icon: '📁' };
    return (
      <Badge className={variant.color}>
        {variant.icon} {type.replace('_', ' ')}
      </Badge>
    );
  };

  const getAccessBadge = (level: string) => {
    const variants: Record<string, string> = {
      all: 'bg-green-500 text-white',
      attendees: 'bg-blue-500 text-white',
      vip: 'bg-purple-500 text-white',
      members: 'bg-yellow-500 text-white',
    };
    return <Badge className={variants[level] || ''}>{level}</Badge>;
  };

  const filteredContent = activeTab === 'all'
    ? content
    : content.filter(c => c.type === activeTab);

  if (loading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    );
  }

  const totalViews = content.reduce((sum, c) => sum + c.views, 0);
  const newContent = content.filter(c => c.is_new).length;

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack>
              <Display>EXCLUSIVE CONTENT</Display>
              <Body className="mt-2 text-gray-600">
                Recordings, highlights, and behind-the-scenes from your events
              </Body>
            </Stack>
          </Stack>
        </Section>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Grid cols={4} gap={6} className="mb-8">
          <StatCard
            label="Total Content"
            value={content.length}
            icon={<Body>📚</Body>}
          />
          <StatCard
            label="New This Week"
            value={newContent}
            icon={<Body>✨</Body>}
          />
          <StatCard
            label="Total Views"
            value={totalViews.toLocaleString()}
            icon={<Body>👁️</Body>}
          />
          <StatCard
            label="Categories"
            value={categories.length}
            icon={<Body>📂</Body>}
          />
        </Grid>

        <Stack direction="horizontal" gap={4} className="mb-6 flex-wrap">
          <Field label="" className="w-48">
            <Select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="">All Types</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="photo_gallery">Photo Galleries</option>
              <option value="behind_the_scenes">Behind the Scenes</option>
            </Select>
          </Field>
          <Field label="" className="w-48">
            <Select
              value={filter.access_level}
              onChange={(e) => setFilter({ ...filter, access_level: e.target.value })}
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
            <Tab active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
              All Content
            </Tab>
            <Tab active={activeTab === 'video'} onClick={() => setActiveTab('video')}>
              Videos
            </Tab>
            <Tab active={activeTab === 'audio'} onClick={() => setActiveTab('audio')}>
              Audio
            </Tab>
            <Tab active={activeTab === 'photo_gallery'} onClick={() => setActiveTab('photo_gallery')}>
              Photos
            </Tab>
            <Tab active={activeTab === 'behind_the_scenes'} onClick={() => setActiveTab('behind_the_scenes')}>
              Behind the Scenes
            </Tab>
          </TabsList>
        </Tabs>

        <Grid cols={3} gap={6} className="mt-6">
          {filteredContent.length > 0 ? (
            filteredContent.map(item => (
              <Card
                key={item.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedContent(item)}
              >
                <Stack className="relative h-48 bg-gray-100">
                  {item.thumbnail_url ? (
                    <Image
                      src={item.thumbnail_url}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Stack className="w-full h-full flex items-center justify-center">
                      <Body className="text-4xl">
                        {item.type === 'video' ? '🎬' : item.type === 'audio' ? '🎵' : '📸'}
                      </Body>
                    </Stack>
                  )}
                  {item.is_new && (
                    <Stack className="absolute top-2 left-2">
                      <Badge className="bg-red-500 text-white">NEW</Badge>
                    </Stack>
                  )}
                  <Stack className="absolute top-2 right-2">
                    {getAccessBadge(item.access_level)}
                  </Stack>
                  {item.duration && (
                    <Stack className="absolute bottom-2 right-2">
                      <Badge className="bg-black text-white">{item.duration}</Badge>
                    </Stack>
                  )}
                </Stack>
                <Stack className="p-4" gap={2}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    {getTypeBadge(item.type)}
                  </Stack>
                  <H3 className="line-clamp-2">{item.title}</H3>
                  <Body className="text-sm text-gray-600 line-clamp-2">
                    {item.description}
                  </Body>
                  <Body className="text-xs text-gray-500">
                    {item.event_name}
                  </Body>
                  <Stack direction="horizontal" className="justify-between items-center mt-2">
                    <Body className="text-xs text-gray-500">
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
                        ❤️ {item.likes}
                      </Button>
                    </Stack>
                  </Stack>
                </Stack>
              </Card>
            ))
          ) : (
            <Card className="col-span-3 p-12 text-center">
              <H3 className="mb-4">NO CONTENT AVAILABLE</H3>
              <Body className="text-gray-600 mb-6">
                Exclusive content from your events will appear here
              </Body>
              <Button variant="solid" onClick={() => router.push('/events')}>
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
              <Stack className="relative aspect-video bg-gray-100 rounded overflow-hidden">
                {selectedContent.thumbnail_url ? (
                  <Image
                    src={selectedContent.thumbnail_url}
                    alt={selectedContent.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Stack className="w-full h-full flex items-center justify-center">
                    <Body className="text-6xl">
                      {selectedContent.type === 'video' ? '▶️' : selectedContent.type === 'audio' ? '🎵' : '📸'}
                    </Body>
                  </Stack>
                )}
                {selectedContent.type === 'video' && (
                  <Stack className="absolute inset-0 flex items-center justify-center">
                    <Button variant="solid" className="rounded-full w-16 h-16">
                      ▶️
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
                <Body className="text-gray-600">{selectedContent.description}</Body>
                <Stack direction="horizontal" gap={4} className="text-sm text-gray-500">
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
                    ❤️ Like ({selectedContent.likes})
                  </Button>
                  <Button variant="outline">
                    Share
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          )}
        </Modal>
      </Container>
    </Section>
  );
}
