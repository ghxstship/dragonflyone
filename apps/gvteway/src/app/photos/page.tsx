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

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
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
      collecting: 'bg-yellow-500 text-white',
      published: 'bg-green-500 text-white',
      archived: 'bg-gray-500 text-white',
    };
    return <Badge className={variants[status] || ''}>{status}</Badge>;
  };

  if (loading) {
    return (
      <Section className="min-h-screen bg-white">
        <Navigation />
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading photos..." />
        </Container>
      </Section>
    );
  }

  const totalPhotos = galleries.reduce((sum, g) => sum + g.photo_count, 0);
  const activeGalleries = galleries.filter(g => g.status === 'collecting').length;
  const featuredPhotos = photos.filter(p => p.is_featured).length;

  return (
    <Section className="min-h-screen bg-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
        <Stack direction="horizontal" className="flex-col md:flex-row md:items-center md:justify-between border-b-2 border-black pb-8">
          <Stack gap={2}>
            <H1>Photo Galleries</H1>
            <Body className="text-grey-600">
              Share and discover photos from events
            </Body>
          </Stack>
          <Button variant="solid" onClick={() => setShowUploadModal(true)}>
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

        <Grid cols={4} gap={6} className="mb-8">
          <StatCard
            label="Total Photos"
            value={totalPhotos}
            icon={<Body>📷</Body>}
          />
          <StatCard
            label="Active Galleries"
            value={activeGalleries}
            icon={<Body>🖼️</Body>}
          />
          <StatCard
            label="Featured"
            value={featuredPhotos}
            icon={<Body>⭐</Body>}
          />
          <StatCard
            label="Your Uploads"
            value={photos.filter(p => p.uploaded_by === 'current_user').length}
            icon={<Body>📤</Body>}
          />
        </Grid>

        <Stack direction="horizontal" gap={4} className="mb-6">
          <Button
            variant={activeView === 'galleries' ? 'solid' : 'outline'}
            onClick={() => setActiveView('galleries')}
          >
            Event Galleries
          </Button>
          <Button
            variant={activeView === 'feed' ? 'solid' : 'outline'}
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
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => router.push(`/photos/gallery/${gallery.id}`)}
                >
                  <Stack className="relative h-48 bg-gray-100">
                    {gallery.cover_photo ? (
                      <Image
                        src={gallery.cover_photo}
                        alt={gallery.event_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <Stack className="w-full h-full flex items-center justify-center">
                        <Body className="text-4xl">📷</Body>
                      </Stack>
                    )}
                    <Stack className="absolute top-2 right-2">
                      {getStatusBadge(gallery.status)}
                    </Stack>
                  </Stack>
                  <Stack className="p-4" gap={2}>
                    <H3>{gallery.event_name}</H3>
                    <Body className="text-sm text-gray-600">
                      {new Date(gallery.event_date).toLocaleDateString()}
                    </Body>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Body className="text-sm text-gray-500">
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
              <Card className="col-span-3 p-12 text-center">
                <H3 className="mb-4">NO GALLERIES YET</H3>
                <Body className="text-gray-600 mb-6">
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
                  className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <Stack className="relative aspect-square bg-gray-100">
                    <Image
                      src={photo.thumbnail_url || photo.url}
                      alt={photo.caption || 'Event photo'}
                      fill
                      className="object-cover"
                    />
                    {photo.is_featured && (
                      <Stack className="absolute top-2 left-2">
                        <Badge className="bg-yellow-500 text-white">Featured</Badge>
                      </Stack>
                    )}
                  </Stack>
                  <Stack className="p-3" gap={1}>
                    <Body className="text-sm font-bold truncate">{photo.event_name}</Body>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Body className="text-xs text-gray-500">
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
              <Card className="col-span-4 p-12 text-center">
                <H3 className="mb-4">NO PHOTOS YET</H3>
                <Body className="text-gray-600 mb-6">
                  Be the first to share photos from an event!
                </Body>
                <Button variant="solid" onClick={() => setShowUploadModal(true)}>
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
          <form onSubmit={handleUpload}>
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

              <Body className="text-sm text-gray-500">
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
          </form>
        </Modal>

        <Modal
          open={!!selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          title=""
        >
          {selectedPhoto && (
            <Stack gap={4}>
              <Stack className="relative aspect-video bg-gray-100 rounded overflow-hidden">
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
                  <Body className="text-sm text-gray-500">
                    by {selectedPhoto.uploaded_by_name}
                  </Body>
                  <Body className="text-sm text-gray-500">
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
  );
}
