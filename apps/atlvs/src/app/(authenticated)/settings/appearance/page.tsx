"use client";

/**
 * Appearance Settings Page
 * Theme, font size, and display preferences
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Body,
  Button,
  Card,
  Grid,
  Box,
  Stack,
  SettingsPageLayout,
  SectionHeader,
  Alert,
  Badge,
} from "@ghxstship/ui";
import {
  Sun,
  Moon,
  Monitor,
  Save,
  Check,
  Type,
  Layout,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  fontSize: "small" | "medium" | "large";
  compactMode: boolean;
  reducedMotion: boolean;
}

const DEFAULT_SETTINGS: AppearanceSettings = {
  theme: "system",
  fontSize: "medium",
  compactMode: false,
  reducedMotion: false,
};

async function fetchAppearanceSettings(): Promise<AppearanceSettings> {
  const response = await fetch("/api/settings/appearance");
  if (!response.ok) return DEFAULT_SETTINGS;
  const data = await response.json();
  return data.settings || DEFAULT_SETTINGS;
}

async function updateAppearanceSettings(settings: AppearanceSettings): Promise<AppearanceSettings> {
  const response = await fetch("/api/settings/appearance", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (!response.ok) throw new Error("Failed to update settings");
  return response.json();
}

export default function AppearanceSettingsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { data: settings = DEFAULT_SETTINGS, isLoading, error } = useQuery({
    queryKey: ["appearance-settings"],
    queryFn: fetchAppearanceSettings,
  });

  const [formData, setFormData] = useState<Partial<AppearanceSettings>>({});

  const mutation = useMutation({
    mutationFn: updateAppearanceSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appearance-settings"] });
      setSuccessMessage("Appearance settings updated");
      setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const displayData = { ...settings, ...formData };

  // Extract inline functions to useCallback for better performance with memoized children
  const handleCancel = useCallback(() => {
    router.push("/settings");
  }, [router]);

  const handleThemeChange = useCallback((theme: AppearanceSettings["theme"]) => {
    setFormData((prev) => ({ ...prev, theme }));
  }, []);

  const handleFontSizeChange = useCallback((fontSize: AppearanceSettings["fontSize"]) => {
    setFormData((prev) => ({ ...prev, fontSize }));
  }, []);

  const handleToggle = useCallback((field: "compactMode" | "reducedMotion") => {
    setFormData((prev) => ({ ...prev, [field]: !displayData[field] }));
  }, [displayData]);

  const handleSubmit = useCallback(() => {
    mutation.mutate({ ...settings, ...formData });
  }, [mutation, settings, formData]);

  const themeOptions = [
    { id: "light", label: "Light", icon: <Sun className="size-5" /> },
    { id: "dark", label: "Dark", icon: <Moon className="size-5" /> },
    { id: "system", label: "System", icon: <Monitor className="size-5" /> },
  ] as const;

  const fontSizeOptions = [
    { id: "small", label: "Small", size: "14px" },
    { id: "medium", label: "Medium", size: "16px" },
    { id: "large", label: "Large", size: "18px" },
  ] as const;

  if (isLoading) {
    return (
      <SettingsPageLayout
        title="Appearance Settings"
        description="Customize your visual preferences"
        maxWidth="lg"
      >
        <Stack gap={4} className="animate-pulse">
          <Box className="h-48 bg-surface-secondary rounded-card" />
          <Box className="h-48 bg-surface-secondary rounded-card" />
        </Stack>
      </SettingsPageLayout>
    );
  }

  if (error) {
    return (
      <SettingsPageLayout
        title="Appearance Settings"
        description="Customize your visual preferences"
        maxWidth="lg"
      >
        <Alert variant="error">
          {error instanceof Error ? error.message : "Failed to load settings"}
        </Alert>
      </SettingsPageLayout>
    );
  }

  return (
    <SettingsPageLayout
      title="Appearance Settings"
      description="Customize your visual preferences"
      maxWidth="lg"
    >
      <Stack gap={6}>
        {successMessage && (
          <Alert variant="success" className="mb-6">
            {successMessage}
          </Alert>
        )}

        {mutation.error && (
          <Alert variant="error" className="mb-6">
            {mutation.error instanceof Error ? mutation.error.message : "Failed to update settings"}
          </Alert>
        )}

        <Card className="p-6 mb-6">
          <SectionHeader
            title="Theme"
            description="Choose your preferred color scheme"
          />
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mt-4" data-testid="theme-selection">
            {themeOptions.map((option) => (
              <Card
                key={option.id}
                className={`p-4 cursor-pointer transition-all ${
                  displayData.theme === option.id
                    ? "border-primary border-2 bg-primary/5"
                    : "border-border-primary hover:border-primary/50"
                }`}
                onClick={() => handleThemeChange(option.id)}
              >
                <Box className="flex items-center justify-between">
                  <Box className="flex items-center gap-3">
                    <Box className={`p-2 rounded-card ${
                      displayData.theme === option.id ? "bg-primary text-text-primary" : "bg-surface-secondary"
                    }`}>
                      {option.icon}
                    </Box>
                    <Body className="font-weight-medium">{option.label}</Body>
                  </Box>
                  {displayData.theme === option.id && (
                    <Check className="size-5 text-primary" />
                  )}
                </Box>
              </Card>
            ))}
          </Grid>
        </Card>

        <Card className="p-6 mb-6">
          <SectionHeader
            title="Font Size"
            description="Adjust the text size across the application"
          />
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mt-4" data-testid="font-size">
            {fontSizeOptions.map((option) => (
              <Card
                key={option.id}
                className={`p-4 cursor-pointer transition-all ${
                  displayData.fontSize === option.id
                    ? "border-primary border-2 bg-primary/5"
                    : "border-border-primary hover:border-primary/50"
                }`}
                onClick={() => handleFontSizeChange(option.id)}
              >
                <Box className="flex items-center justify-between">
                  <Box className="flex items-center gap-3">
                    <Type className="size-5" />
                    <Stack gap={0}>
                      <Body className="font-weight-medium">{option.label}</Body>
                      <Body size="sm" className="text-text-muted">{option.size}</Body>
                    </Stack>
                  </Box>
                  {displayData.fontSize === option.id && (
                    <Check className="size-5 text-primary" />
                  )}
                </Box>
              </Card>
            ))}
          </Grid>
        </Card>

        <Card className="p-6 mb-6">
          <SectionHeader
            title="Display Options"
            description="Additional display preferences"
          />
          <Stack gap={4} className="mt-4">
            <Card
              className={`p-4 cursor-pointer transition-all ${
                displayData.compactMode
                  ? "border-primary border-2 bg-primary/5"
                  : "border-border-primary hover:border-primary/50"
              }`}
              onClick={() => handleToggle("compactMode")}
              data-testid="compact-mode"
            >
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-3">
                  <Layout className="size-5" />
                  <Box>
                    <Body className="font-weight-medium">Compact Mode</Body>
                    <Body size="sm" className="text-text-muted">
                      Reduce spacing and padding for denser layouts
                    </Body>
                  </Box>
                </Box>
                <Badge variant={displayData.compactMode ? "success" : "outline"}>
                  {displayData.compactMode ? "On" : "Off"}
                </Badge>
              </Box>
            </Card>

            <Card
              className={`p-4 cursor-pointer transition-all ${
                displayData.reducedMotion
                  ? "border-primary border-2 bg-primary/5"
                  : "border-border-primary hover:border-primary/50"
              }`}
              onClick={() => handleToggle("reducedMotion")}
            >
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-3">
                  <Monitor className="size-5" />
                  <Box>
                    <Body className="font-weight-medium">Reduced Motion</Body>
                    <Body size="sm" className="text-text-muted">
                      Minimize animations and transitions
                    </Body>
                  </Box>
                </Box>
                <Badge variant={displayData.reducedMotion ? "success" : "outline"}>
                  {displayData.reducedMotion ? "On" : "Off"}
                </Badge>
              </Box>
            </Card>
          </Stack>
        </Card>

        <Box className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            variant="solid"
            onClick={handleSubmit}
            disabled={mutation.isPending}
          >
            <Save className="size-4 mr-2" />
            {mutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </Box>
      </Stack>
    </SettingsPageLayout>
  );
}
