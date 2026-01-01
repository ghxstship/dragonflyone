"use client";

/**
 * GVTEWAY Language Settings Page
 * Choose preferred language for the app
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import {
  Body,
  Button,
  Card,
  Grid,
  Badge,
  Modal,
  ProgressBar,
  useToast,
  DetailPage,
  Section,
  SectionHeader,
  Box,
  Stack,
} from "@ghxstship/ui";
import { Globe, Check, Info } from "lucide-react";
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
  const toast = useToast();
  const { languages: apiLanguages, isLoading, error, refetch } = useLanguageSettings();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingLanguage, setPendingLanguage] = useState<Language | null>(null);

  const languages: Language[] = apiLanguages.length > 0 ? (apiLanguages as unknown as Language[]) : (DEMO_LANGUAGES as unknown as Language[]);
  const currentLanguage = languages.find((l) => l.code === selectedLanguage);

  const handleLanguageSelect = (lang: Language) => {
    if (lang.code !== selectedLanguage) {
      setPendingLanguage(lang);
      setShowConfirmModal(true);
    }
  };

  const confirmLanguageChange = () => {
    if (pendingLanguage) {
      setSelectedLanguage(pendingLanguage.code);
      toast.success("Language Changed", `Language set to ${pendingLanguage.nativeName}`);
    }
    setShowConfirmModal(false);
    setPendingLanguage(null);
  };

  const getCoverageVariant = (coverage: number): "success" | "warning" => {
    return coverage >= 95 ? "success" : "warning";
  };

  const tabs = [
    {
      id: "languages",
      label: "Languages",
      icon: <Globe className="size-4" />,
      content: (
        <Section>
          <Card className="p-6 mb-6">
            <Box className="flex items-center justify-between">
              <Box>
                <Body size="sm" className="text-on-dark-muted mb-1">Current Language</Body>
                <Body className="font-weight-medium text-white">{currentLanguage?.nativeName} ({currentLanguage?.name})</Body>
              </Box>
              <Badge variant="success">Active</Badge>
            </Box>
          </Card>

          <SectionHeader title="Available Languages" description="Select your preferred language" />

          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {languages.map((lang) => (
              <Card
                key={lang.code}
                className={`p-4 cursor-pointer transition-all ${lang.code === selectedLanguage ? "ring-2 ring-primary" : ""}`}
                onClick={() => handleLanguageSelect(lang)}
              >
                <Box className="flex items-start justify-between mb-3">
                  <Box>
                    <Body className="font-weight-medium text-white">{lang.nativeName}</Body>
                    <Body size="sm" className="text-on-dark-muted">{lang.name}</Body>
                  </Box>
                  <Box className="flex items-center gap-2">
                    {lang.code === selectedLanguage && <Check className="size-5 text-success" />}
                    {lang.isDefault && <Badge variant="outline">Default</Badge>}
                  </Box>
                </Box>
                <Box className="flex items-center justify-between mb-2">
                  <Body size="sm" className="text-on-dark-disabled">Translation Coverage</Body>
                  <Body size="sm" className={lang.coverage >= 95 ? "text-success" : "text-warning"}>{lang.coverage}%</Body>
                </Box>
                <ProgressBar value={lang.coverage} max={100} variant={getCoverageVariant(lang.coverage)} size="sm" />
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
    {
      id: "info",
      label: "Information",
      icon: <Info className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Translation Information" description="What gets translated and what stays in original language" />
          <Grid cols={2} gap={6} className="grid-cols-1 lg:grid-cols-2">
            <Card className="p-6">
              <Body className="font-weight-medium text-white mb-4">What gets translated:</Body>
              <Stack gap={2}>
                {["Navigation and menus", "Buttons and labels", "System messages", "Help content", "Email notifications"].map((item) => (
                  <Box key={item} className="flex items-center gap-2">
                    <Check className="size-4 text-success" />
                    <Body size="sm" className="text-white">{item}</Body>
                  </Box>
                ))}
              </Stack>
            </Card>
            <Card className="p-6">
              <Body className="font-weight-medium text-white mb-4">What stays in original language:</Body>
              <Stack gap={2}>
                {["Event names and descriptions", "Artist names", "Venue information", "User reviews", "Chat messages"].map((item) => (
                  <Box key={item} className="flex items-center gap-2">
                    <Box className="size-1 rounded-avatar bg-grey-500" />
                    <Body size="sm" className="text-white">{item}</Body>
                  </Box>
                ))}
              </Stack>
            </Card>
          </Grid>

          <Box className="mt-6">
            <Body size="sm" className="text-on-dark-muted mb-2">Missing your language?</Body>
            <Button variant="outline">Request a Language</Button>
          </Box>
        </Section>
      ),
    },
  ];

  return (
    <>
      <DetailPage
        header={{
          kicker: "Settings",
          title: "Language Settings",
          description: "Choose your preferred language for the app",
        }}
        loading={isLoading}
        error={error instanceof Error ? error : null}
        onRetry={refetch}
        tabs={tabs}
        backButton={{ label: "Settings", href: "/settings" }}
      />

      <Modal open={showConfirmModal} onClose={() => { setShowConfirmModal(false); setPendingLanguage(null); }} title="Change Language">
        {pendingLanguage && (
          <Stack gap={4}>
            <Body>Are you sure you want to change your language to <strong>{pendingLanguage.nativeName}</strong>?</Body>
            <Card className="p-4">
              <Box className="flex items-center justify-between">
                <Box>
                  <Body size="sm" className="text-on-dark-muted">From</Body>
                  <Body className="text-white">{currentLanguage?.nativeName}</Body>
                </Box>
                <Body className="text-on-dark-muted">→</Body>
                <Box>
                  <Body size="sm" className="text-on-dark-muted">To</Body>
                  <Body className="font-weight-medium text-white">{pendingLanguage.nativeName}</Body>
                </Box>
              </Box>
            </Card>
            {pendingLanguage.coverage < 90 && (
              <Card className="p-4 bg-warning-900 border-warning-500">
                <Body size="sm" className="text-warning-100">
                  This language has {pendingLanguage.coverage}% translation coverage. Some content may appear in English.
                </Body>
              </Card>
            )}
            <Box className="flex gap-4">
              <Button variant="outline" onClick={() => { setShowConfirmModal(false); setPendingLanguage(null); }}>Cancel</Button>
              <Button variant="solid" onClick={confirmLanguageChange}>Change Language</Button>
            </Box>
          </Stack>
        )}
      </Modal>
    </>
  );
}
