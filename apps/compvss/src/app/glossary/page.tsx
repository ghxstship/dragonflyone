"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
// Layout provided by route group
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
  Card,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import { getSubcategoryNames } from "@ghxstship/config";

import {
  useGlossaryTerms,
  type GlossaryTerm,
} from "../../hooks/useGlossary";

const categories = [...getSubcategoryNames('TECH'), "Production", "General"];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function GlossaryPage() {
  const router = useRouter();
  const { data: glossaryTerms = [], isLoading, error } = useGlossaryTerms();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  if (isLoading) {
    return (
      <>
        <MainContent padding="lg">
          <Container className="flex min-h-[60vh] items-center justify-center">
            <Stack gap={4} className="items-center">
              <div className="h-8 w-8 animate-spin rounded-avatar border-4 border-primary border-t-transparent" />
              <Body>Loading glossary...</Body>
            </Stack>
          </Container>
        </MainContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MainContent padding="lg">
          <Container>
            <Card className="p-6 border-destructive bg-destructive/10">
              <Stack gap={4} className="items-center text-center">
                <Body className="text-destructive font-display">Failed to load glossary</Body>
                <Body className="text-destructive">{error instanceof Error ? error.message : 'An error occurred'}</Body>
                <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
              </Stack>
            </Card>
          </Container>
        </MainContent>
      </>
    );
  }

  const filteredTerms = glossaryTerms.filter(t => {
    const matchesSearch = t.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.aliases?.some(a => a.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    const matchesLetter = !selectedLetter || t.term.toUpperCase().startsWith(selectedLetter);
    return matchesSearch && matchesCategory && matchesLetter;
  }).sort((a, b) => a.term.localeCompare(b.term));

  return (
    <>
      <EnterprisePageHeader
        title="Industry Glossary"
        subtitle="Comprehensive glossary of live event production terminology"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            {/* Stats Grid */}
            <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
              <StatCard value={glossaryTerms.length.toString()} label="Total Terms" />
              <StatCard value={categories.length.toString()} label="Categories" />
              <StatCard value={glossaryTerms.filter(t => t.aliases?.length).length.toString()} label="With Aliases" />
              <StatCard value={filteredTerms.length.toString()} label="Filtered" />
            </Grid>

            {/* Search and Filter */}
            <Grid cols={4} gap={4} className="sm:grid-cols-2 lg:grid-cols-4">
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
                  const hasTerms = glossaryTerms.some(t => t.term.toUpperCase().startsWith(letter));
                  return (
                    <Button key={letter} variant={selectedLetter === letter ? "solid" : "ghost"} size="sm" onClick={() => setSelectedLetter(letter)} disabled={!hasTerms} className={!hasTerms ? "opacity-30" : ""}>
                      {letter}
                    </Button>
                  );
                })}
              </Stack>
            </Card>

            {/* Terms Grid */}
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              {filteredTerms.map((term) => (
                <Card key={term.id} className="cursor-pointer p-4" onClick={() => setSelectedTerm(term)}>
                  <Stack gap={3}>
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Body className="text-body-md font-display">{term.term}</Body>
                      <Badge variant="outline">{term.category}</Badge>
                    </Stack>
                    <Body className="line-clamp-2">{term.definition}</Body>
                    {term.aliases && term.aliases.length > 0 && (
                      <Stack direction="horizontal" gap={2}>
                        <Body size="sm" className="">Also:</Body>
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
            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline">Suggest Term</Button>
              <Button variant="outline">Export PDF</Button>
              <Button variant="outline" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

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
    </>
  );
}
