"use client";

/**
 * Guides Page
 * Step-by-step tutorials and guides
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Book, Clock, Star, ArrowRight, Search, List, Bookmark } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  Input,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface Guide {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  duration: string;
  featured: boolean;
}

const DEMO_GUIDES: Guide[] = [
  { id: "1", title: "Getting Started with ATLVS", description: "Learn the basics of production management", category: "Basics", difficulty: "beginner", duration: "15 min", featured: true },
  { id: "2", title: "Creating Your First Production", description: "Step-by-step guide to setting up a production", category: "Basics", difficulty: "beginner", duration: "20 min", featured: true },
  { id: "3", title: "Team Collaboration Best Practices", description: "How to work effectively with your team", category: "Collaboration", difficulty: "intermediate", duration: "25 min", featured: false },
  { id: "4", title: "Advanced Workflow Automation", description: "Automate repetitive tasks and workflows", category: "Automation", difficulty: "advanced", duration: "30 min", featured: false },
  { id: "5", title: "Budget Management Guide", description: "Track and manage production budgets", category: "Finance", difficulty: "intermediate", duration: "20 min", featured: false },
  { id: "6", title: "Reporting and Analytics", description: "Generate insights from your data", category: "Analytics", difficulty: "intermediate", duration: "25 min", featured: true },
];

const CATEGORIES = ["All", "Basics", "Collaboration", "Automation", "Finance", "Analytics"];
const DIFFICULTY_COLORS = { beginner: "success", intermediate: "warning", advanced: "error" } as const;

export default function GuidesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredGuides = DEMO_GUIDES.filter((guide) => {
    const matchesSearch = !search || guide.title.toLowerCase().includes(search.toLowerCase()) || guide.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === "All" || guide.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredGuides = DEMO_GUIDES.filter((g) => g.featured);

  const tabs = [
    {
      id: "all",
      label: "All Guides",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-grey-400" />
                <Input placeholder="Search guides..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
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

          {filteredGuides.length === 0 ? (
            <Card className="p-8 text-center">
              <Book className="size-12 text-grey-600 mx-auto mb-4" />
              <Body className="font-weight-medium font-weight-medium mb-2">No Guides Found</Body>
              <Body className="text-grey-400">Try a different search term or category</Body>
            </Card>
          ) : (
            <Grid cols={2} gap={6} className="grid-cols-1 md:grid-cols-2">
              {filteredGuides.map((guide) => (
                <Card key={guide.id} className="p-6 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/guides/${guide.id}`)}>
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="outline">{guide.category}</Badge>
                    <Badge variant={DIFFICULTY_COLORS[guide.difficulty]}>{guide.difficulty}</Badge>
                  </div>
                  <Body className="font-weight-bold font-weight-medium mb-2">{guide.title}</Body>
                  <Body className="text-grey-400 mb-4">{guide.description}</Body>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-grey-500">
                      <Clock className="size-4" />
                      <Body size="sm">{guide.duration}</Body>
                    </div>
                    <Button variant="ghost" size="sm" icon={<ArrowRight className="size-4" />} iconPosition="right">Read</Button>
                  </div>
                </Card>
              ))}
            </Grid>
          )}
        </Section>
      ),
    },
    {
      id: "featured",
      label: "Featured",
      icon: <Bookmark className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Featured Guides" description="Our most popular tutorials" />
          <div className="space-y-6 mt-6">
            {featuredGuides.map((guide) => (
              <Card key={guide.id} className="p-8 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(`/guides/${guide.id}`)}>
                <div className="flex items-start gap-6">
                  <div className="p-4 bg-primary/20 rounded-card">
                    <Star className="size-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{guide.category}</Badge>
                      <Badge variant={DIFFICULTY_COLORS[guide.difficulty]}>{guide.difficulty}</Badge>
                      <div className="flex items-center gap-1 text-grey-500">
                        <Clock className="size-4" />
                        <Body size="sm">{guide.duration}</Body>
                      </div>
                    </div>
                    <Body className="font-weight-bold font-weight-bold mb-2">{guide.title}</Body>
                    <Body className="text-grey-400">{guide.description}</Body>
                  </div>
                  <Button variant="solid" icon={<ArrowRight className="size-4" />} iconPosition="right">Start</Button>
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
      header={{
        kicker: "Learn",
        title: "Guides & Tutorials",
        description: "Step-by-step guides to help you get the most out of ATLVS",
      }}
      tabs={tabs}
    />
  );
}
