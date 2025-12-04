"use client";

import { useRouter } from "next/navigation";
import {
  useNotifications,
  Body,
  Button,
  Switch,
  Select,
  Label,
  Container,
  Stack,
  Grid,
  Card,
  Section,
  EnterprisePageHeader,
  MainContent,
  H3,
  Badge,
} from "@ghxstship/ui";
import { AtlvsAppLayout } from "../../../components/app-layout";
import { useAppearance, type AccentColor, type Density, type BorderRadius, type ThemeMode } from "../../../hooks/useAppearance";

const ACCENT_COLOR_OPTIONS: { value: AccentColor; label: string; color: string }[] = [
  { value: 'indigo', label: 'Indigo', color: '#6366f1' },
  { value: 'violet', label: 'Violet', color: '#8b5cf6' },
  { value: 'amber', label: 'Amber', color: '#f59e0b' },
  { value: 'emerald', label: 'Emerald', color: '#10b981' },
  { value: 'rose', label: 'Rose', color: '#f43f5e' },
  { value: 'cyan', label: 'Cyan', color: '#06b6d4' },
];

const DENSITY_OPTIONS: { value: Density; label: string; description: string }[] = [
  { value: 'compact', label: 'Compact', description: 'Reduced spacing for dense information' },
  { value: 'default', label: 'Default', description: 'Balanced spacing for most users' },
  { value: 'comfortable', label: 'Comfortable', description: 'Extra spacing for readability' },
];

const BORDER_RADIUS_OPTIONS: { value: BorderRadius; label: string }[] = [
  { value: 'sharp', label: 'Sharp' },
  { value: 'default', label: 'Default' },
  { value: 'rounded', label: 'Rounded' },
];

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'system', label: 'System' },
];

const FONT_SCALE_OPTIONS = [
  { value: '0.85', label: 'Small (85%)' },
  { value: '0.9', label: 'Compact (90%)' },
  { value: '1', label: 'Default (100%)' },
  { value: '1.1', label: 'Large (110%)' },
  { value: '1.2', label: 'Extra Large (120%)' },
];

export default function AppearanceSettingsPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const { settings, updateSetting, resetToDefaults, presets } = useAppearance();

  const handleSave = () => {
    addNotification({
      type: 'success',
      title: 'Appearance Saved',
      message: 'Your appearance preferences have been saved.',
    });
  };

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Appearance"
        subtitle="Customize the look and feel of your workspace"
        breadcrumbs={[
          { label: 'ATLVS', href: '/dashboard' },
          { label: 'Settings', href: '/settings' },
          { label: 'Appearance' },
        ]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>
            {/* Quick Presets */}
            <Section border noPadding title="Quick Presets">
              <Grid cols={4} gap={4}>
                <Button
                  variant="outlineInk"
                  fullWidth
                  onClick={() => presets.applyPreset('default')}
                >
                  <Stack gap={1} className="text-left">
                    <Body className="font-heading uppercase tracking-label text-white">Default</Body>
                    <Body className="text-body-sm text-ink-400">Standard appearance</Body>
                  </Stack>
                </Button>
                <Button
                  variant="outlineInk"
                  fullWidth
                  onClick={() => presets.applyPreset('compact')}
                >
                  <Stack gap={1} className="text-left">
                    <Body className="font-heading uppercase tracking-label text-white">Compact</Body>
                    <Body className="text-body-sm text-ink-400">Dense information view</Body>
                  </Stack>
                </Button>
                <Button
                  variant="outlineInk"
                  fullWidth
                  onClick={() => presets.applyPreset('comfortable')}
                >
                  <Stack gap={1} className="text-left">
                    <Body className="font-heading uppercase tracking-label text-white">Comfortable</Body>
                    <Body className="text-body-sm text-ink-400">Relaxed spacing</Body>
                  </Stack>
                </Button>
                <Button
                  variant="outlineInk"
                  fullWidth
                  onClick={() => presets.applyPreset('highContrast')}
                >
                  <Stack gap={1} className="text-left">
                    <Body className="font-heading uppercase tracking-label text-white">High Contrast</Body>
                    <Body className="text-body-sm text-ink-400">Enhanced visibility</Body>
                  </Stack>
                </Button>
              </Grid>
            </Section>

            {/* Theme Settings */}
            <Section border noPadding title="Theme">
              <Stack gap={4}>
                <Grid cols={2} gap={6}>
                  <Stack gap={2}>
                    <Label>Color Mode</Label>
                    <Select
                      value={settings.theme}
                      onChange={(e) => updateSetting('theme', e.target.value as ThemeMode)}
                      inverted
                      fullWidth
                    >
                      {THEME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </Stack>
                  <Stack gap={2}>
                    <Label>High Contrast</Label>
                    <Card className="flex items-center justify-between border-ink-800 bg-transparent p-spacing-4">
                      <Body className="text-ink-400">Increase contrast for better visibility</Body>
                      <Switch
                        checked={settings.highContrast}
                        onChange={(e) => updateSetting('highContrast', e.target.checked)}
                      />
                    </Card>
                  </Stack>
                </Grid>
              </Stack>
            </Section>

            {/* Accent Color */}
            <Section border noPadding title="Accent Color">
              <Grid cols={6} gap={3}>
                {ACCENT_COLOR_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateSetting('accentColor', option.value)}
                    className={`
                      flex flex-col items-center gap-2 border-2 p-4 transition-all
                      ${settings.accentColor === option.value
                        ? 'border-white bg-ink-800'
                        : 'border-ink-700 bg-transparent hover:border-ink-500'
                      }
                    `}
                  >
                    <div
                      className="size-8 rounded-avatar border-2 border-ink-600"
                      style={{ backgroundColor: option.color }}
                    />
                    <Body className="text-body-sm text-white">{option.label}</Body>
                    {settings.accentColor === option.value && (
                      <Badge variant="solid">Active</Badge>
                    )}
                  </button>
                ))}
              </Grid>
            </Section>

            {/* Density & Spacing */}
            <Section border noPadding title="Density">
              <Stack gap={4}>
                {DENSITY_OPTIONS.map((option) => (
                  <Card
                    key={option.value}
                    className={`
                      flex cursor-pointer items-center justify-between p-spacing-4 transition-all
                      ${settings.density === option.value
                        ? 'border-white bg-ink-800'
                        : 'border-ink-800 bg-transparent hover:border-ink-600'
                      }
                    `}
                    onClick={() => updateSetting('density', option.value)}
                  >
                    <Stack gap={1}>
                      <Body className="font-heading uppercase tracking-label text-white">
                        {option.label}
                      </Body>
                      <Body className="text-body-sm text-ink-400">{option.description}</Body>
                    </Stack>
                    {settings.density === option.value && (
                      <Badge variant="solid">Selected</Badge>
                    )}
                  </Card>
                ))}
              </Stack>
            </Section>

            {/* Typography */}
            <Section border noPadding title="Typography">
              <Grid cols={2} gap={6}>
                <Stack gap={2}>
                  <Label>Font Scale</Label>
                  <Select
                    value={String(settings.fontScale)}
                    onChange={(e) => updateSetting('fontScale', parseFloat(e.target.value))}
                    inverted
                    fullWidth
                  >
                    {FONT_SCALE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Stack>
                <Stack gap={2}>
                  <Label>Border Radius</Label>
                  <Select
                    value={settings.borderRadius}
                    onChange={(e) => updateSetting('borderRadius', e.target.value as BorderRadius)}
                    inverted
                    fullWidth
                  >
                    {BORDER_RADIUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Stack>
              </Grid>
            </Section>

            {/* Motion & Animations */}
            <Section border noPadding title="Motion">
              <Stack gap={4}>
                <Card className="flex items-center justify-between border-ink-800 bg-transparent p-spacing-4">
                  <Stack gap={1}>
                    <Body className="text-white">Enable Animations</Body>
                    <Body className="text-body-sm text-ink-400">
                      Show transitions and micro-interactions
                    </Body>
                  </Stack>
                  <Switch
                    checked={settings.animationsEnabled}
                    onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
                  />
                </Card>
                <Card className="flex items-center justify-between border-ink-800 bg-transparent p-spacing-4">
                  <Stack gap={1}>
                    <Body className="text-white">Reduced Motion</Body>
                    <Body className="text-body-sm text-ink-400">
                      Minimize motion for accessibility
                    </Body>
                  </Stack>
                  <Switch
                    checked={settings.reducedMotion}
                    onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                  />
                </Card>
              </Stack>
            </Section>

            {/* Layout */}
            <Section border noPadding title="Layout">
              <Stack gap={4}>
                <Card className="flex items-center justify-between border-ink-800 bg-transparent p-spacing-4">
                  <Stack gap={1}>
                    <Body className="text-white">Collapse Sidebar by Default</Body>
                    <Body className="text-body-sm text-ink-400">
                      Start with a minimized sidebar for more content space
                    </Body>
                  </Stack>
                  <Switch
                    checked={settings.sidebarCollapsed}
                    onChange={(e) => updateSetting('sidebarCollapsed', e.target.checked)}
                  />
                </Card>
              </Stack>
            </Section>

            {/* Preview Card */}
            <Section border noPadding title="Preview">
              <Card className="border-2 border-ink-700 bg-ink-900 p-6">
                <Stack gap={4}>
                  <H3 className="text-white">Sample Card</H3>
                  <Body className="text-ink-300">
                    This preview shows how your appearance settings affect the interface.
                    Changes are applied in real-time.
                  </Body>
                  <Stack direction="horizontal" gap={3}>
                    <Button variant="solid">Primary Action</Button>
                    <Button variant="outline">Secondary</Button>
                    <Button variant="ghost">Tertiary</Button>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Badge variant="solid">Active</Badge>
                    <Badge variant="outline">Pending</Badge>
                    <Badge>Default</Badge>
                  </Stack>
                </Stack>
              </Card>
            </Section>

            {/* Actions */}
            <Stack gap={3} direction="horizontal">
              <Button variant="outlineWhite" onClick={handleSave}>
                Save Changes
              </Button>
              <Button
                variant="ghost"
                className="text-grey-400 hover:text-white"
                onClick={resetToDefaults}
              >
                Reset to Defaults
              </Button>
              <Button
                variant="ghost"
                className="text-grey-400 hover:text-white"
                onClick={() => router.push('/settings')}
              >
                Back to Settings
              </Button>
            </Stack>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
