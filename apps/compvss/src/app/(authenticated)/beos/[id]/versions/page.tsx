"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Eye, Clock, ArrowLeft, GitCompare, Loader2, AlertTriangle } from "lucide-react";
import {
  Badge,
  Body,
  Button,
  Card,
  CardBody,
  EnterprisePageHeader,
  Grid,
  Stack,
} from '@ghxstship/ui';
import Link from "next/link";
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
      <Stack gap={8}>
        <EnterprisePageHeader 
          title="Version History" 
          subtitle="Compare BEO versions" 
          showFavorite 
          showSettings 
        />
        <Card inverted className="border-2 border-ink-800 p-12">
          <Stack gap={4} className="items-center justify-center">
            <Loader2 className="size-8 text-primary animate-spin" />
            <Body className="text-grey-400">Loading version history...</Body>
          </Stack>
        </Card>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={8}>
        <EnterprisePageHeader 
          title="Version History" 
          subtitle="Compare BEO versions" 
          showFavorite 
          showSettings 
        />
        <Card inverted className="border-2 border-error/30 p-8">
          <Stack gap={4} className="items-center justify-center">
            <AlertTriangle className="size-8 text-error" />
            <Body className="text-error">Failed to load version history</Body>
            <Button onClick={() => refetch()} variant="outline">Retry</Button>
          </Stack>
        </Card>
      </Stack>
    );
  }

  return (
    <Stack gap={8}>
      <EnterprisePageHeader 
        title="Version History" 
        subtitle={`BEO ${beoId} - ${versions?.length || 0} versions`}
        showFavorite 
        showSettings 
      />

      <Stack direction="horizontal" gap={4} className="items-center">
        <Link href={`/beos/${beoId}`}>
          <Button variant="ghost" size="sm" icon={<ArrowLeft className="size-4" />}>
            Back to BEO
          </Button>
        </Link>
        {comparisonReady && (
          <Button 
            variant="solid" 
            size="sm" 
            icon={<GitCompare className="size-4" />}
          >
            Compare v{selectedVersions[0]} with v{selectedVersions[1]}
          </Button>
        )}
      </Stack>

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
                      <Body size="sm" className="text-grey-400">
                        <Clock className="size-3 inline mr-1" />
                        {formatDate(version.created_at)}
                        {version.updated_by && ` by ${version.updated_by.full_name}`}
                      </Body>
                    </Stack>
                  </Stack>
                  <Stack direction="horizontal" gap={2}>
                    <Button variant="ghost" size="sm" icon={<Eye className="size-4" />}>
                      View
                    </Button>
                  </Stack>
                </Stack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      ) : (
        <Card inverted className="border-2 border-ink-800 p-8">
          <Stack gap={4} className="items-center justify-center">
            <Clock className="size-8 text-grey-500" />
            <Body className="text-grey-400">No version history available</Body>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}
