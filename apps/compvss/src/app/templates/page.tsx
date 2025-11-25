"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface Template {
  id: string;
  name: string;
  category: "Contract" | "Checklist" | "Form" | "Rider" | "Report" | "SOP";
  description: string;
  version: string;
  lastUpdated: string;
  updatedBy: string;
  downloads: number;
  tags: string[];
  fileType: "PDF" | "DOCX" | "XLSX" | "Google Doc";
  size: string;
}

const mockTemplates: Template[] = [
  { id: "TPL-001", name: "Production Services Agreement", category: "Contract", description: "Standard contract for production services with clients", version: "3.2", lastUpdated: "2024-11-15", updatedBy: "Legal Team", downloads: 245, tags: ["legal", "client", "services"], fileType: "DOCX", size: "125 KB" },
  { id: "TPL-002", name: "Crew Deal Memo", category: "Contract", description: "Day-call and freelance crew agreement", version: "2.1", lastUpdated: "2024-11-10", updatedBy: "HR Team", downloads: 892, tags: ["crew", "labor", "freelance"], fileType: "PDF", size: "85 KB" },
  { id: "TPL-003", name: "Load-In Checklist", category: "Checklist", description: "Comprehensive load-in verification checklist", version: "4.0", lastUpdated: "2024-11-20", updatedBy: "Operations", downloads: 567, tags: ["load-in", "operations", "verification"], fileType: "PDF", size: "45 KB" },
  { id: "TPL-004", name: "Safety Walk-Through Form", category: "Form", description: "Pre-event safety inspection documentation", version: "2.5", lastUpdated: "2024-11-18", updatedBy: "Safety Team", downloads: 423, tags: ["safety", "inspection", "compliance"], fileType: "PDF", size: "62 KB" },
  { id: "TPL-005", name: "Technical Rider Template", category: "Rider", description: "Standard technical rider for artists/performers", version: "1.8", lastUpdated: "2024-10-25", updatedBy: "Production", downloads: 334, tags: ["technical", "artist", "requirements"], fileType: "DOCX", size: "98 KB" },
  { id: "TPL-006", name: "Hospitality Rider Template", category: "Rider", description: "Artist hospitality and catering requirements", version: "1.5", lastUpdated: "2024-10-20", updatedBy: "Production", downloads: 289, tags: ["hospitality", "catering", "artist"], fileType: "DOCX", size: "75 KB" },
  { id: "TPL-007", name: "Show Report Template", category: "Report", description: "Post-event show report documentation", version: "3.0", lastUpdated: "2024-11-12", updatedBy: "Operations", downloads: 678, tags: ["report", "post-event", "documentation"], fileType: "XLSX", size: "156 KB" },
  { id: "TPL-008", name: "Incident Report Form", category: "Form", description: "Safety and security incident documentation", version: "2.2", lastUpdated: "2024-11-08", updatedBy: "Safety Team", downloads: 234, tags: ["incident", "safety", "security"], fileType: "PDF", size: "52 KB" },
  { id: "TPL-009", name: "Equipment Checkout SOP", category: "SOP", description: "Standard procedure for equipment checkout/return", version: "1.3", lastUpdated: "2024-10-30", updatedBy: "Warehouse", downloads: 156, tags: ["equipment", "procedure", "warehouse"], fileType: "PDF", size: "88 KB" },
  { id: "TPL-010", name: "Strike Checklist", category: "Checklist", description: "Post-event strike and packout verification", version: "3.5", lastUpdated: "2024-11-19", updatedBy: "Operations", downloads: 445, tags: ["strike", "packout", "verification"], fileType: "PDF", size: "48 KB" },
];

const categories = ["Contract", "Checklist", "Form", "Rider", "Report", "SOP"];

export default function TemplatesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTemplates = mockTemplates.filter(t => {
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalDownloads = mockTemplates.reduce((sum, t) => sum + t.downloads, 0);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Contract": return "bg-blue-900/20 border-blue-800";
      case "Checklist": return "bg-green-900/20 border-green-800";
      case "Form": return "bg-yellow-900/20 border-yellow-800";
      case "Rider": return "bg-purple-900/20 border-purple-800";
      case "Report": return "bg-orange-900/20 border-orange-800";
      case "SOP": return "bg-pink-900/20 border-pink-800";
      default: return "bg-ink-900/50 border-ink-800";
    }
  };

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Template Library</H1>
            <Label className="text-ink-400">Contracts, checklists, forms, riders, and standard operating procedures</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Templates" value={mockTemplates.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Categories" value={categories.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Downloads" value={totalDownloads.toLocaleString()} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Last Updated" value="Today" className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={6} gap={2}>
            {categories.map((cat) => {
              const count = mockTemplates.filter(t => t.category === cat).length;
              return (
                <Card key={cat} className={`p-3 border-2 cursor-pointer ${selectedCategory === cat ? "border-white" : getCategoryColor(cat)}`} onClick={() => setSelectedCategory(selectedCategory === cat ? "All" : cat)}>
                  <Stack gap={1} className="text-center">
                    <Label className="text-white">{cat}</Label>
                    <Label size="xs" className="text-ink-400">{count}</Label>
                  </Stack>
                </Card>
              );
            })}
          </Grid>

          <Grid cols={3} gap={4}>
            <Input type="search" placeholder="Search templates..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-ink-700 bg-black text-white col-span-2" />
            <Button variant="outlineWhite" onClick={() => setShowUploadModal(true)}>Upload Template</Button>
          </Grid>

          <Grid cols={2} gap={4}>
            {filteredTemplates.map((template) => (
              <Card key={template.id} className={`border-2 overflow-hidden ${getCategoryColor(template.category)}`}>
                <Stack className="p-4" gap={3}>
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Stack gap={1}>
                      <Body className="font-display text-white">{template.name}</Body>
                      <Badge variant="outline">{template.category}</Badge>
                    </Stack>
                    <Badge variant="outline">{template.fileType}</Badge>
                  </Stack>
                  <Body className="text-ink-300 text-sm">{template.description}</Body>
                  <Stack direction="horizontal" gap={2} className="flex-wrap">
                    {template.tags.slice(0, 3).map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}
                  </Stack>
                  <Grid cols={3} gap={2}>
                    <Stack gap={0}>
                      <Label size="xs" className="text-ink-500">Version</Label>
                      <Label className="text-white">v{template.version}</Label>
                    </Stack>
                    <Stack gap={0}>
                      <Label size="xs" className="text-ink-500">Downloads</Label>
                      <Label className="text-white">{template.downloads}</Label>
                    </Stack>
                    <Stack gap={0}>
                      <Label size="xs" className="text-ink-500">Size</Label>
                      <Label className="text-white">{template.size}</Label>
                    </Stack>
                  </Grid>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedTemplate(template)}>Preview</Button>
                    <Button variant="solid" size="sm" className="flex-1">Download</Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Request Template</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Version History</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedTemplate} onClose={() => setSelectedTemplate(null)}>
        <ModalHeader><H3>Template Details</H3></ModalHeader>
        <ModalBody>
          {selectedTemplate && (
            <Stack gap={4}>
              <Body className="font-display text-white text-lg">{selectedTemplate.name}</Body>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedTemplate.category}</Badge>
                <Badge variant="outline">{selectedTemplate.fileType}</Badge>
                <Badge variant="outline">v{selectedTemplate.version}</Badge>
              </Stack>
              <Body className="text-ink-300">{selectedTemplate.description}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Last Updated</Label><Label className="text-white">{selectedTemplate.lastUpdated}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Updated By</Label><Label className="text-white">{selectedTemplate.updatedBy}</Label></Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Downloads</Label><Label className="text-white">{selectedTemplate.downloads}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">File Size</Label><Label className="text-white">{selectedTemplate.size}</Label></Stack>
              </Grid>
              <Stack gap={2}>
                <Label size="xs" className="text-ink-500">Tags</Label>
                <Stack direction="horizontal" gap={2}>{selectedTemplate.tags.map(tag => <Badge key={tag} variant="outline">{tag}</Badge>)}</Stack>
              </Stack>
              <Card className="p-4 bg-ink-800 border border-ink-700 h-48 flex items-center justify-center">
                <Label className="text-ink-400">Document preview would display here</Label>
              </Card>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Close</Button>
          <Button variant="outline">Edit Template</Button>
          <Button variant="solid">Download</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showUploadModal} onClose={() => setShowUploadModal(false)}>
        <ModalHeader><H3>Upload Template</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Template Name" className="border-ink-700 bg-black text-white" />
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Category...</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </Select>
            <Textarea placeholder="Description..." className="border-ink-700 bg-black text-white" rows={2} />
            <Input placeholder="Tags (comma separated)" className="border-ink-700 bg-black text-white" />
            <Input placeholder="Version (e.g., 1.0)" className="border-ink-700 bg-black text-white" />
            <Card className="p-8 border-2 border-dashed border-ink-700 text-center cursor-pointer">
              <Stack gap={2}>
                <Label className="text-ink-400 text-2xl">📄</Label>
                <Label className="text-ink-400">Drop file here or click to upload</Label>
                <Label size="xs" className="text-ink-500">Supports PDF, DOCX, XLSX up to 25MB</Label>
              </Stack>
            </Card>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowUploadModal(false)}>Upload</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
