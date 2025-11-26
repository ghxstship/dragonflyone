"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Container,
  H1,
  H2,
  H3,
  Body,
  Label,
  Grid,
  Stack,
  Button,
  Section as UISection,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Input,
  Textarea,
  Select,
  Alert,
} from "@ghxstship/ui";

interface LandingSection {
  id: string;
  type: "hero" | "lineup" | "tickets" | "venue" | "sponsors" | "faq" | "gallery" | "countdown" | "social" | "custom";
  title: string;
  enabled: boolean;
  order: number;
  settings: Record<string, unknown>;
}

interface LandingPageConfig {
  id: string;
  eventId: string;
  template: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  sections: LandingSection[];
  seoTitle: string;
  seoDescription: string;
  ogImage?: string;
  customCss?: string;
  published: boolean;
}

const defaultSections: LandingSection[] = [
  { id: "hero", type: "hero", title: "Hero Section", enabled: true, order: 1, settings: { showCountdown: true, backgroundType: "image" } },
  { id: "lineup", type: "lineup", title: "Artist Lineup", enabled: true, order: 2, settings: { layout: "grid", showBios: true } },
  { id: "tickets", type: "tickets", title: "Tickets", enabled: true, order: 3, settings: { showPricing: true, ctaText: "Get Tickets" } },
  { id: "venue", type: "venue", title: "Venue & Location", enabled: true, order: 4, settings: { showMap: true, showDirections: true } },
  { id: "sponsors", type: "sponsors", title: "Sponsors", enabled: false, order: 5, settings: { layout: "carousel" } },
  { id: "faq", type: "faq", title: "FAQ", enabled: true, order: 6, settings: { expandable: true } },
  { id: "gallery", type: "gallery", title: "Photo Gallery", enabled: false, order: 7, settings: { layout: "masonry" } },
  { id: "social", type: "social", title: "Social Feed", enabled: false, order: 8, settings: { platforms: ["instagram", "twitter"] } },
];

const templates = [
  { id: "minimal", name: "Minimal", description: "Clean, modern design with focus on content" },
  { id: "bold", name: "Bold", description: "High-impact visuals with strong typography" },
  { id: "festival", name: "Festival", description: "Vibrant, energetic design for multi-day events" },
  { id: "corporate", name: "Corporate", description: "Professional, polished design for business events" },
  { id: "concert", name: "Concert", description: "Artist-focused design with immersive imagery" },
];

const fontOptions = [
  { id: "anton", name: "Anton", preview: "BOLD IMPACT" },
  { id: "bebas", name: "Bebas Neue", preview: "CLEAN HEADERS" },
  { id: "inter", name: "Inter", preview: "Modern Sans" },
  { id: "playfair", name: "Playfair Display", preview: "Elegant Serif" },
  { id: "space", name: "Space Grotesk", preview: "Tech Forward" },
];

export default function LandingBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [activeTab, setActiveTab] = useState("design");
  const [config, setConfig] = useState<LandingPageConfig>({
    id: "LP-001",
    eventId,
    template: "bold",
    primaryColor: "#000000",
    secondaryColor: "#FFFFFF",
    fontFamily: "anton",
    sections: defaultSections,
    seoTitle: "Event Name - Get Your Tickets Now",
    seoDescription: "Join us for an unforgettable experience. Limited tickets available.",
    published: false,
  });
  const [showPreview, setShowPreview] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<LandingSection | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSectionToggle = (sectionId: string) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId ? { ...s, enabled: !s.enabled } : s
      ),
    }));
  };

  const handleSectionReorder = (sectionId: string, direction: "up" | "down") => {
    setConfig((prev) => {
      const sections = [...prev.sections];
      const index = sections.findIndex((s) => s.id === sectionId);
      if (direction === "up" && index > 0) {
        [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
      } else if (direction === "down" && index < sections.length - 1) {
        [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
      }
      return { ...prev, sections: sections.map((s, i) => ({ ...s, order: i + 1 })) };
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handlePublish = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setConfig((prev) => ({ ...prev, published: true }));
    setIsSaving(false);
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />

      <Container className="py-8">
        <Stack gap={8}>
          <Stack direction="horizontal" className="justify-between items-center">
            <Stack gap={2}>
              <H1>Landing Page Builder</H1>
              <Label className="text-ink-400">
                Design and customize your event landing page
              </Label>
            </Stack>
            <Stack direction="horizontal" gap={4}>
              <Badge variant={config.published ? "solid" : "outline"}>
                {config.published ? "Published" : "Draft"}
              </Badge>
              <Button variant="outline" onClick={() => setShowPreview(true)}>
                Preview
              </Button>
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Draft"}
              </Button>
              <Button variant="solid" onClick={handlePublish} disabled={isSaving}>
                Publish
              </Button>
            </Stack>
          </Stack>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "design"} onClick={() => setActiveTab("design")}>Design</Tab>
              <Tab active={activeTab === "sections"} onClick={() => setActiveTab("sections")}>Sections</Tab>
              <Tab active={activeTab === "seo"} onClick={() => setActiveTab("seo")}>SEO & Meta</Tab>
              <Tab active={activeTab === "advanced"} onClick={() => setActiveTab("advanced")}>Advanced</Tab>
            </TabsList>

            <TabPanel active={activeTab === "design"}>
              <Grid cols={2} gap={8}>
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={6}>
                    <H3>Template</H3>
                    <Grid cols={1} gap={4}>
                      {templates.map((template) => (
                        <Card
                          key={template.id}
                          className={`p-4 cursor-pointer transition-all ${
                            config.template === template.id
                              ? "border-2 border-white bg-ink-800"
                              : "border border-ink-700 hover:border-ink-500"
                          }`}
                          onClick={() => setConfig((prev) => ({ ...prev, template: template.id }))}
                        >
                          <Stack gap={1}>
                            <Label className="text-white font-display">{template.name}</Label>
                            <Label size="xs" className="text-ink-400">{template.description}</Label>
                          </Stack>
                        </Card>
                      ))}
                    </Grid>
                  </Stack>
                </Card>

                <Stack gap={6}>
                  <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <H3>Colors</H3>
                      <Grid cols={2} gap={4}>
                        <Stack gap={2}>
                          <Label>Primary Color</Label>
                          <Stack direction="horizontal" gap={2}>
                            <Input
                              type="color"
                              value={config.primaryColor}
                              onChange={(e) => setConfig((prev) => ({ ...prev, primaryColor: e.target.value }))}
                              className="w-12 h-10 p-1 border-ink-700"
                            />
                            <Input
                              value={config.primaryColor}
                              onChange={(e) => setConfig((prev) => ({ ...prev, primaryColor: e.target.value }))}
                              className="border-ink-700 bg-black text-white font-mono"
                            />
                          </Stack>
                        </Stack>
                        <Stack gap={2}>
                          <Label>Secondary Color</Label>
                          <Stack direction="horizontal" gap={2}>
                            <Input
                              type="color"
                              value={config.secondaryColor}
                              onChange={(e) => setConfig((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                              className="w-12 h-10 p-1 border-ink-700"
                            />
                            <Input
                              value={config.secondaryColor}
                              onChange={(e) => setConfig((prev) => ({ ...prev, secondaryColor: e.target.value }))}
                              className="border-ink-700 bg-black text-white font-mono"
                            />
                          </Stack>
                        </Stack>
                      </Grid>
                    </Stack>
                  </Card>

                  <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <H3>Typography</H3>
                      <Stack gap={2}>
                        <Label>Font Family</Label>
                        <Grid cols={1} gap={2}>
                          {fontOptions.map((font) => (
                            <Card
                              key={font.id}
                              className={`p-3 cursor-pointer transition-all ${
                                config.fontFamily === font.id
                                  ? "border-2 border-white bg-ink-800"
                                  : "border border-ink-700 hover:border-ink-500"
                              }`}
                              onClick={() => setConfig((prev) => ({ ...prev, fontFamily: font.id }))}
                            >
                              <Stack direction="horizontal" className="justify-between items-center">
                                <Label className="text-white">{font.name}</Label>
                                <Label className="text-ink-400">{font.preview}</Label>
                              </Stack>
                            </Card>
                          ))}
                        </Grid>
                      </Stack>
                    </Stack>
                  </Card>
                </Stack>
              </Grid>
            </TabPanel>

            <TabPanel active={activeTab === "sections"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={6}>
                  <Stack direction="horizontal" className="justify-between items-center">
                    <H3>Page Sections</H3>
                    <Button variant="outline" size="sm">
                      Add Custom Section
                    </Button>
                  </Stack>

                  <Stack gap={2}>
                    {config.sections
                      .sort((a, b) => a.order - b.order)
                      .map((section, index) => (
                        <Card
                          key={section.id}
                          className={`p-4 ${
                            section.enabled ? "border border-ink-700" : "border border-ink-800 opacity-50"
                          }`}
                        >
                          <Grid cols={4} gap={4} className="items-center">
                            <Stack direction="horizontal" gap={4}>
                              <Stack direction="horizontal" gap={1}>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSectionReorder(section.id, "up")}
                                  disabled={index === 0}
                                >
                                  ↑
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSectionReorder(section.id, "down")}
                                  disabled={index === config.sections.length - 1}
                                >
                                  ↓
                                </Button>
                              </Stack>
                              <Stack gap={1}>
                                <Label className="text-white font-display">{section.title}</Label>
                                <Badge variant="outline">{section.type}</Badge>
                              </Stack>
                            </Stack>

                            <Label className="text-ink-400">Order: {section.order}</Label>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSection(section);
                                setShowSectionModal(true);
                              }}
                            >
                              Configure
                            </Button>

                            <Button
                              variant={section.enabled ? "outline" : "solid"}
                              size="sm"
                              onClick={() => handleSectionToggle(section.id)}
                            >
                              {section.enabled ? "Disable" : "Enable"}
                            </Button>
                          </Grid>
                        </Card>
                      ))}
                  </Stack>
                </Stack>
              </Card>
            </TabPanel>

            <TabPanel active={activeTab === "seo"}>
              <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                <Stack gap={6}>
                  <H3>SEO & Meta Tags</H3>

                  <Stack gap={4}>
                    <Stack gap={2}>
                      <Label>Page Title</Label>
                      <Input
                        value={config.seoTitle}
                        onChange={(e) => setConfig((prev) => ({ ...prev, seoTitle: e.target.value }))}
                        placeholder="Event Name - Get Your Tickets Now"
                        className="border-ink-700 bg-black text-white"
                      />
                      <Label size="xs" className="text-ink-500">
                        {config.seoTitle.length}/60 characters recommended
                      </Label>
                    </Stack>

                    <Stack gap={2}>
                      <Label>Meta Description</Label>
                      <Textarea
                        value={config.seoDescription}
                        onChange={(e) => setConfig((prev) => ({ ...prev, seoDescription: e.target.value }))}
                        placeholder="Join us for an unforgettable experience..."
                        className="border-ink-700 bg-black text-white"
                        rows={3}
                      />
                      <Label size="xs" className="text-ink-500">
                        {config.seoDescription.length}/160 characters recommended
                      </Label>
                    </Stack>

                    <Stack gap={2}>
                      <Label>Open Graph Image URL</Label>
                      <Input
                        value={config.ogImage || ""}
                        onChange={(e) => setConfig((prev) => ({ ...prev, ogImage: e.target.value }))}
                        placeholder="https://example.com/og-image.jpg"
                        className="border-ink-700 bg-black text-white"
                      />
                      <Label size="xs" className="text-ink-500">
                        Recommended size: 1200x630 pixels
                      </Label>
                    </Stack>
                  </Stack>

                  <Card className="p-4 bg-ink-800 border border-ink-700">
                    <Stack gap={2}>
                      <Label className="text-ink-400">Search Preview</Label>
                      <Stack gap={1}>
                        <Label className="text-info-400">{config.seoTitle || "Event Title"}</Label>
                        <Label size="xs" className="text-success-400">gvteway.com/events/{eventId}</Label>
                        <Label size="xs" className="text-ink-300">{config.seoDescription || "Event description..."}</Label>
                      </Stack>
                    </Stack>
                  </Card>
                </Stack>
              </Card>
            </TabPanel>

            <TabPanel active={activeTab === "advanced"}>
              <Grid cols={2} gap={6}>
                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <H3>Custom CSS</H3>
                    <Textarea
                      value={config.customCss || ""}
                      onChange={(e) => setConfig((prev) => ({ ...prev, customCss: e.target.value }))}
                      placeholder="/* Add custom CSS here */"
                      className="border-ink-700 bg-black text-white font-mono"
                      rows={10}
                    />
                    <Label size="xs" className="text-ink-500">
                      Advanced: Add custom CSS to override default styles
                    </Label>
                  </Stack>
                </Card>

                <Card className="border-2 border-ink-800 bg-ink-900/50 p-6">
                  <Stack gap={4}>
                    <H3>Integrations</H3>
                    <Stack gap={4}>
                      <Stack gap={2}>
                        <Label>Google Analytics ID</Label>
                        <Input
                          placeholder="G-XXXXXXXXXX"
                          className="border-ink-700 bg-black text-white font-mono"
                        />
                      </Stack>
                      <Stack gap={2}>
                        <Label>Facebook Pixel ID</Label>
                        <Input
                          placeholder="XXXXXXXXXXXXXXX"
                          className="border-ink-700 bg-black text-white font-mono"
                        />
                      </Stack>
                      <Stack gap={2}>
                        <Label>Custom Scripts (Head)</Label>
                        <Textarea
                          placeholder="<!-- Add tracking scripts -->"
                          className="border-ink-700 bg-black text-white font-mono"
                          rows={4}
                        />
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400 hover:border-white hover:text-white" onClick={() => router.push(`/events/${eventId}`)}>
              Back to Event
            </Button>
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              Preview Page
            </Button>
            <Button variant="solid" onClick={handlePublish} disabled={isSaving}>
              {config.published ? "Update Live Page" : "Publish Page"}
            </Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={showPreview} onClose={() => setShowPreview(false)}>
        <ModalHeader>
          <H3>Page Preview</H3>
        </ModalHeader>
        <ModalBody>
          <Card className="h-96 bg-ink-800 border border-ink-700 flex items-center justify-center">
            <Stack gap={2} className="text-center">
              <Label className="text-ink-400">Live Preview</Label>
              <Body className="text-ink-500">
                Full page preview would render here with selected template and sections
              </Body>
              <Stack gap={1} className="mt-4">
                <Label size="xs" className="text-ink-500">Template: {config.template}</Label>
                <Label size="xs" className="text-ink-500">Font: {config.fontFamily}</Label>
                <Label size="xs" className="text-ink-500">
                  Sections: {config.sections.filter((s) => s.enabled).length} enabled
                </Label>
              </Stack>
            </Stack>
          </Card>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            Close
          </Button>
          <Button variant="solid" onClick={() => window.open(`/events/${eventId}/preview`, "_blank")}>
            Open Full Preview
          </Button>
        </ModalFooter>
      </Modal>

      <Modal open={showSectionModal} onClose={() => setShowSectionModal(false)}>
        <ModalHeader>
          <H3>Configure Section</H3>
        </ModalHeader>
        <ModalBody>
          {selectedSection && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">Section</Label>
                <Body className="text-white font-display">{selectedSection.title}</Body>
              </Stack>

              <Stack gap={2}>
                <Label>Section Title (Display)</Label>
                <Input
                  defaultValue={selectedSection.title}
                  className="border-ink-700 bg-black text-white"
                />
              </Stack>

              {selectedSection.type === "hero" && (
                <>
                  <Stack gap={2}>
                    <Label>Background Type</Label>
                    <Select className="border-ink-700 bg-black text-white">
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="gradient">Gradient</option>
                    </Select>
                  </Stack>
                  <Stack gap={2}>
                    <Label>Show Countdown</Label>
                    <Select className="border-ink-700 bg-black text-white">
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Select>
                  </Stack>
                </>
              )}

              {selectedSection.type === "lineup" && (
                <>
                  <Stack gap={2}>
                    <Label>Layout</Label>
                    <Select className="border-ink-700 bg-black text-white">
                      <option value="grid">Grid</option>
                      <option value="list">List</option>
                      <option value="carousel">Carousel</option>
                    </Select>
                  </Stack>
                  <Stack gap={2}>
                    <Label>Show Artist Bios</Label>
                    <Select className="border-ink-700 bg-black text-white">
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Select>
                  </Stack>
                </>
              )}

              {selectedSection.type === "tickets" && (
                <Stack gap={2}>
                  <Label>CTA Button Text</Label>
                  <Input
                    defaultValue="Get Tickets"
                    className="border-ink-700 bg-black text-white"
                  />
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowSectionModal(false)}>
            Cancel
          </Button>
          <Button variant="solid" onClick={() => setShowSectionModal(false)}>
            Save Changes
          </Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
