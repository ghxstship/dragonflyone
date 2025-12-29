"use client";

/**
 * Search Page
 * Global search across all entities
 * Uses DetailPage template for consistent layout
 * Integrates with useGlobalSearch hook for real API data
 */

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, FileText, Users, Briefcase, DollarSign, Calendar, Building, Package, List } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  Grid,
  Input,
  DetailPage,
  Section,
  Spinner,
} from "@ghxstship/ui";
import { useAuthContext, ATLVS_ADMIN_ROLES } from "@ghxstship/config";
import { useGlobalSearch, type SearchResult as APISearchResult, type SearchFilters } from "@/hooks/useGlobalSearch";

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: "deal" | "project" | "contact" | "invoice" | "event" | "venue" | "asset" | "booking" | "lead" | "proposal" | "contract" | "vendor" | "space" | "document";
  href: string;
  metadata?: Record<string, string>;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "deal": return <Briefcase className="size-4" />;
    case "project": return <FileText className="size-4" />;
    case "contact": return <Users className="size-4" />;
    case "invoice": return <DollarSign className="size-4" />;
    case "event": return <Calendar className="size-4" />;
    case "venue": return <Building className="size-4" />;
    case "asset": return <Package className="size-4" />;
    case "booking": return <Calendar className="size-4" />;
    case "lead": return <Users className="size-4" />;
    case "proposal": return <FileText className="size-4" />;
    case "contract": return <FileText className="size-4" />;
    case "vendor": return <Building className="size-4" />;
    case "space": return <Building className="size-4" />;
    case "document": return <FileText className="size-4" />;
    default: return <FileText className="size-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "deal": return "text-accent";
    case "project": return "text-primary";
    case "contact": return "text-secondary";
    case "invoice": return "text-success";
    case "event": return "text-info";
    case "venue": return "text-warning";
    case "asset": return "text-error";
    case "booking": return "text-info";
    case "lead": return "text-secondary";
    case "proposal": return "text-primary";
    case "contract": return "text-success";
    case "vendor": return "text-warning";
    case "space": return "text-accent";
    case "document": return "text-grey-400";
    default: return "text-grey-400";
  }
};

// Transform API results to display format
function transformResults(apiResults: APISearchResult[]): SearchResult[] {
  return apiResults.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description || r.subtitle || "",
    type: r.type as SearchResult["type"],
    href: r.url,
    metadata: r.metadata as Record<string, string> | undefined,
  }));
}

export default function SearchPage() {
  const router = useRouter();
  const { hasRole } = useAuthContext();
  const [query, setQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  const canAccessAdvancedSearch = ATLVS_ADMIN_ROLES.some((role) => hasRole(role));
  const allTypes = ["all", "contact", "booking", "invoice", "lead", "proposal", "contract", "vendor", "space", "document"];
  const types = canAccessAdvancedSearch ? allTypes : allTypes.filter((t) => !["invoice", "contract"].includes(t));

  // Build filters based on selected type
  const filters: SearchFilters | undefined = useMemo(() => {
    if (selectedType === "all") return undefined;
    return { types: [selectedType as APISearchResult["type"]] };
  }, [selectedType]);

  // Use real API hook for search
  const { data: searchData, isLoading, error, refetch } = useGlobalSearch(query, filters, 50);

  // Transform and filter results
  const filteredResults = useMemo(() => {
    if (!searchData?.results) return [];
    return transformResults(searchData.results);
  }, [searchData]);

  // Get counts by type from API response
  const resultsByType = useMemo(() => {
    const counts: Record<string, number> = { all: searchData?.total || 0 };
    if (searchData?.by_type) {
      Object.entries(searchData.by_type).forEach(([type, count]) => {
        counts[type] = count;
      });
    }
    return counts;
  }, [searchData]);

  const tabs = [
    {
      id: "search",
      label: "Search",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-6 mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-grey-400" />
              <Input placeholder="Search contacts, bookings, invoices, vendors..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-12 h-12 text-body-lg" />
            </div>
          </Card>

          <div className="flex flex-wrap gap-2 mb-6">
            {types.map((type) => (
              <Button key={type} onClick={() => setSelectedType(type)} variant={selectedType === type ? "solid" : "outline"} className="capitalize">
                {type === "all" ? "All" : type}s ({resultsByType[type] || 0})
              </Button>
            ))}
          </div>

          {/* Loading State */}
          {isLoading && query.length >= 2 && (
            <Card className="p-8 text-center">
              <Spinner className="mx-auto mb-4" />
              <Body className="text-grey-400">Searching...</Body>
            </Card>
          )}

          {/* Error State */}
          {error && (
            <Card className="p-8 text-center border-error">
              <Search className="size-12 text-error mx-auto mb-4" />
              <Body className="text-error mb-4">Search failed. Please try again.</Body>
              <Button variant="outline" onClick={() => refetch()}>Retry</Button>
            </Card>
          )}

          {/* Results */}
          {!isLoading && !error && (
            <>
              <Body className="text-grey-400 mb-4">{filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} found{query && ` for "${query}"`}</Body>

              {filteredResults.length === 0 ? (
                <Card className="p-8 text-center">
                  <Search className="size-12 text-grey-600 mx-auto mb-4" />
                  <Body className="text-grey-400">
                    {query.length < 2 
                      ? "Enter at least 2 characters to search" 
                      : `No results found for "${query}". Try a different search term.`}
                  </Body>
                </Card>
              ) : (
                <Grid cols={2} gap={4} className="grid-cols-1 lg:grid-cols-2">
                  {filteredResults.map((result) => (
                    <Card key={result.id} className="p-4 cursor-pointer hover:border-primary transition-colors" onClick={() => router.push(result.href)}>
                      <div className="flex justify-between items-center mb-3">
                        <div className={`flex items-center gap-2 ${getTypeColor(result.type)}`}>
                          {getTypeIcon(result.type)}
                          <Badge variant="outline" className="capitalize">{result.type}</Badge>
                        </div>
                        {result.metadata && Object.entries(result.metadata).map(([key, value]) => (
                          <Badge key={key} variant="outline" className="text-grey-400">{String(value)}</Badge>
                        ))}
                      </div>
                      <Body className="font-weight-medium">{result.title}</Body>
                      <Body size="sm" className="text-grey-400">{result.description}</Body>
                    </Card>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Find Anything",
        title: "Search",
        description: "Search across all entities in your workspace",
      }}
      tabs={tabs}
    />
  );
}
