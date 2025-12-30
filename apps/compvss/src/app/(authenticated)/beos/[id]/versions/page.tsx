"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Eye, Clock, GitCompare, AlertTriangle } from "lucide-react";
import {
  DetailPage, Badge, Body, Button, Card, CardBody, Grid, Stack, Spinner, EmptyState} from '@ghxstship/ui';
import { useQuery } from "@tanstack/react-query";

interface BEOVersion {
  id: string;
  version: number;
  created_at: string;
  updated_by: { id: string; full_name: string } | null;
  changes_summary: string;
  sections: Record<string, unknown>;
}

async function fetchBEOVersions(beoId: string): Promise<BEOVersion[]> {
  const response = await fetch(`/api/beos/${beoId}/versions`);
  if (!response.ok) throw new Error("Failed to fetch versions");
  const { data } = await response.json();
  return data || [];
}

export default function BEOVersionsPage() {
  const params = useParams();
  const beoId = params.id as string;
  const [selectedVersions, setSelectedVersions] = useState<[number | null, number | null]>([null, null]);

  const { data: versions, isLoading, error, refetch } = useQuery({
    queryKey: ["beo-versions", beoId],
    queryFn: () => fetchBEOVersions(beoId),
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleVersionSelect = (version: number) => {
    if (selectedVersions[0] === null) {
      setSelectedVersions([version, null]);
    } else if (selectedVersions[1] === null && selectedVersions[0] !== version) {
      setSelectedVersions([selectedVersions[0], version]);
    } else {
      setSelectedVersions([version, null]);
    }
  };

  const comparisonReady = selectedVersions[0] !== null && selectedVersions[1] !== null;

  if (isLoading) {
    return (
      <DetailPage
        header={{ title: "Version History", description: "Loading..." }}
        backButton={{ label: "Back to BEO", href: `/beos/${beoId}` }}
      >
        <Stack gap={4} className="items-center justify-center py-16">
          <Spinner size="lg" />
          <Body>Loading version history...</Body>
        </Stack>
      </DetailPage>
    );
  }

  if (error) {
    return (
      <DetailPage
        header={{ title: "Version History" }}
        backButton={{ label: "Back to BEO", href: `/beos/${beoId}` }}
      >
        <EmptyState
          icon={<AlertTriangle className="h-12 w-12" />}
          title="Failed to Load Versions"
          description="Could not load version history. Please try again."
          action={{ label: "Retry", onClick: () => refetch() }}
        />
      </DetailPage>
    );
  }

  const versionContent = (
    <Stack gap={6}>
      {comparisonReady && (
        <Button 
          variant="solid" 
          size="sm"
        >
          <GitCompare className="size-4 mr-2" />
          Compare v{selectedVersions[0]} with v{selectedVersions[1]}
        </Button>
      )}

      {versions && versions.length > 0 ? (
        <Grid cols={1} gap={4}>
          {versions.map((version) => (
            <Card 
              key={version.id} 
              inverted 
              className={`border-2 cursor-pointer transition-colors ${
                selectedVersions.includes(version.version) 
                  ? "border-primary" 
                  : "border-ink-800 hover:border-ink-600"
              }`}
              onClick={() => handleVersionSelect(version.version)}
            >
              <CardBody>
                <Stack direction="horizontal" gap={4} className="items-center justify-between">
                  <Stack direction="horizontal" gap={4} className="items-center">
                    <Badge variant="solid" className="text-mono-sm">
                      v{version.version}
                    </Badge>
                    <Stack gap={1}>
                      <Body className="font-weight-medium text-white">
                        {version.changes_summary || `Version ${version.version}`}
                      </Body>
                      <Body size="sm" className="text-on-dark-muted">
                        <Clock className="size-3 inline mr-1" />
                        {formatDate(version.created_at)}
                        {version.updated_by && ` by ${version.updated_by.full_name}`}
                      </Body>
                    </Stack>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="ghost" size="sm">
                      <Eye className="size-4 mr-1" />
                      View
                    </Button>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      ) : (
        <EmptyState
          icon={<Clock className="h-12 w-12" />}
          title="No Version History"
          description="No version history available for this BEO."
        />
      )}
    </Stack>
  );

  return (
    <DetailPage
      header={{
        kicker: "BEO",
        title: "Version History",
        description: `${versions?.length || 0} versions`,
      }}
      backButton={{ label: "Back to BEO", href: `/beos/${beoId}` }}
    >
      {versionContent}
    </DetailPage>
  );
}
