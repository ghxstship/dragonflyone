"use client";

import { useParams } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, H3, Button } from "@ghxstship/ui";
import { FolderOpen, Upload, Download, FileText, Plus } from "lucide-react";
import { compvssDemoProductions } from "../../../../../data/compvss";

export default function DocumentFilesPage() {
  const params = useParams();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Files" title="Production Not Found" /></Stack>;
  }

  const stats = { total: 156, uploaded: 142, shared: 98, downloads: 456 };

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader kicker={production.name} title="Files" description="Production file storage and sharing" />
        <Button variant="solid" size="sm"><Plus size={16} className="mr-2" />Upload File</Button>
      </Stack>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Files" value={stats.total.toString()} icon={<FolderOpen size={20} />} />
        <StatCard label="Uploaded" value={stats.uploaded.toString()} icon={<Upload size={20} />} />
        <StatCard label="Shared" value={stats.shared.toString()} icon={<FileText size={20} />} />
        <StatCard label="Downloads" value={stats.downloads.toString()} icon={<Download size={20} />} />
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>File Browser</H3><Body className="text-muted">File browser will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
