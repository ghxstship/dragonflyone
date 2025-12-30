"use client";

/**
 * Tutorials Page
 * Video tutorials and guides
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";

import { Play, Clock, Star, Search, List, Bookmark } from "lucide-react";
import {
  Badge, Body, Button, Card, Grid, Input, DetailPage, Section, SectionHeader} from "@ghxstship/ui";

interface Tutorial {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  featured: boolean;
}

const TUTORIALS: Tutorial[] = [
  { id: "1", title: "Platform Overview", description: "A complete tour of the ATLVS platform", duration: "10 min", category: "Getting Started", difficulty: "beginner", featured: true },
  { id: "2", title: "Creating Your First Project", description: "Step-by-step project creation guide", duration: "8 min", category: "Getting Started", difficulty: "beginner", featured: true },
  { id: "3", title: "Team Collaboration", description: "How to work with your team effectively", duration: "12 min", category: "Collaboration", difficulty: "intermediate", featured: false },
  { id: "4", title: "Advanced Workflows", description: "Automate your production workflows", duration: "15 min", category: "Advanced", difficulty: "advanced", featured: false },
  { id: "5", title: "Reporting & Analytics", description: "Generate insights from your data", duration: "10 min", category: "Analytics", difficulty: "intermediate", featured: true },
  { id: "6", title: "Integrations Setup", description: "Connect third-party tools", duration: "8 min", category: "Integrations", difficulty: "intermediate", featured: false },
];

const CATEGORIES = ["All", "Getting Started", "Collaboration", "Advanced", "Analytics", "Integrations"];
const DIFFICULTY_COLORS = { beginner: "success", intermediate: "warning", advanced: "error" } as const;

export default function TutorialsPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredTutorials = TUTORIALS.filter((t) => {
    const matchesSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || t.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const tabs = [
    {
      id: "all",
      label: "All Tutorials",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-grey-400" />
                <Input placeholder="Search tutorials..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <Button key={cat} variant={selectedCategory === cat ? "solid" : "outline"} size="sm" onClick={() => setSelectedCategory(cat)}>
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
            {filteredTutorials.map((tutorial) => (
              <Card key={tutorial.id} className="p-6 cursor-pointer hover:border-primary">
                <div className="aspect-video bg-grey-800 rounded-card flex items-center justify-center mb-4">
                  <Play className="size-10 text-grey-400" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">{tutorial.category}</Badge>
                  <Badge variant={DIFFICULTY_COLORS[tutorial.difficulty]}>{tutorial.difficulty}</Badge>
                </div>
                <Body className="font-weight-bold font-weight-medium">{tutorial.title}</Body>
                <Body size="sm" className="text-grey-400 mb-2">{tutorial.description}</Body>
                <div className="flex items-center gap-2 text-grey-500">
                  <Clock className="size-4" />
                  <Body size="sm">{tutorial.duration}</Body>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
    {
      id: "featured",
      label: "Featured",
      icon: <Bookmark className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Featured Tutorials" description="Our most popular video guides" />
          <div className="space-y-6 mt-6">
            {TUTORIALS.filter((t) => t.featured).map((tutorial) => (
              <Card key={tutorial.id} className="p-6 cursor-pointer hover:border-primary">
                <div className="flex items-start gap-6">
                  <div className="w-48 aspect-video bg-grey-800 rounded-card flex items-center justify-center flex-shrink-0">
                    <Play className="size-8 text-grey-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="size-4 text-warning" />
                      <Badge variant="outline">{tutorial.category}</Badge>
                      <Badge variant={DIFFICULTY_COLORS[tutorial.difficulty]}>{tutorial.difficulty}</Badge>
                    </div>
                    <Body className="font-weight-bold font-weight-medium">{tutorial.title}</Body>
                    <Body className="text-grey-400 mb-2">{tutorial.description}</Body>
                    <div className="flex items-center gap-2 text-grey-500">
                      <Clock className="size-4" />
                      <Body size="sm">{tutorial.duration}</Body>
                    </div>
                  </div>
                  <Button variant="solid" icon={<Play className="size-4" />} iconPosition="left">Watch</Button>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Help", title: "Video Tutorials", description: "Learn with step-by-step video guides" }}
      backButton={{ label: "Help Center", href: "/help" }}
      tabs={tabs}
    />
  );
}
