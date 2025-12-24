"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Users, Briefcase, DollarSign, Calendar, Building, Package } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  EnterprisePageHeader,
  Grid,
  H3,
  Input,
  Stack,
} from '@ghxstship/ui';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "deal" | "project" | "contact" | "invoice" | "event" | "venue" | "asset";
  href: string;
  metadata?: Record<string, string>;
}

const mockResults: SearchResult[] = [
  { id: "1", title: "Summer Festival 2025", description: "Active production with 12 vendors", type: "project", href: "/projects/1", metadata: { status: "active" } },
  { id: "2", title: "TechCorp Partnership", description: "Enterprise deal - $450K value", type: "deal", href: "/deals/2", metadata: { value: "$450K" } },
  { id: "3", title: "Sarah Johnson", description: "VP of Events at Acme Corp", type: "contact", href: "/contacts/3", metadata: { company: "Acme Corp" } },
  { id: "4", title: "INV-2025-0042", description: "Invoice for Q1 services", type: "invoice", href: "/invoices/4", metadata: { amount: "$12,500" } },
  { id: "5", title: "Winter Gala", description: "Upcoming event - Dec 20, 2025", type: "event", href: "/events/5", metadata: { date: "Dec 20" } },
  { id: "6", title: "Grand Ballroom", description: "Premium venue - 500 capacity", type: "venue", href: "/venues/6", metadata: { capacity: "500" } },
  { id: "7", title: "LED Wall 20x10", description: "Video equipment - available", type: "asset", href: "/assets/7", metadata: { status: "available" } },
  { id: "8", title: "Spring Concert Series", description: "Multi-event production", type: "project", href: "/projects/8", metadata: { status: "planning" } },
];

const getTypeIcon = (type: SearchResult["type"]) => {
  switch (type) {
    case "deal": return <Briefcase className="size-4" />;
    case "project": return <FileText className="size-4" />;
    case "contact": return <Users className="size-4" />;
    case "invoice": return <DollarSign className="size-4" />;
    case "event": return <Calendar className="size-4" />;
    case "venue": return <Building className="size-4" />;
    case "asset": return <Package className="size-4" />;
  }
};

const getTypeColor = (type: SearchResult["type"]) => {
  switch (type) {
    case "deal": return "text-accent";
    case "project": return "text-primary";
    case "contact": return "text-secondary";
    case "invoice": return "text-success";
    case "event": return "text-info";
    case "venue": return "text-warning";
    case "asset": return "text-error";
  }
};

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const types = ["all", "deal", "project", "contact", "invoice", "event", "venue", "asset"];

  const filteredResults = useMemo(() => {
    let results = mockResults;
    
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      results = results.filter(r => 
        r.title.toLowerCase().includes(lowerQuery) ||
        r.description.toLowerCase().includes(lowerQuery)
      );
    }
    
    if (selectedType !== "all") {
      results = results.filter(r => r.type === selectedType);
    }
    
    return results;
  }, [query, selectedType]);

  const resultsByType = useMemo(() => {
    const counts: Record<string, number> = { all: mockResults.length };
    mockResults.forEach(r => {
      counts[r.type] = (counts[r.type] || 0) + 1;
    });
    return counts;
  }, []);

  return (
    <Stack gap={8}>
      <EnterprisePageHeader
        title="Search"
        subtitle="Search across all resources in your organization"
        showFavorite
        showSettings
      />

      <Card inverted className="border-2 border-ink-800 p-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-grey-400" />
          <Input
            placeholder="Search deals, projects, contacts, invoices..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 h-12 text-body-lg"
          />
        </div>
      </Card>

      <div className="flex gap-2 flex-wrap">
        {types.map(type => (
          <Button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-button border-2 transition-all capitalize ${
              selectedType === type 
                ? "bg-primary text-white border-primary" 
                : "bg-transparent text-grey-400 border-ink-700 hover:border-ink-600"
            }`}
          >
            {type === "all" ? "All" : type}s ({resultsByType[type] || 0})
          </Button>
        ))}
      </div>

      <Body className="text-grey-400">
        {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} found
        {query && ` for "${query}"`}
      </Body>

      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        {filteredResults.map(result => (
          <Card 
            key={result.id} 
            inverted 
            className="border-2 border-ink-800 p-4 cursor-pointer hover:border-primary transition-colors"
            onClick={() => router.push(result.href)}
          >
            <Stack gap={3}>
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${getTypeColor(result.type)}`}>
                  {getTypeIcon(result.type)}
                  <Badge variant="outline" className="capitalize">{result.type}</Badge>
                </div>
                {result.metadata && Object.entries(result.metadata).map(([key, value]) => (
                  <Badge key={key} variant="ghost" className="text-grey-400">
                    {value}
                  </Badge>
                ))}
              </div>
              <div>
                <H3 className="text-white">{result.title}</H3>
                <Body size="sm" className="text-grey-400">{result.description}</Body>
              </div>
            </Stack>
          </Card>
        ))}
      </Grid>

      {filteredResults.length === 0 && (
        <Card inverted className="border-2 border-ink-800 p-8">
          <Stack gap={4} className="items-center justify-center py-8">
            <Search className="size-12 text-grey-600" />
            <Body className="text-grey-400 text-center">
              No results found{query && ` for "${query}"`}. Try a different search term.
            </Body>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
