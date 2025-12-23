"use client";

import { useState, Suspense } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
// Layout provided by route group
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea, Kicker,
} from "@ghxstship/ui";

import {
  DEMO_TRANSLATIONS,
  DEMO_TRANSLATION_FIELDS,
  type DemoTranslation as Translation,
} from "@/lib/demo-data";

const mockTranslations = DEMO_TRANSLATIONS;
const mockFields = DEMO_TRANSLATION_FIELDS;

function EventLanguagesPageContent() {
  const router = useRouter();
  const params = useParams();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'overview',
    validTabs: ['overview', 'content', 'settings'],
  });
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const completeCount = mockTranslations.filter(t => t.status === "Complete").length;
  const avgProgress = Math.round(mockTranslations.reduce((s, t) => s + t.progress, 0) / mockTranslations.length);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete": case "Translated": return "text-success-600";
      case "In Progress": case "Review": return "text-warning-600";
      case "Not Started": case "Pending": return "text-ink-600";
      default: return "text-ink-600";
    }
  };

  const getLanguageFlag = (code: string) => {
    const flags: Record<string, string> = {
      es: "🇪🇸",
      fr: "🇫🇷",
      de: "🇩🇪",
      ja: "🇯🇵",
      pt: "🇧🇷",
      zh: "🇨🇳",
      ko: "🇰🇷",
      it: "🇮🇹",
    };
    return flags[code] || "🌐";
  };

  return (
    <>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Events</Kicker>
              <H2 size="lg" className="text-white">Multi-Language</H2>
              <Body className="text-on-dark-muted">Event information translations and localization</Body>
            </Stack>

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Languages" value={mockTranslations.length} className="border-2 border-black" />
            <StatCard label="Complete" value={completeCount} className="border-2 border-black" />
            <StatCard label="Avg Progress" value={`${avgProgress}%`} className="border-2 border-black" />
            <StatCard label="Fields" value={mockFields.length} className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={isActive('overview')} onClick={() => setActiveTab('overview')}>Overview</Tab>
                <Tab active={isActive('content')} onClick={() => setActiveTab('content')}>Content</Tab>
                <Tab active={isActive('settings')} onClick={() => setActiveTab('settings')}>Settings</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowAddModal(true)}>Add Language</Button>
          </Stack>

          <TabPanel active={isActive('overview')}>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              {mockTranslations.map((translation) => (
                <Card key={translation.id} className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack direction="horizontal" gap={3}>
                        <Label className="text-h4-md">{getLanguageFlag(translation.languageCode)}</Label>
                        <Stack gap={1}>
                          <Body className="font-weight-bold">{translation.language}</Body>
                          <Label className="text-ink-500">{translation.languageCode.toUpperCase()}</Label>
                        </Stack>
                      </Stack>
                      <Label className={getStatusColor(translation.status)}>{translation.status}</Label>
                    </Stack>
                    <Stack gap={2}>
                      <Stack direction="horizontal" className="justify-between">
                        <Label className="text-ink-500">Progress</Label>
                        <Label className="font-mono">{translation.progress}%</Label>
                      </Stack>
                      <ProgressBar value={translation.progress} className="h-2" />
                    </Stack>
                    {translation.translator && (
                      <Label className="text-ink-500">Translator: {translation.translator}</Label>
                    )}
                    {translation.lastUpdated && (
                      <Label size="xs" className="text-ink-600">Updated: {translation.lastUpdated}</Label>
                    )}
                    <Stack direction="horizontal" gap={2}>
                      <Button variant="outline" size="sm" onClick={() => setSelectedTranslation(translation)}>Edit</Button>
                      {translation.status !== "Complete" && <Button variant="solid" size="sm">Continue</Button>}
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </TabPanel>

          <TabPanel active={isActive('content')}>
            <Stack gap={4}>
              <Select className="border-2 border-black w-48">
                <option value="es">Spanish (es)</option>
                <option value="fr">French (fr)</option>
                <option value="de">German (de)</option>
              </Select>
              {mockFields.map((field, idx) => (
                <Card key={idx} className="border-2 border-black p-4">
                  <Stack gap={3}>
                    <Stack direction="horizontal" className="justify-between">
                      <Label className="font-weight-bold">{field.field}</Label>
                      <Label className={getStatusColor(field.status)}>{field.status}</Label>
                    </Stack>
                    <Card className="p-3 bg-ink-50 border-2 border-ink-200">
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Original (English)</Label>
                        <Body>{field.original}</Body>
                      </Stack>
                    </Card>
                    {field.translated ? (
                      <Card className="p-3 bg-info-50 border-2 border-info-200">
                        <Stack gap={1}>
                          <Label size="xs" className="text-info-600">Translation</Label>
                          <Body>{field.translated}</Body>
                        </Stack>
                      </Card>
                    ) : (
                      <Textarea placeholder="Enter translation..." rows={2} className="border-2 border-black" />
                    )}
                  </Stack>
                </Card>
              ))}
            </Stack>
          </TabPanel>

          <TabPanel active={isActive('settings')}>
            <Card className="border-2 border-black p-6">
              <Stack gap={6}>
                <H3>Language Settings</H3>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Label className="font-weight-bold">Default Language</Label>
                      <Label className="text-ink-500">Primary language for event content</Label>
                    </Stack>
                    <Select className="border-2 border-black w-48">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                    </Select>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Label className="font-weight-bold">Auto-detect Language</Label>
                      <Label className="text-ink-500">Show content in visitor&apos;s browser language</Label>
                    </Stack>
                    <Button variant="solid" size="sm">Enabled</Button>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Label className="font-weight-bold">Machine Translation</Label>
                      <Label className="text-ink-500">Use AI for initial translations</Label>
                    </Stack>
                    <Button variant="outline" size="sm">Disabled</Button>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </TabPanel>

          <Button variant="outlineInk" onClick={() => router.push(`/events/${params.id}`)}>Back to Event</Button>
          </Stack>

      <Modal open={!!selectedTranslation} onClose={() => setSelectedTranslation(null)}>
        <ModalHeader><H3>Edit Translation</H3></ModalHeader>
        <ModalBody>
          {selectedTranslation && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={3}>
                <Label className="text-h4-md">{getLanguageFlag(selectedTranslation.languageCode)}</Label>
                <Stack gap={1}>
                  <Label className="font-weight-bold">{selectedTranslation.language}</Label>
                  <Badge variant="outline">{selectedTranslation.languageCode.toUpperCase()}</Badge>
                </Stack>
              </Stack>
              <Stack gap={2}>
                <Label className="text-ink-500">Progress</Label>
                <ProgressBar value={selectedTranslation.progress} className="h-3" />
                <Label className="font-mono text-center">{selectedTranslation.progress}%</Label>
              </Stack>
              <Input placeholder="Translator Name" defaultValue={selectedTranslation.translator} className="border-2 border-black" />
              <Select className="border-2 border-black">
                <option value="manual">Manual Translation</option>
                <option value="machine">Machine Translation</option>
                <option value="professional">Professional Service</option>
              </Select>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTranslation(null)}>Cancel</Button>
          <Button variant="outline" className="text-error-600">Remove Language</Button>
          <Button variant="solid" onClick={() => setSelectedTranslation(null)}>Save</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Language</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select className="border-2 border-black">
              <option value="">Select Language...</option>
              <option value="zh">Chinese (Simplified)</option>
              <option value="ko">Korean</option>
              <option value="it">Italian</option>
              <option value="ru">Russian</option>
              <option value="ar">Arabic</option>
            </Select>
            <Select className="border-2 border-black">
              <option value="">Translation Method...</option>
              <option value="manual">Manual Translation</option>
              <option value="machine">Machine Translation (AI)</option>
              <option value="professional">Professional Service</option>
            </Select>
            <Input placeholder="Translator Name (optional)" className="border-2 border-black" />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Language</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default function EventLanguagesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <EventLanguagesPageContent />
    </Suspense>
  );
}
