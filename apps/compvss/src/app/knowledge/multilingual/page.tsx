'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTabState } from '@ghxstship/config/hooks';
import { CompvssAppLayout } from '../../../components/app-layout';
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
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';

import {
  DEMO_TRANSLATED_CONTENT,
  DEMO_LANGUAGE_SETTINGS,
  type DemoTranslatedContent as TranslatedContent,
} from '../../../lib/demo-data';

const mockContent = DEMO_TRANSLATED_CONTENT;
const mockLanguages = DEMO_LANGUAGE_SETTINGS;

export default function MultilingualPage() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'content',
    validTabs: ['content', 'languages', 'settings'],
  });
  const [selectedContent, setSelectedContent] = useState<TranslatedContent | null>(null);
  const [languageFilter, setLanguageFilter] = useState('All');
  const [userLanguage, setUserLanguage] = useState('en');

  const enabledLanguages = mockLanguages.filter(l => l.enabled).length;
  const totalTranslations = mockContent.flatMap(c => c.translations).filter(t => t.status === 'Complete').length;
  const pendingTranslations = mockContent.flatMap(c => c.translations).filter(t => t.status === 'Pending' || t.status === 'In Progress').length;

  const getStatusVariant = (status: string): 'success' | 'warning' | 'ghost' => {
    switch (status) {
      case 'Complete': return 'success';
      case 'In Progress': return 'warning';
      case 'Pending': return 'ghost';
      default: return 'ghost';
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Multilingual Support"
        subtitle="Content translations for international crews"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            <Stack direction="horizontal" className="justify-end">
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
                <Tab active={isActive('content')} onClick={() => setActiveTab('content')}>Content</Tab>
                <Tab active={isActive('languages')} onClick={() => setActiveTab('languages')}>Languages</Tab>
                <Tab active={isActive('settings')} onClick={() => setActiveTab('settings')}>Settings</Tab>
              </TabsList>
            </Tabs>

            {isActive('content') && (
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

                <Table variant="dark">
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

            {isActive('languages') && (
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

            {isActive('settings') && (
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
      </MainContent>

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
                        <Badge variant={getStatusVariant(t.status)}>{t.status}</Badge>
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
    </CompvssAppLayout>
  );
}
