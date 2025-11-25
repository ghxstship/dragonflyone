"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter,
} from "@ghxstship/ui";

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  category: "Audio" | "Lighting" | "Video" | "Staging" | "Rigging" | "Production" | "General";
  aliases?: string[];
  relatedTerms?: string[];
}

const mockTerms: GlossaryTerm[] = [
  { id: "GLO-001", term: "FOH", definition: "Front of House - The area where the audience is located, or the mixing position for audio/lighting.", category: "General", aliases: ["Front of House"], relatedTerms: ["BOH", "Monitor World"] },
  { id: "GLO-002", term: "BOH", definition: "Back of House - The backstage area including dressing rooms, production offices, and load-in areas.", category: "General", aliases: ["Back of House", "Backstage"], relatedTerms: ["FOH", "Green Room"] },
  { id: "GLO-003", term: "Line Array", definition: "A loudspeaker system where multiple speaker elements are arranged in a vertical line to create a coherent wavefront.", category: "Audio", relatedTerms: ["Point Source", "Subwoofer"] },
  { id: "GLO-004", term: "Truss", definition: "Aluminum or steel structural framework used to hang lighting, audio, and video equipment.", category: "Rigging", aliases: ["Box Truss", "Triangle Truss"], relatedTerms: ["Motor", "Bridle"] },
  { id: "GLO-005", term: "DMX", definition: "Digital Multiplex - A standard protocol for controlling lighting fixtures and effects.", category: "Lighting", aliases: ["DMX512"], relatedTerms: ["Art-Net", "sACN"] },
  { id: "GLO-006", term: "IEM", definition: "In-Ear Monitor - Personal monitoring system worn by performers to hear themselves and the mix.", category: "Audio", aliases: ["In-Ears", "Ears"], relatedTerms: ["Wedge", "Monitor Mix"] },
  { id: "GLO-007", term: "LED Wall", definition: "A video display made up of LED panels tiled together to create a seamless large-format screen.", category: "Video", aliases: ["LED Screen", "Video Wall"], relatedTerms: ["Pixel Pitch", "Processing"] },
  { id: "GLO-008", term: "Deck", definition: "The stage floor or platform surface where performers and equipment are positioned.", category: "Staging", aliases: ["Stage Deck"], relatedTerms: ["Riser", "Thrust"] },
  { id: "GLO-009", term: "Strike", definition: "The process of dismantling and removing all production equipment after an event.", category: "Production", aliases: ["Load-Out", "Tear Down"], relatedTerms: ["Load-In", "Bump Out"] },
  { id: "GLO-010", term: "Rider", definition: "A document specifying technical and hospitality requirements for an artist or production.", category: "Production", aliases: ["Tech Rider", "Hospitality Rider"], relatedTerms: ["Advance", "Input List"] },
  { id: "GLO-011", term: "Bridle", definition: "A rigging configuration using multiple legs to distribute load from a single point.", category: "Rigging", relatedTerms: ["Shackle", "Motor"] },
  { id: "GLO-012", term: "Gobo", definition: "A template or pattern placed in a lighting fixture to project shapes or textures.", category: "Lighting", aliases: ["Pattern", "Template"], relatedTerms: ["Moving Light", "Profile"] },
];

const categories = ["Audio", "Lighting", "Video", "Staging", "Rigging", "Production", "General"];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function GlossaryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const filteredTerms = mockTerms.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.aliases?.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesLetter = !selectedLetter || t.term.toUpperCase().startsWith(selectedLetter);
    return matchesSearch && matchesCategory && matchesLetter;
  }).sort((a, b) => a.term.localeCompare(b.term));

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Audio": return "bg-blue-900/20 border-blue-800";
      case "Lighting": return "bg-yellow-900/20 border-yellow-800";
      case "Video": return "bg-purple-900/20 border-purple-800";
      case "Staging": return "bg-green-900/20 border-green-800";
      case "Rigging": return "bg-red-900/20 border-red-800";
      case "Production": return "bg-orange-900/20 border-orange-800";
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
            <H1>Industry Glossary</H1>
            <Label className="text-ink-400">Comprehensive glossary of live event production terminology</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Terms" value={mockTerms.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Categories" value={categories.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="With Aliases" value={mockTerms.filter(t => t.aliases?.length).length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Filtered" value={filteredTerms.length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={4} gap={4}>
            <Input type="search" placeholder="Search terms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-ink-700 bg-black text-white col-span-3" />
            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border-ink-700 bg-black text-white">
              <option value="All">All Categories</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </Select>
          </Grid>

          <Card className="border-2 border-ink-800 bg-ink-900/50 p-3">
            <Stack direction="horizontal" gap={1} className="flex-wrap justify-center">
              <Button variant={selectedLetter === null ? "solid" : "ghost"} size="sm" onClick={() => setSelectedLetter(null)}>All</Button>
              {alphabet.map(letter => {
                const hasTerms = mockTerms.some(t => t.term.toUpperCase().startsWith(letter));
                return (
                  <Button key={letter} variant={selectedLetter === letter ? "solid" : "ghost"} size="sm" onClick={() => setSelectedLetter(letter)} disabled={!hasTerms} className={!hasTerms ? "opacity-30" : ""}>
                    {letter}
                  </Button>
                );
              })}
            </Stack>
          </Card>

          <Grid cols={2} gap={4}>
            {filteredTerms.map((term) => (
              <Card key={term.id} className={`border-2 p-4 cursor-pointer hover:border-white transition-colors ${getCategoryColor(term.category)}`} onClick={() => setSelectedTerm(term)}>
                <Stack gap={3}>
                  <Stack direction="horizontal" className="justify-between items-start">
                    <Body className="font-display text-white text-lg">{term.term}</Body>
                    <Badge variant="outline">{term.category}</Badge>
                  </Stack>
                  <Body className="text-ink-300 line-clamp-2">{term.definition}</Body>
                  {term.aliases && term.aliases.length > 0 && (
                    <Stack direction="horizontal" gap={2}>
                      <Label size="xs" className="text-ink-500">Also:</Label>
                      {term.aliases.slice(0, 2).map(alias => <Badge key={alias} variant="outline">{alias}</Badge>)}
                    </Stack>
                  )}
                </Stack>
              </Card>
            ))}
          </Grid>

          {filteredTerms.length === 0 && (
            <Card className="border-2 border-ink-800 bg-ink-900/50 p-8 text-center">
              <Label className="text-ink-400">No terms found matching your search</Label>
            </Card>
          )}

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Suggest Term</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export PDF</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedTerm} onClose={() => setSelectedTerm(null)}>
        <ModalHeader><H3>{selectedTerm?.term}</H3></ModalHeader>
        <ModalBody>
          {selectedTerm && (
            <Stack gap={4}>
              <Badge variant="outline" className={getCategoryColor(selectedTerm.category)}>{selectedTerm.category}</Badge>
              <Body className="text-ink-200">{selectedTerm.definition}</Body>
              {selectedTerm.aliases && selectedTerm.aliases.length > 0 && (
                <Stack gap={2}>
                  <Label className="text-ink-400">Also Known As</Label>
                  <Stack direction="horizontal" gap={2}>{selectedTerm.aliases.map(alias => <Badge key={alias} variant="outline">{alias}</Badge>)}</Stack>
                </Stack>
              )}
              {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                <Stack gap={2}>
                  <Label className="text-ink-400">Related Terms</Label>
                  <Stack direction="horizontal" gap={2}>{selectedTerm.relatedTerms.map(rt => <Badge key={rt} variant="outline">{rt}</Badge>)}</Stack>
                </Stack>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedTerm(null)}>Close</Button>
          <Button variant="outline">Edit Term</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
