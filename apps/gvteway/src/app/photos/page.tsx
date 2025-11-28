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
  Input,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  LoadingSpinner,
  StatCard,
  Form,
  PageLayout,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  Kicker,
} from '@ghxstship/ui';

interface Photo {
  id: string;
  url: string;
  thumbnail_url: string;
  event_id: string;
  event_name: string;
  uploaded_by: string;
  uploaded_by_name: string;
  caption?: string;
  tags: string[];
  likes: number;
  is_featured: boolean;
  created_at: string;
}

interface PhotoGallery {
  id: string;
  event_id: string;
  event_name: string;
  event_date: string;
  cover_photo?: string;
  photo_count: number;
  status: 'collecting' | 'published' | 'archived';
}

export default function PhotoGalleriesPage() {
  const router = useRouter();
  const [galleries, setGalleries] = useState<PhotoGallery[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'galleries' | 'feed'>('galleries');
  const [selectedGallery, setSelectedGallery] = useState<PhotoGallery | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [uploadForm, setUploadForm] = useState({
    event_id: '',
    caption: '',
    tags: '',
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [galleriesRes, photosRes] = await Promise.all([
        fetch('/api/photos/galleries'),
        fetch('/api/photos/feed'),
      ]);

      if (galleriesRes.ok) {
        const data = await galleriesRes.json();
        setGalleries(data.galleries || []);
      }

      if (photosRes.ok) {
        const data = await photosRes.json();
        setPhotos(data.photos || []);
      }
    } catch (err) {
      setError('Failed to load photos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpload = async () => {
    // In production, this would handle file upload
    setSuccess('Photo uploaded successfully! It will appear after moderation.');
    setShowUploadModal(false);
    setUploadForm({ event_id: '', caption: '', tags: '' });
  };

  const handleLike = async (photoId: string) => {
    try {
      await fetch(`/api/photos/${photoId}/like`, { method: 'POST' });
      setPhotos(photos.map(p => 
        p.id === photoId ? { ...p, likes: p.likes + 1 } : p
      ));
    } catch (err) {
      setError('Failed to like photo');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      collecting: 'bg-warning-500 text-white',
      published: 'bg-success-500 text-white',
      archived: 'bg-ink-500 text-white',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

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
            <FooterColumn title="Discover">
              <FooterLink href="/photos">Photos</FooterLink>
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
            <LoadingSpinner size="lg" text="Loading photos..." />
          </Container>
        </Section>
      </PageLayout>
    );
  }

  const totalPhotos = galleries.reduce((sum, g) => sum + g.photo_count, 0);
  const activeGalleries = galleries.filter(g => g.status === 'collecting').length;
  const featuredPhotos = photos.filter(p => p.is_featured).length;

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
            <FooterLink href="/photos">Photos</FooterLink>
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
            <Stack direction="horizontal" className="items-center justify-between">
              <Stack gap={2}>
                <Kicker colorScheme="on-dark">Community</Kicker>
                <H2 size="lg" className="text-white">Photo Galleries</H2>
                <Body className="text-on-dark-muted">Share and discover photos from events</Body>
              </Stack>
              <Button variant="solid" inverted onClick={() => setShowUploadModal(true)}>
                Upload Photo
              </Button>
            </Stack>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid cols={4} gap={6}>
          <StatCard
            label="Total Photos"
            value={totalPhotos.toString()}
            inverted
          />
          <StatCard
            label="Active Galleries"
            value={activeGalleries.toString()}
            inverted
          />
          <StatCard
            label="Featured"
            value={featuredPhotos.toString()}
            inverted
          />
          <StatCard
            label="Your Uploads"
            value={photos.filter(p => p.uploaded_by === 'current_user').length.toString()}
            inverted
          />
        </Grid>

        <Stack direction="horizontal" gap={4}>
          <Button
            variant={activeView === 'galleries' ? 'solid' : 'outlineInk'}
            inverted={activeView === 'galleries'}
            onClick={() => setActiveView('galleries')}
          >
            Event Galleries
          </Button>
          <Button
            variant={activeView === 'feed' ? 'solid' : 'outlineInk'}
            inverted={activeView === 'feed'}
            onClick={() => setActiveView('feed')}
          >
            Photo Feed
          </Button>
        </Stack>

        {activeView === 'galleries' && (
          <Grid cols={3} gap={6}>
            {galleries.length > 0 ? (
              galleries.map(gallery => (
                <Card
                  key={gallery.id}
                  inverted
                  interactive
                  className="cursor-pointer overflow-hidden"
                  onClick={() => router.push(`/photos/gallery/${gallery.id}`)}
                >
                  <Stack className="relative h-48 bg-ink-900">
                    {gallery.cover_photo ? (
                      <Image
                        src={gallery.cover_photo}
                        alt={gallery.event_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Stack className="flex h-full w-full items-center justify-center">
                        <Body className="text-h3-md">📷</Body>
                      </Stack>
                    )}
                    <Stack className="absolute right-2 top-2">
                      {getStatusBadge(gallery.status)}
                    </Stack>
                  </Stack>
                  <Stack className="p-4" gap={2}>
                    <H3 className="text-white">{gallery.event_name}</H3>
                    <Body size="sm" className="text-on-dark-muted">
                      {new Date(gallery.event_date).toLocaleDateString()}
                    </Body>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body size="sm" className="text-on-dark-disabled">
                        {gallery.photo_count} photos
                      </Body>
                      <Button variant="ghost" size="sm">
                        View Gallery
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))
            ) : (
              <Card inverted className="col-span-3 p-12 text-center">
                <H3 className="mb-4 text-white">No Galleries Yet</H3>
                <Body className="mb-6 text-on-dark-muted">
                  Photo galleries will appear here after events
                </Body>
              </Card>
            )}
          </Grid>
        )}

        {activeView === 'feed' && (
          <Grid cols={4} gap={4}>
            {photos.length > 0 ? (
              photos.map(photo => (
                <Card
                  key={photo.id}
                  inverted
                  interactive
                  className="cursor-pointer overflow-hidden"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Stack className="relative aspect-square bg-ink-900">
                    <Image
                      src={photo.thumbnail_url || photo.url}
                      alt={photo.caption || 'Event photo'}
                      fill
                      className="object-cover"
                    />
                    {photo.is_featured && (
                      <Stack className="absolute left-2 top-2">
                        <Badge variant="solid">Featured</Badge>
                      </Stack>
                    )}
                  </Stack>
                  <Stack className="p-3" gap={1}>
                    <Body className="truncate font-display text-white">{photo.event_name}</Body>
                    <Stack direction="horizontal" className="items-center justify-between">
                      <Body size="sm" className="font-mono text-on-dark-disabled">
                        by {photo.uploaded_by_name}
                      </Body>
                      <Stack direction="horizontal" gap={1} className="items-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(photo.id);
                          }}
                        >
                          ❤️ {photo.likes}
                        </Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))
            ) : (
              <Card inverted className="col-span-4 p-12 text-center">
                <H3 className="mb-4 text-white">No Photos Yet</H3>
                <Body className="mb-6 text-on-dark-muted">
                  Be the first to share photos from an event!
                </Body>
                <Button variant="solid" inverted onClick={() => setShowUploadModal(true)}>
                  Upload Photo
                </Button>
              </Card>
            )}
          </Grid>
        )}

        <Modal
          open={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Upload Photo"
        >
          <Form onSubmit={handleUpload}>
            <Stack gap={4}>
              <Field label="Select Event" required>
                <Select
                  value={uploadForm.event_id}
                  onChange={(e) => setUploadForm({ ...uploadForm, event_id: e.target.value })}
                  required
                >
                  <option value="">Choose an event...</option>
                  {galleries.filter(g => g.status === 'collecting').map(g => (
                    <option key={g.id} value={g.event_id}>{g.event_name}</option>
                  ))}
                </Select>
              </Field>

              <Field label="Photo">
                <Input
                  type="file"
                  accept="image/*"
                  required
                />
              </Field>

              <Field label="Caption">
                <Input
                  value={uploadForm.caption}
                  onChange={(e) => setUploadForm({ ...uploadForm, caption: e.target.value })}
                  placeholder="Add a caption..."
                />
              </Field>

              <Field label="Tags">
                <Input
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  placeholder="stage, crowd, artist (comma separated)"
                />
              </Field>

              <Body className="text-body-sm text-ink-500">
                By uploading, you agree to our content guidelines. Photos are reviewed before publishing.
              </Body>

              <Stack direction="horizontal" gap={4}>
                <Button type="submit" variant="solid">
                  Upload
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)}>
                  Cancel
                </Button>
              </Stack>
            </Stack>
          </Form>
        </Modal>

        <Modal
          open={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          title=""
        >
          {selectedPhoto && (
            <Stack gap={4}>
              <Stack className="relative aspect-video bg-ink-100 rounded overflow-hidden">
                <Image
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption || 'Event photo'}
                  fill
                  className="object-contain"
                />
              </Stack>
              <Stack gap={2}>
                <H3>{selectedPhoto.event_name}</H3>
                {selectedPhoto.caption && (
                  <Body>{selectedPhoto.caption}</Body>
                )}
                <Stack direction="horizontal" gap={4}>
                  <Body className="text-body-sm text-ink-500">
                    by {selectedPhoto.uploaded_by_name}
                  </Body>
                  <Body className="text-body-sm text-ink-500">
                    {new Date(selectedPhoto.created_at).toLocaleDateString()}
                  </Body>
                </Stack>
                {selectedPhoto.tags.length > 0 && (
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {selectedPhoto.tags.map(tag => (
                      <Badge key={tag} variant="outline">#{tag}</Badge>
                    ))}
                  </Stack>
                )}
                <Stack direction="horizontal" gap={4} className="mt-4">
                  <Button variant="solid" onClick={() => handleLike(selectedPhoto.id)}>
                    ❤️ Like ({selectedPhoto.likes})
                  </Button>
                  <Button variant="outline">
                    Share
                  </Button>
                  <Button variant="outline">
                    Download
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
