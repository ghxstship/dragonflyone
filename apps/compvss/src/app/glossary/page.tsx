"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreatorNavigationAuthenticated } from "../../components/navigation";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Input,
  Select,
  Button,
  Section,
  Card,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  PageLayout,
  SectionHeader,
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

  return (
    <PageLayout background="white" header={<CreatorNavigationAuthenticated />}>
      <Section className="min-h-screen py-16">
        <Container>
          <Stack gap={10}>
            {/* Page Header */}
            <SectionHeader
              kicker="COMPVSS"
              title="Industry Glossary"
              description="Comprehensive glossary of live event production terminology"
              colorScheme="on-light"
              gap="lg"
            />

            {/* Stats Grid */}
            <Grid cols={4} gap={6}>
              <StatCard value={mockTerms.length.toString()} label="Total Terms" />
              <StatCard value={categories.length.toString()} label="Categories" />
              <StatCard value={mockTerms.filter(t => t.aliases?.length).length.toString()} label="With Aliases" />
              <StatCard value={filteredTerms.length.toString()} label="Filtered" />
            </Grid>

            {/* Search and Filter */}
            <Grid cols={4} gap={4}>
              <Input type="search" placeholder="Search terms..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="col-span-3" />
              <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="All">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Select>
            </Grid>

            {/* Alphabet Filter */}
            <Card className="p-3">
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

            {/* Terms Grid */}
            <Grid cols={2} gap={4}>
              {filteredTerms.map((term) => (
                <Card key={term.id} className="cursor-pointer p-4" onClick={() => setSelectedTerm(term)}>
                  <Stack gap={3}>
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Body className="text-body-md font-display">{term.term}</Body>
                      <Badge variant="outline">{term.category}</Badge>
                    </Stack>
                    <Body className="line-clamp-2 text-body-sm">{term.definition}</Body>
                    {term.aliases && term.aliases.length > 0 && (
                      <Stack direction="horizontal" gap={2}>
                        <Body className="text-body-sm">Also:</Body>
                        {term.aliases.slice(0, 2).map(alias => <Badge key={alias} variant="outline">{alias}</Badge>)}
                      </Stack>
                    )}
                  </Stack>
                </Card>
              ))}
            </Grid>

            {/* Empty State */}
            {filteredTerms.length === 0 && (
              <Card className="p-8 text-center">
                <Body>No terms found matching your search</Body>
              </Card>
            )}

            {/* Quick Links */}
            <Grid cols={3} gap={4}>
              <Button variant="outline">Suggest Term</Button>
              <Button variant="outline">Export PDF</Button>
              <Button variant="outline" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
            </Grid>
          </Stack>
        </Container>
      </Section>

      {/* Term Detail Modal */}
      <Modal open={!!selectedTerm} onClose={() => setSelectedTerm(null)}>
        <ModalHeader><H3>{selectedTerm?.term}</H3></ModalHeader>
        <ModalBody>
          {selectedTerm && (
            <Stack gap={4}>
              <Badge variant="outline">{selectedTerm.category}</Badge>
              <Body>{selectedTerm.definition}</Body>
              {selectedTerm.aliases && selectedTerm.aliases.length > 0 && (
                <Stack gap={2}>
                  <Body className="font-display">Also Known As</Body>
                  <Stack direction="horizontal" gap={2}>{selectedTerm.aliases.map(alias => <Badge key={alias} variant="outline">{alias}</Badge>)}</Stack>
                </Stack>
              )}
              {selectedTerm.relatedTerms && selectedTerm.relatedTerms.length > 0 && (
                <Stack gap={2}>
                  <Body className="font-display">Related Terms</Body>
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
    </PageLayout>
  );
}
