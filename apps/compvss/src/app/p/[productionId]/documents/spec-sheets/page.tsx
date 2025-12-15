"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Grid, Spinner, Alert, Button, Badge } from "@ghxstship/ui";
import { FileSpreadsheet, CheckCircle, Clock, Download, Plus, Upload } from "lucide-react";
import { useProject } from "../../../../../hooks/useProjects";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../../../../lib/supabase";

interface SpecSheet {
  id: string;
  name: string;
  category: string;
  version: string;
  status: 'current' | 'outdated' | 'draft';
  downloads: number;
  updated_at: string;
}

export default function SpecSheetsPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const { data: production, isLoading: loadingProduction } = useProject(productionId);
  
  const { data: specSheets, isLoading: loadingSpecs, error } = useQuery({
    queryKey: ['spec_sheets', productionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('production_documents')
        .select('*')
        .eq('production_id', productionId)
        .eq('document_type', 'spec_sheet')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as unknown as SpecSheet[];
    },
    enabled: !!productionId,
  });

  const isLoading = loadingProduction || loadingSpecs;

  if (isLoading) {
    return (
      <Stack gap={4} className="items-center justify-center py-12">
        <Spinner size="lg" />
        <Body>Loading spec sheets...</Body>
      </Stack>
    );
  }

  if (error) {
    return (
      <Stack gap={4}>
        <Alert variant="error">Failed to load spec sheets. Please try again.</Alert>
      </Stack>
    );
  }

  const sheets = specSheets || [];
  const stats = {
    total: sheets.length,
    current: sheets.filter(s => s.status === 'current').length,
    outdated: sheets.filter(s => s.status === 'outdated').length,
    downloads: sheets.reduce((sum, s) => sum + (s.downloads || 0), 0),
  };

  return (
    <Stack gap={8}>
      <Stack direction="horizontal" className="items-start justify-between">
        <SectionHeader kicker={production?.name || 'Production'} title="Spec Sheets" description="Technical specifications and equipment details" />
        <Stack direction="horizontal" gap={2}>
          <Button variant="outline" size="sm"><Upload size={16} className="mr-2" />Upload</Button>
          <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />New Spec</Button>
        </Stack>
      </Stack>
      <Grid cols={4} gap={4}>
        <StatCard label="Total" value={stats.total.toString()} icon={<FileSpreadsheet size={20} />} />
        <StatCard label="Current" value={stats.current.toString()} icon={<CheckCircle size={20} />} />
        <StatCard label="Outdated" value={stats.outdated.toString()} icon={<Clock size={20} />} />
        <StatCard label="Downloads" value={stats.downloads.toString()} icon={<Download size={20} />} />
      </Grid>
      {sheets.length === 0 ? (
        <Card variant="elevated">
          <CardBody>
            <Stack gap={4} className="items-center py-8">
              <FileSpreadsheet size={48} className="text-grey-400" />
              <H3>No Spec Sheets Yet</H3>
              <Body className="text-grey-500">Upload your first technical specification document.</Body>
              <Button variant="solid"><Plus size={16} className="mr-2" />Add Spec Sheet</Button>
            </Stack>
          </CardBody>
        </Card>
      ) : (
        <Card variant="elevated">
          <CardBody>
            <Stack gap={4}>
              <H3>Spec Sheet Library</H3>
              {sheets.map((sheet) => (
                <Stack key={sheet.id} direction="horizontal" gap={4} className="items-center justify-between border-b border-grey-100 pb-4 last:border-0">
                  <Stack direction="horizontal" gap={4} className="items-center">
                    <FileSpreadsheet size={20} className="text-primary" />
                    <Stack gap={0}>
                      <Body className="font-weight-semibold">{sheet.name}</Body>
                      <Body size="sm" className="text-grey-500">{sheet.category} - v{sheet.version}</Body>
                    </Stack>
                  </Stack>
                  <Badge variant={sheet.status === 'current' ? 'success' : sheet.status === 'outdated' ? 'warning' : 'ghost'}>
                    {sheet.status.toUpperCase()}
                  </Badge>
                </Stack>
              ))}
            </Stack>
          </CardBody>
        </Card>
      )}
    </Stack>
  );
}
