"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, StatCard, Body, Box, H3 } from "@ghxstship/ui";
import { FileText, FolderOpen, BookOpen, FileSpreadsheet, Shield } from "lucide-react";
import { compvssDemoProductions } from "../../../../data/compvss";

export default function ProductionDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = compvssDemoProductions.find((p) => p.id === productionId);

  if (!production) {
    return <Stack gap={4}><SectionHeader kicker="Documents" title="Production Not Found" /></Stack>;
  }

  const stats = { files: 156, sops: 24, specSheets: 45, templates: 18 };

  return (
    <Stack gap={8}>
      <SectionHeader kicker={production.name} title="Documents" description="Production files, SOPs, and reference materials" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Files" value={stats.files.toString()} icon={<FolderOpen size={20} />} />
        <StatCard label="SOPs" value={stats.sops.toString()} icon={<BookOpen size={20} />} />
        <StatCard label="Spec Sheets" value={stats.specSheets.toString()} icon={<FileSpreadsheet size={20} />} />
        <StatCard label="Templates" value={stats.templates.toString()} icon={<FileText size={20} />} />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/documents/files`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-100"><FolderOpen size={24} className="text-primary" /></Box><Body className="font-weight-bold">Files</Body></Stack></CardBody>
        </Card>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/documents/sops`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-100"><BookOpen size={24} className="text-secondary" /></Box><Body className="font-weight-bold">SOPs</Body></Stack></CardBody>
        </Card>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/documents/spec-sheets`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-100"><FileSpreadsheet size={24} className="text-warning" /></Box><Body className="font-weight-bold">Spec Sheets</Body></Stack></CardBody>
        </Card>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/documents/templates`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-100"><FileText size={24} className="text-accent" /></Box><Body className="font-weight-bold">Templates</Body></Stack></CardBody>
        </Card>
        <Card variant="elevated" className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/documents/backup-plans`)}>
          <CardBody><Stack gap={3} className="items-center text-center"><Box className="flex size-12 items-center justify-center rounded bg-ink-100"><Shield size={24} className="text-error" /></Box><Body className="font-weight-bold">Backup Plans</Body></Stack></CardBody>
        </Card>
      </div>
      <Card variant="elevated"><CardBody><Stack gap={4}><H3>Recent Documents</H3><Body className="text-muted">Recent documents will be displayed here.</Body></Stack></CardBody></Card>
    </Stack>
  );
}
