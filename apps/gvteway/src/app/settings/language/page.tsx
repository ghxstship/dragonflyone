"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConsumerNavigationPublic } from "@/components/navigation";
import {
  Container, H2, H3, Body, Label, Grid, Stack, Button,
  Section, Card, Badge, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter,
  PageLayout, Footer, FooterColumn, FooterLink, Display, Kicker,
} from "@ghxstship/ui";
import { Globe, Check } from "lucide-react";

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
    <PageLayout
      background="black"
      header={<ConsumerNavigationPublic />}
      footer={
        <Footer
          logo={<Display size="md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES. ALL RIGHTS RESERVED."
        >
          <FooterColumn title="Account">
            <FooterLink href="/settings">Settings</FooterLink>
            <FooterLink href="/profile">Profile</FooterLink>
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
              <Grid cols={3} gap={4}>
                {mockLanguages.map((lang) => (
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
                      <div className="h-2 overflow-hidden rounded-badge bg-ink-700">
                        <div
                          className={`h-full ${lang.coverage >= 95 ? "bg-success" : "bg-warning"}`}
                          style={{ width: `${lang.coverage}%` }}
                        />
                      </div>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </Stack>

            {/* Translation Info */}
            <Card inverted className="p-6">
              <Stack gap={4}>
                <H3 className="text-white">Translation Information</H3>
                <Grid cols={2} gap={6}>
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
                          <span className="text-on-dark-disabled">•</span>
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
        </Container>
      </Section>

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
    </PageLayout>
  );
}
