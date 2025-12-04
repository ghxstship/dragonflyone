"use client";

import { useParams, useRouter } from "next/navigation";
import { SectionHeader, Card, CardBody, Stack, Button, Body, Box, Badge } from "@ghxstship/ui";
import { FileText, Plus, Upload, Folder, Download } from "lucide-react";
import { atlvsDemoProductions } from "../../../../data/atlvs";

export default function ProductionDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const productionId = params?.productionId as string;
  const production = atlvsDemoProductions.find((p) => p.id === productionId);

  const folders = [
    { id: "1", name: "Contracts", count: 12, updated: "2025-06-10" },
    { id: "2", name: "Permits", count: 8, updated: "2025-06-08" },
    { id: "3", name: "Technical Specs", count: 15, updated: "2025-06-12" },
    { id: "4", name: "Marketing Assets", count: 24, updated: "2025-06-11" },
    { id: "5", name: "Reports", count: 6, updated: "2025-06-09" },
  ];

  const recentFiles = [
    { id: "1", name: "Stage Layout v3.pdf", folder: "Technical Specs", size: "2.4 MB", updated: "2025-06-12" },
    { id: "2", name: "Vendor Contract - Audio.pdf", folder: "Contracts", size: "1.2 MB", updated: "2025-06-11" },
    { id: "3", name: "Fire Safety Permit.pdf", folder: "Permits", size: "0.8 MB", updated: "2025-06-10" },
  ];

  return (
    <Stack gap={8}>
      <Stack gap={4}>
        <SectionHeader
          kicker={production?.name || "Production"}
          title="Documents"
          description="Files, contracts, and production documentation"
          colorScheme="on-dark"
        />
        <Stack direction="horizontal" gap={2}>
          <Button variant="solid" size="sm">
            <Upload size={16} className="mr-2" />
            Upload
          </Button>
          <Button variant="outline" size="sm">
            <Plus size={16} className="mr-2" />
            New Folder
          </Button>
        </Stack>
      </Stack>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {folders.map((folder) => (
          <Card key={folder.id} variant="elevated" inverted className="cursor-pointer transition-all hover:border-primary" onClick={() => router.push(`/p/${productionId}/documents/${folder.name.toLowerCase().replace(" ", "-")}`)}>
            <CardBody>
              <Stack gap={3} className="items-center text-center">
                <Box className="flex size-12 items-center justify-center rounded bg-ink-800">
                  <Folder size={24} className="text-primary" />
                </Box>
                <Stack gap={1}>
                  <Body className="font-weight-medium text-white">{folder.name}</Body>
                  <Body className="text-body-sm text-on-dark-muted">{folder.count} files</Body>
                </Stack>
              </Stack>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card variant="elevated" inverted>
        <CardBody>
          <Stack gap={4}>
            <Body className="font-weight-bold text-white">Recent Files</Body>
            <Stack gap={0}>
              {recentFiles.map((file, index) => (
                <div key={file.id} className={`flex cursor-pointer items-center justify-between border-ink-700 p-4 transition-all hover:bg-ink-800/50 ${index < recentFiles.length - 1 ? "border-b" : ""}`}>
                  <Stack direction="horizontal" gap={3} className="items-center">
                    <FileText size={20} className="text-primary" />
                    <Stack gap={1}>
                      <Body className="font-weight-medium text-white">{file.name}</Body>
                      <Body className="text-body-sm text-on-dark-muted">{file.folder} · {file.size}</Body>
                    </Stack>
                  </Stack>
                  <Button variant="ghost" size="sm">
                    <Download size={16} />
                  </Button>
                </div>
              ))}
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Stack>
  );
}
