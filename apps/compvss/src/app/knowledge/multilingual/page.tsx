'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CreatorNavigationAuthenticated } from '../../../components/navigation';
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Section,
  Card,
  Tabs,
  TabsList,
  Tab,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ProgressBar,
  PageLayout,
  SectionHeader,
} from '@ghxstship/ui';

interface TranslatedContent {
  id: string;
  title: string;
  category: string;
  sourceLanguage: string;
  translations: { language: string; status: 'Complete' | 'In Progress' | 'Pending'; progress: number }[];
  lastUpdated: string;
}

interface LanguageSetting {
  code: string;
  name: string;
  nativeName: string;
  enabled: boolean;
  contentCount: number;
  translators: number;
}

const mockContent: TranslatedContent[] = [
  { id: 'DOC-001', title: 'Safety Procedures Manual', category: 'Safety', sourceLanguage: 'English', translations: [{ language: 'Spanish', status: 'Complete', progress: 100 }, { language: 'French', status: 'Complete', progress: 100 }, { language: 'German', status: 'In Progress', progress: 75 }], lastUpdated: '2024-11-20' },
  { id: 'DOC-002', title: 'Audio Equipment Guide', category: 'Equipment', sourceLanguage: 'English', translations: [{ language: 'Spanish', status: 'Complete', progress: 100 }, { language: 'Japanese', status: 'In Progress', progress: 45 }], lastUpdated: '2024-11-18' },
  { id: 'DOC-003', title: 'Rigging Best Practices', category: 'Safety', sourceLanguage: 'English', translations: [{ language: 'Spanish', status: 'Pending', progress: 0 }, { language: 'Portuguese', status: 'Pending', progress: 0 }], lastUpdated: '2024-11-15' },
  { id: 'DOC-004', title: 'Event Setup Checklist', category: 'Operations', sourceLanguage: 'English', translations: [{ language: 'Spanish', status: 'Complete', progress: 100 }, { language: 'French', status: 'Complete', progress: 100 }, { language: 'German', status: 'Complete', progress: 100 }, { language: 'Mandarin', status: 'In Progress', progress: 60 }], lastUpdated: '2024-11-22' },
];

const mockLanguages: LanguageSetting[] = [
  { code: 'en', name: 'English', nativeName: 'English', enabled: true, contentCount: 245, translators: 0 },
  { code: 'es', name: 'Spanish', nativeName: 'Español', enabled: true, contentCount: 198, translators: 3 },
  { code: 'fr', name: 'French', nativeName: 'Français', enabled: true, contentCount: 156, translators: 2 },
  { code: 'de', name: 'German', nativeName: 'Deutsch', enabled: true, contentCount: 89, translators: 1 },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', enabled: true, contentCount: 45, translators: 1 },
  { code: 'zh', name: 'Mandarin', nativeName: '中文', enabled: true, contentCount: 32, translators: 1 },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', enabled: false, contentCount: 0, translators: 0 },
  { code: 'ko', name: 'Korean', nativeName: '한국어', enabled: false, contentCount: 0, translators: 0 },
];

export default function MultilingualPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('content');
  const [selectedContent, setSelectedContent] = useState<TranslatedContent | null>(null);
  const [languageFilter, setLanguageFilter] = useState('All');
  const [userLanguage, setUserLanguage] = useState('en');

  const enabledLanguages = mockLanguages.filter(l => l.enabled).length;
  const totalTranslations = mockContent.flatMap(c => c.translations).filter(t => t.status === 'Complete').length;
  const pendingTranslations = mockContent.flatMap(c => c.translations).filter(t => t.status === 'Pending' || t.status === 'In Progress').length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete': return 'text-success-400';
      case 'In Progress': return 'text-warning-400';
      case 'Pending': return 'text-ink-400';
      default: return 'text-ink-400';
    }
  };

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            <Stack direction="horizontal" className="justify-between">
              <SectionHeader
                kicker="COMPVSS"
                title="Multilingual Support"
                description="Content translations for international crews"
                colorScheme="on-light"
                gap="lg"
              />
              <Select value={userLanguage} onChange={(e) => setUserLanguage(e.target.value)}>
                {mockLanguages.filter(l => l.enabled).map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.nativeName} ({lang.name})</option>
                ))}
              </Select>
            </Stack>

            <Grid cols={4} gap={6}>
              <StatCard label="Languages" value={enabledLanguages.toString()} />
              <StatCard label="Translated Content" value={totalTranslations.toString()} />
              <StatCard label="Pending" value={pendingTranslations.toString()} />
              <StatCard label="Translators" value={mockLanguages.reduce((sum, l) => sum + l.translators, 0).toString()} />
            </Grid>

            <Tabs>
              <TabsList>
                <Tab active={activeTab === 'content'} onClick={() => setActiveTab('content')}>Content</Tab>
                <Tab active={activeTab === 'languages'} onClick={() => setActiveTab('languages')}>Languages</Tab>
                <Tab active={activeTab === 'settings'} onClick={() => setActiveTab('settings')}>Settings</Tab>
              </TabsList>
            </Tabs>

            {activeTab === 'content' && (
              <Stack gap={4}>
                <Stack direction="horizontal" className="justify-between">
                  <Select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
                    <option value="All">All Languages</option>
                    {mockLanguages.filter(l => l.enabled && l.code !== 'en').map(lang => (
                      <option key={lang.code} value={lang.name}>{lang.name}</option>
                    ))}
                  </Select>
                  <Button variant="outline">Request Translation</Button>
                </Stack>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Content</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Translations</TableHead>
                      <TableHead>Last Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockContent.map((content) => (
                      <TableRow key={content.id}>
                        <TableCell>
                          <Stack gap={0}>
                            <Body>{content.title}</Body>
                            <Body className="text-body-sm">{content.id}</Body>
                          </Stack>
                        </TableCell>
                        <TableCell><Badge variant="outline">{content.category}</Badge></TableCell>
                        <TableCell>
                          <Stack direction="horizontal" gap={2} className="flex-wrap">
                            {content.translations.map((t, idx) => (
                              <Badge key={idx} variant={t.status === 'Complete' ? 'solid' : 'outline'}>
                                {t.language} {t.status === 'In Progress' && `(${t.progress}%)`}
                              </Badge>
                            ))}
                          </Stack>
                        </TableCell>
                        <TableCell><Body className="text-body-sm">{content.lastUpdated}</Body></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedContent(content)}>Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
            )}

            {activeTab === 'languages' && (
              <Grid cols={2} gap={4}>
                {mockLanguages.map((lang) => (
                  <Card key={lang.code}>
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Body className="font-display">{lang.nativeName}</Body>
                          <Body className="text-body-sm">{lang.name}</Body>
                        </Stack>
                        <Badge variant={lang.enabled ? 'solid' : 'outline'}>{lang.enabled ? 'Enabled' : 'Disabled'}</Badge>
                      </Stack>
                      <Grid cols={2} gap={4}>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Content Items</Body>
                          <Body className="font-mono">{lang.contentCount}</Body>
                        </Stack>
                        <Stack gap={1}>
                          <Body className="text-body-sm">Translators</Body>
                          <Body className="font-mono">{lang.translators}</Body>
                        </Stack>
                      </Grid>
                      <Button variant="outline" size="sm">{lang.enabled ? 'Manage' : 'Enable'}</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            )}

            {activeTab === 'settings' && (
              <Stack gap={4}>
                <Card>
                  <Stack gap={4}>
                    <H3>Translation Settings</H3>
                    <Grid cols={2} gap={4}>
                      <Stack gap={2}>
                        <Body>Default Language</Body>
                        <Select>
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                        </Select>
                      </Stack>
                      <Stack gap={2}>
                        <Body>Auto-Translate</Body>
                        <Select>
                          <option value="off">Off</option>
                          <option value="suggest">Suggest Only</option>
                          <option value="auto">Auto-Translate New Content</option>
                        </Select>
                      </Stack>
                    </Grid>
                    <Stack gap={2}>
                      <Body>Priority Languages for New Content</Body>
                      <Stack direction="horizontal" gap={2}>
                        {['Spanish', 'French', 'German'].map(lang => (
                          <Badge key={lang} variant="outline">{lang}</Badge>
                        ))}
                        <Button variant="ghost" size="sm">+ Add</Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
                <Card>
                  <Stack gap={4}>
                    <H3>Translation Quality</H3>
                    <Stack gap={2}>
                      <Stack direction="horizontal" className="justify-between">
                        <Body className="text-body-sm">Review Required</Body>
                        <Badge variant="solid">Enabled</Badge>
                      </Stack>
                      <Body className="text-body-sm">All machine translations require human review before publishing</Body>
                    </Stack>
                  </Stack>
                </Card>
              </Stack>
            )}

            <Button variant="outline" onClick={() => router.push('/knowledge')}>Back to Knowledge Base</Button>
          </Stack>
        </Container>
      </Section>

      <Modal open={!!selectedContent} onClose={() => setSelectedContent(null)}>
        <ModalHeader><H3>Translation Status</H3></ModalHeader>
        <ModalBody>
          {selectedContent && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Body className="text-body-sm">Content</Body>
                <Body>{selectedContent.title}</Body>
              </Stack>
              <Badge variant="outline">{selectedContent.category}</Badge>
              <Stack gap={2}>
                <Body className="text-body-sm">Translations</Body>
                {selectedContent.translations.map((t, idx) => (
                  <Card key={idx}>
                    <Stack gap={2}>
                      <Stack direction="horizontal" className="justify-between">
                        <Body>{t.language}</Body>
                        <Badge variant={t.status === 'Complete' ? 'solid' : 'outline'}>{t.status}</Badge>
                      </Stack>
                      <ProgressBar value={t.progress} />
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedContent(null)}>Close</Button>
          <Button variant="solid">Request Translation</Button>
        </ModalFooter>
      </Modal>
    </PageLayout>
  );
}
