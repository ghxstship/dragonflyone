"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Layout provided by route group
import {
  Alert,
  Badge,
  Body,
  Button,
  Card,
  Grid,
  H2,
  H3,
  Kicker,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ProgressBar,
  Stack,
  Text,
} from '@ghxstship/ui';
import { Globe, Check } from "lucide-react";

import { useLanguageSettings } from "@ghxstship/config";
import { DEMO_LANGUAGES } from "@/lib/demo-data";

interface Language {
  code: string;
  name: string;
  nativeName: string;
  coverage: number;
  isDefault?: boolean;
}

export default function LanguageSettingsPage() {
  const router = useRouter();
  const { languages: apiLanguages, isLoading } = useLanguageSettings();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);

  // Use API data or fall back to demo data
  const languages: Language[] = apiLanguages.length > 0 ? (apiLanguages as unknown as Language[]) : (DEMO_LANGUAGES as unknown as Language[]);

  const currentLanguage = languages.find(l => l.code === selectedLanguage);

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
    <>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Settings</Kicker>
              <H2 size="lg" className="text-white">Language Settings</H2>
              <Body className="text-on-dark-muted">Choose your preferred language for the app</Body>
            </Stack>

            {/* Current Language */}
            <Card inverted variant="elevated" className="p-6">
              <Stack gap={4}>
                <Stack direction="horizontal" className="items-center justify-between">
                  <Stack gap={1}>
                    <Label size="sm" className="text-on-dark-muted">Current Language</Label>
                    <Body className="font-display text-white">{currentLanguage?.nativeName} ({currentLanguage?.name})</Body>
                  </Stack>
                  <Badge variant="solid">Active</Badge>
                </Stack>
                <Alert variant="info">
                  Changing your language will update all text throughout the app. Some user-generated content may remain in its original language.
                </Alert>
              </Stack>
            </Card>

            {/* Available Languages */}
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Globe className="size-5 text-on-dark-muted" />
                <H3 className="text-white">Available Languages</H3>
              </Stack>
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-pulse text-muted-foreground">Loading languages...</div>
                </div>
              )}
              <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
                {languages.map((lang) => (
                  <Card 
                    key={lang.code} 
                    inverted 
                    interactive
                    variant={lang.code === selectedLanguage ? "elevated" : "default"}
                    className="cursor-pointer p-4"
                    onClick={() => handleLanguageSelect(lang)}
                  >
                    <Stack gap={3}>
                      <Stack direction="horizontal" className="items-start justify-between">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{lang.nativeName}</Body>
                          <Label size="xs" className="text-on-dark-muted">{lang.name}</Label>
                        </Stack>
                        {lang.code === selectedLanguage && <Check className="size-5 text-success" />}
                        {lang.isDefault && <Badge variant="outline">Default</Badge>}
                      </Stack>
                      <Stack direction="horizontal" className="items-center justify-between">
                        <Label size="xs" className="text-on-dark-disabled">Translation Coverage</Label>
                        <Label size="xs" className={getCoverageColor(lang.coverage)}>{lang.coverage}%</Label>
                      </Stack>
                      <ProgressBar
                        value={lang.coverage}
                        max={100}
                        variant={lang.coverage >= 95 ? "success" : "warning"}
                        size="sm"
                      />
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>

            {/* Translation Info */}
            <Card inverted className="p-6">
              <Stack gap={4}>
                <H3 className="text-white">Translation Information</H3>
                <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
                  <Stack gap={2}>
                    <Label size="sm" className="text-on-dark-muted">What gets translated:</Label>
                    <Stack gap={1}>
                      {["Navigation and menus", "Buttons and labels", "System messages", "Help content", "Email notifications"].map((item) => (
                        <Stack key={item} direction="horizontal" gap={2}>
                          <Check className="size-4 text-success" />
                          <Label size="sm" className="text-white">{item}</Label>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                  <Stack gap={2}>
                    <Label size="sm" className="text-on-dark-muted">What stays in original language:</Label>
                    <Stack gap={1}>
                      {["Event names and descriptions", "Artist names", "Venue information", "User reviews", "Chat messages"].map((item) => (
                        <Stack key={item} direction="horizontal" gap={2}>
                          <Text className="text-on-dark-disabled">•</Text>
                          <Label size="sm" className="text-white">{item}</Label>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Grid>
              </Stack>
            </Card>

            {/* Actions */}
            <Stack gap={4}>
              <Stack gap={2}>
                <Label size="sm" className="text-on-dark-muted">Missing your language?</Label>
                <Button variant="outlineInk">Request a Language</Button>
              </Stack>
              <Button variant="ghost" onClick={() => router.push("/settings")}>← Back to Settings</Button>
            </Stack>
          </Stack>
      <Modal open={showConfirmModal} onClose={() => { setShowConfirmModal(false); setPendingLanguage(null); }}>
        <ModalHeader><H3>Change Language</H3></ModalHeader>
        <ModalBody>
          {pendingLanguage && (
            <Stack gap={4}>
              <Body>Are you sure you want to change your language to <strong>{pendingLanguage.nativeName}</strong>?</Body>
              <Card inverted className="p-4">
                <Stack direction="horizontal" className="justify-between">
                  <Stack gap={1}>
                    <Label size="sm" className="text-on-dark-muted">From</Label>
                    <Body className="text-white">{currentLanguage?.nativeName}</Body>
                  </Stack>
                  <Label className="text-on-dark-muted">→</Label>
                  <Stack gap={1}>
                    <Label size="sm" className="text-on-dark-muted">To</Label>
                    <Body className="font-display text-white">{pendingLanguage.nativeName}</Body>
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
    </>
  );
}
