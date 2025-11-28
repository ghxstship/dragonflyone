'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ConsumerNavigationPublic } from '@/components/navigation';
import {
  Container,
  Section,
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
  LoadingSpinner,
  Tabs,
  TabsList,
  Tab,
  StatCard,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
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
      video: { color: 'bg-error-500 text-white', icon: '🎬' },
      audio: { color: 'bg-purple-500 text-white', icon: '🎵' },
      photo_gallery: { color: 'bg-info-500 text-white', icon: '📸' },
      document: { color: 'bg-ink-500 text-white', icon: '📄' },
      behind_the_scenes: { color: 'bg-warning-500 text-white', icon: '🎭' },
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
      all: 'bg-success-500 text-white',
      attendees: 'bg-info-500 text-white',
      vip: 'bg-purple-500 text-white',
      members: 'bg-warning-500 text-white',
    };
    return <Badge className={variants[level] || ''}>{level}</Badge>;
  };

  const filteredContent = activeTab === 'all'
    ? content
    : content.filter(c => c.type === activeTab);

  if (loading) {
    return (
      <PageLayout
        background="black"
        header={<ConsumerNavigationPublic />}
        footer={
          <Footer
            logo={<Display size="md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES."
          >
            <FooterColumn title="Content">
              <FooterLink href="/content">Exclusive Content</FooterLink>
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
          <Container className="relative z-10 flex min-h-[60vh] items-center justify-center">
            <LoadingSpinner size="lg" text="Loading content..." />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  const totalViews = content.reduce((sum, c) => sum + c.views, 0);
  const newContent = content.filter(c => c.is_new).length;

  return (
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Content">
            <FooterLink href="/content">Exclusive Content</FooterLink>
            <FooterLink href="/events">Events</FooterLink>
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
              <Kicker colorScheme="on-dark">Media</Kicker>
              <H2 size="lg" className="text-white">Exclusive Content</H2>
              <Body className="text-on-dark-muted">Recordings, highlights, and behind-the-scenes from your events</Body>
            </Stack>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
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
                        {item.type === 'video' ? '🎬' : item.type === 'audio' ? '🎵' : '📸'}
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
                        ❤️ {item.likes}
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
                <Body className="text-ink-600">{selectedContent.description}</Body>
                <Stack direction="horizontal" gap={4} className="text-body-sm text-ink-500">
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
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
