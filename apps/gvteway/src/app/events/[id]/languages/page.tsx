"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge, ProgressBar,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface Translation {
  id: string;
  language: string;
  languageCode: string;
  status: "Complete" | "In Progress" | "Not Started";
  progress: number;
  lastUpdated?: string;
  translator?: string;
}

interface TranslationField {
  field: string;
  original: string;
  translated?: string;
  status: "Translated" | "Pending" | "Review";
}

const mockTranslations: Translation[] = [
  { id: "TR-001", language: "Spanish", languageCode: "es", status: "Complete", progress: 100, lastUpdated: "2024-11-20", translator: "Maria Garcia" },
  { id: "TR-002", language: "French", languageCode: "fr", status: "In Progress", progress: 65, lastUpdated: "2024-11-24", translator: "Jean Dupont" },
  { id: "TR-003", language: "German", languageCode: "de", status: "In Progress", progress: 40, lastUpdated: "2024-11-23" },
  { id: "TR-004", language: "Japanese", languageCode: "ja", status: "Not Started", progress: 0 },
  { id: "TR-005", language: "Portuguese", languageCode: "pt", status: "Complete", progress: 100, lastUpdated: "2024-11-18", translator: "Carlos Silva" },
];

const mockFields: TranslationField[] = [
  { field: "Event Title", original: "Summer Music Festival 2025", translated: "Festival de Música de Verano 2025", status: "Translated" },
  { field: "Description", original: "Join us for three days of incredible live music featuring top artists from around the world.", translated: "Únete a nosotros para tres días de increíble música en vivo con los mejores artistas de todo el mundo.", status: "Translated" },
  { field: "Venue Info", original: "Central Park, New York City", translated: "Central Park, Nueva York", status: "Translated" },
  { field: "Ticket Info", original: "General Admission tickets include access to all stages.", status: "Pending" },
  { field: "Safety Guidelines", original: "Please review our safety guidelines before attending.", status: "Review" },
];

export default function EventLanguagesPage() {
  const router = useRouter();
  const params = useParams();
  const [activeTab, setActiveTab] = useState("overview");
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
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>MULTI-LANGUAGE</H1>
            <Body className="text-ink-600">Event information translations and localization</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Languages" value={mockTranslations.length} className="border-2 border-black" />
            <StatCard label="Complete" value={completeCount} className="border-2 border-black" />
            <StatCard label="Avg Progress" value={`${avgProgress}%`} className="border-2 border-black" />
            <StatCard label="Fields" value={mockFields.length} className="border-2 border-black" />
          </Grid>

          <Stack direction="horizontal" className="justify-between">
            <Tabs>
              <TabsList>
                <Tab active={activeTab === "overview"} onClick={() => setActiveTab("overview")}>Overview</Tab>
                <Tab active={activeTab === "content"} onClick={() => setActiveTab("content")}>Content</Tab>
                <Tab active={activeTab === "settings"} onClick={() => setActiveTab("settings")}>Settings</Tab>
              </TabsList>
            </Tabs>
            <Button variant="solid" onClick={() => setShowAddModal(true)}>Add Language</Button>
          </Stack>

          <TabPanel active={activeTab === "overview"}>
            <Grid cols={2} gap={4}>
              {mockTranslations.map((translation) => (
                <Card key={translation.id} className="border-2 border-black p-6">
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack direction="horizontal" gap={3}>
                        <Label className="text-h4-md">{getLanguageFlag(translation.languageCode)}</Label>
                        <Stack gap={1}>
                          <Body className="font-bold">{translation.language}</Body>
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

          <TabPanel active={activeTab === "content"}>
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
                      <Label className="font-bold">{field.field}</Label>
                      <Label className={getStatusColor(field.status)}>{field.status}</Label>
                    </Stack>
                    <Card className="p-3 bg-ink-50 border border-ink-200">
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Original (English)</Label>
                        <Body>{field.original}</Body>
                      </Stack>
                    </Card>
                    {field.translated ? (
                      <Card className="p-3 bg-info-50 border border-info-200">
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

          <TabPanel active={activeTab === "settings"}>
            <Card className="border-2 border-black p-6">
              <Stack gap={6}>
                <H3>Language Settings</H3>
                <Stack gap={4}>
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Label className="font-bold">Default Language</Label>
                      <Label className="text-ink-500">Primary language for event content</Label>
                    </Stack>
                    <Select className="border-2 border-black w-48">
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                    </Select>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Label className="font-bold">Auto-detect Language</Label>
                      <Label className="text-ink-500">Show content in visitor&apos;s browser language</Label>
                    </Stack>
                    <Button variant="solid" size="sm">Enabled</Button>
                  </Stack>
                  <Stack direction="horizontal" className="justify-between items-center">
                    <Stack gap={1}>
                      <Label className="font-bold">Machine Translation</Label>
                      <Label className="text-ink-500">Use AI for initial translations</Label>
                    </Stack>
                    <Button variant="outline" size="sm">Disabled</Button>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </TabPanel>

          <Button variant="outline" onClick={() => router.push(`/events/${params.id}`)}>Back to Event</Button>
        </Stack>
      </Container>

      <Modal open={!!selectedTranslation} onClose={() => setSelectedTranslation(null)}>
        <ModalHeader><H3>Edit Translation</H3></ModalHeader>
        <ModalBody>
          {selectedTranslation && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={3}>
                <Label className="text-h4-md">{getLanguageFlag(selectedTranslation.languageCode)}</Label>
                <Stack gap={1}>
                  <Label className="font-bold">{selectedTranslation.language}</Label>
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
    </UISection>
  );
}
