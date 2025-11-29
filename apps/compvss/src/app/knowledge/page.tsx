'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../components/navigation';
import { Container, Section, H2, H3, Body, Button, Input, Card, Grid, Badge, Stack, StatCard, PageLayout, SectionHeader,
  EnterprisePageHeader,
  MainContent,} from '@ghxstship/ui';
import { Search, BookOpen, Video, FileText, Download, Star } from 'lucide-react';

export default function KnowledgePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('all');

  const articles = [
    {
      id: '1',
      title: 'Rigging Safety Best Practices',
      category: 'Safety',
      type: 'Guide',
      views: 2340,
      rating: 4.8,
      lastUpdated: '2024-11-15',
      featured: true,
    },
    {
      id: '2',
      title: 'LED Wall Setup Tutorial',
      category: 'Technical',
      type: 'Video',
      views: 1856,
      rating: 4.9,
      lastUpdated: '2024-11-20',
      featured: true,
    },
    {
      id: '3',
      title: 'Load-In Checklist Template',
      category: 'Operations',
      type: 'Template',
      views: 3120,
      rating: 4.7,
      lastUpdated: '2024-11-18',
      featured: false,
    },
  ];

  const categories = ['All', 'Safety', 'Technical', 'Operations', 'Equipment', 'Compliance'];

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <Stack gap={4} direction="horizontal" className="flex-col items-center justify-between md:flex-row">
              <EnterprisePageHeader
        title="Knowledge Base"
        subtitle="SOPs, guides, and training materials"
        breadcrumbs={[{ label: 'COMPVSS', href: '/dashboard' }, { label: 'Knowledge' }]}
        views={[
          { id: 'default', label: 'Default', icon: 'grid' },
        ]}
        activeView="default"
        showFavorite
        showSettings
      />
              <Button variant="solid" onClick={() => router.push('/knowledge/contribute')}>
                <FileText className="mr-2 size-4" />
                CONTRIBUTE
              </Button>
            </Stack>

            <Card>
              <Stack className="relative">
                <Search className="absolute left-3 top-1/2 size-5 -translate-y-1/2" />
                <Input placeholder="Search knowledge base..." className="w-full pl-10" />
              </Stack>
            </Card>

            <Stack gap={2} direction="horizontal" className="flex-wrap">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat.toLowerCase() ? 'solid' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(cat.toLowerCase())}
                >
                  {cat}
                </Button>
              ))}
            </Stack>

            <Stack gap={4}>
              <H2>FEATURED CONTENT</H2>
              <Grid cols={2} gap={6}>
                {articles.filter(a => a.featured).map((article) => (
                  <Card key={article.id}>
                    <Stack gap={4}>
                      <Stack gap={3} direction="horizontal" className="items-start justify-between">
                        <Badge variant="solid">FEATURED</Badge>
                        <Stack gap={1} direction="horizontal" className="items-center">
                          <Star className="size-4 fill-current" />
                          <Body className="font-display">{article.rating}</Body>
                        </Stack>
                      </Stack>
                      <H3>{article.title}</H3>
                      <Stack gap={4} direction="horizontal" className="text-body-sm">
                        <Stack gap={1} direction="horizontal" className="items-center">
                          {article.type === 'Video' ? <Video className="size-4" /> : <FileText className="size-4" />}
                          <Body className="text-body-sm">{article.type}</Body>
                        </Stack>
                        <Body className="text-body-sm">{article.views.toLocaleString()} views</Body>
                        <Body className="text-body-sm">Updated {new Date(article.lastUpdated).toLocaleDateString()}</Body>
                      </Stack>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/knowledge/${article.id}`)}>
                        {article.type === 'Video' ? 'WATCH' : 'READ'}
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>

            <Stack gap={4}>
              <H2>ALL RESOURCES</H2>
              <Stack gap={4}>
                {articles.map((article) => (
                  <Card key={article.id}>
                    <Stack gap={4} direction="horizontal" className="items-start justify-between">
                      <Stack gap={2} className="flex-1">
                        <Stack gap={3} direction="horizontal" className="items-center">
                          {article.type === 'Video' ? <Video className="size-5" /> : 
                           article.type === 'Template' ? <Download className="size-5" /> :
                           <BookOpen className="size-5" />}
                          <H3>{article.title}</H3>
                          <Badge variant="outline">
                            {article.category}
                          </Badge>
                        </Stack>
                        <Stack gap={4} direction="horizontal" className="text-body-sm">
                          <Body className="text-body-sm">{article.views.toLocaleString()} views</Body>
                          <Stack gap={1} direction="horizontal" className="items-center">
                            <Star className="size-4" />
                            <Body className="text-body-sm">{article.rating}</Body>
                          </Stack>
                          <Body className="text-body-sm">Updated {new Date(article.lastUpdated).toLocaleDateString()}</Body>
                        </Stack>
                      </Stack>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/knowledge/${article.id}`)}>VIEW</Button>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>

            <Grid cols={4} gap={6}>
              <StatCard value="342" label="Total Articles" />
              <StatCard value="89" label="Video Tutorials" />
              <StatCard value="156" label="Templates" />
              <StatCard value="47" label="Contributors" />
            </Grid>
          </Stack>
        </Container>
      </Section>
    </PageLayout>
  );
}
