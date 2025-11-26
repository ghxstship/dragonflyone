"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, Button,
  Section as UISection, Card, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "@ghxstship/ui";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  coverage: number;
  isDefault?: boolean;
  isSelected?: boolean;
}

const mockLanguages: Language[] = [
  { code: "en", name: "English", nativeName: "English", coverage: 100, isDefault: true, isSelected: true },
  { code: "es", name: "Spanish", nativeName: "Español", coverage: 98 },
  { code: "fr", name: "French", nativeName: "Français", coverage: 95 },
  { code: "de", name: "German", nativeName: "Deutsch", coverage: 92 },
  { code: "pt", name: "Portuguese", nativeName: "Português", coverage: 90 },
  { code: "it", name: "Italian", nativeName: "Italiano", coverage: 88 },
  { code: "ja", name: "Japanese", nativeName: "日本語", coverage: 85 },
  { code: "ko", name: "Korean", nativeName: "한국어", coverage: 82 },
  { code: "zh", name: "Chinese (Simplified)", nativeName: "简体中文", coverage: 88 },
  { code: "ar", name: "Arabic", nativeName: "العربية", coverage: 75 },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", coverage: 78 },
  { code: "ru", name: "Russian", nativeName: "Русский", coverage: 72 },
];

export default function LanguageSettingsPage() {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);

  const currentLanguage = mockLanguages.find(l => l.code === selectedLanguage);

  const handleLanguageSelect = (lang: Language) => {
    if (lang.code !== selectedLanguage) {
      setPendingLanguage(lang);
      setShowConfirmModal(true);
    }
  };

  const confirmLanguageChange = () => {
    if (pendingLanguage) {
      setSelectedLanguage(pendingLanguage.code);
    }
    setShowConfirmModal(false);
    setPendingLanguage(null);
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 95) return "text-success-600";
    if (coverage >= 80) return "text-warning-600";
    return "text-warning-600";
  };

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>LANGUAGE SETTINGS</H1>
            <Body className="text-grey-600">Choose your preferred language for the app</Body>
          </Stack>

          <Card className="border-2 border-black p-6">
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between items-center">
                <Stack gap={1}>
                  <Label className="text-grey-500">Current Language</Label>
                  <Body className="font-bold text-xl">{currentLanguage?.nativeName} ({currentLanguage?.name})</Body>
                </Stack>
                <Badge variant="solid">Active</Badge>
              </Stack>
              <Alert variant="info">
                Changing your language will update all text throughout the app. Some user-generated content may remain in its original language.
              </Alert>
            </Stack>
          </Card>

          <Stack gap={4}>
            <H3>Available Languages</H3>
            <Grid cols={3} gap={4}>
              {mockLanguages.map((lang) => (
                <Card key={lang.code} className={`border-2 p-4 cursor-pointer transition-all ${lang.code === selectedLanguage ? "border-black bg-grey-50" : "border-grey-200 hover:border-grey-400"}`} onClick={() => handleLanguageSelect(lang)}>
                  <Stack gap={3}>
                    <Stack direction="horizontal" className="justify-between items-start">
                      <Stack gap={1}>
                        <Body className="font-bold">{lang.nativeName}</Body>
                        <Label className="text-grey-500">{lang.name}</Label>
                      </Stack>
                      {lang.code === selectedLanguage && <Badge variant="solid">✓</Badge>}
                      {lang.isDefault && <Badge variant="outline">Default</Badge>}
                    </Stack>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Label size="xs" className="text-grey-500">Translation Coverage</Label>
                      <Label className={getCoverageColor(lang.coverage)}>{lang.coverage}%</Label>
                    </Stack>
                    <Card className="h-2 bg-grey-200 overflow-hidden">
                      <Card 
                        className={`h-full ${lang.coverage >= 95 ? "bg-success-500" : lang.coverage >= 80 ? "bg-warning-500" : "bg-warning-500"}`} 
                        style={{ '--progress-width': `${lang.coverage}%`, width: 'var(--progress-width)' } as React.CSSProperties} 
                      />
                    </Card>
                  </Stack>
                </Card>
              ))}
            </Grid>
          </Stack>

          <Card className="border-2 border-grey-200 p-6">
            <Stack gap={4}>
              <H3>Translation Information</H3>
              <Grid cols={2} gap={6}>
                <Stack gap={2}>
                  <Label className="text-grey-500">What gets translated:</Label>
                  <Stack gap={1}>
                    {["Navigation and menus", "Buttons and labels", "System messages", "Help content", "Email notifications"].map((item) => (
                      <Stack key={item} direction="horizontal" gap={2}>
                        <Label className="text-success-600">✓</Label>
                        <Label>{item}</Label>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
                <Stack gap={2}>
                  <Label className="text-grey-500">What stays in original language:</Label>
                  <Stack gap={1}>
                    {["Event names and descriptions", "Artist names", "Venue information", "User reviews", "Chat messages"].map((item) => (
                      <Stack key={item} direction="horizontal" gap={2}>
                        <Label className="text-grey-400">•</Label>
                        <Label>{item}</Label>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Grid>
            </Stack>
          </Card>

          <Stack gap={2}>
            <Label className="text-grey-500">Missing your language?</Label>
            <Button variant="outline">Request a Language</Button>
          </Stack>

          <Button variant="outline" onClick={() => router.push("/settings")}>Back to Settings</Button>
        </Stack>
      </Container>

      <Modal open={showConfirmModal} onClose={() => { setShowConfirmModal(false); setPendingLanguage(null); }}>
        <ModalHeader><H3>Change Language</H3></ModalHeader>
        <ModalBody>
          {pendingLanguage && (
            <Stack gap={4}>
              <Body>Are you sure you want to change your language to <strong>{pendingLanguage.nativeName}</strong>?</Body>
              <Card className="p-4 bg-grey-50 border border-grey-200">
                <Stack direction="horizontal" className="justify-between">
                  <Stack gap={1}>
                    <Label className="text-grey-500">From</Label>
                    <Body>{currentLanguage?.nativeName}</Body>
                  </Stack>
                  <Label className="text-2xl">→</Label>
                  <Stack gap={1}>
                    <Label className="text-grey-500">To</Label>
                    <Body className="font-bold">{pendingLanguage.nativeName}</Body>
                  </Stack>
                </Stack>
              </Card>
              {pendingLanguage.coverage < 90 && (
                <Alert variant="warning">
                  This language has {pendingLanguage.coverage}% translation coverage. Some content may appear in English.
                </Alert>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => { setShowConfirmModal(false); setPendingLanguage(null); }}>Cancel</Button>
          <Button variant="solid" onClick={confirmLanguageChange}>Change Language</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
