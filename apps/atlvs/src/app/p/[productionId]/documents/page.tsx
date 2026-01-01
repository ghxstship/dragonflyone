"use client";

/**
 * Production Documents Page
 * Document management for production
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Plus, Download, Trash2, Search, Folder, Upload, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, Input, StatCard, DetailPage, Section, SectionHeader, Box, Stack } from "@ghxstship/ui";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  uploaded_by: string;
  uploaded_at: string;
  folder: string;
}

const DEMO_DOCUMENTS: Document[] = [
  { id: "1", name: "Production Schedule.pdf", type: "pdf", size: "2.4 MB", uploaded_by: "John Smith", uploaded_at: "2024-12-10", folder: "Schedules" },
  { id: "2", name: "Vendor Contract - Lighting.pdf", type: "pdf", size: "1.2 MB", uploaded_by: "Sarah Williams", uploaded_at: "2024-12-08", folder: "Contracts" },
  { id: "3", name: "Stage Design.dwg", type: "dwg", size: "5.8 MB", uploaded_by: "Mike Johnson", uploaded_at: "2024-12-05", folder: "Designs" },
  { id: "4", name: "Budget Overview.xlsx", type: "xlsx", size: "450 KB", uploaded_by: "Emily Davis", uploaded_at: "2024-12-03", folder: "Finance" },
  { id: "5", name: "Team Contact List.xlsx", type: "xlsx", size: "120 KB", uploaded_by: "Lisa Brown", uploaded_at: "2024-12-01", folder: "Team" },
  { id: "6", name: "Venue Floor Plan.pdf", type: "pdf", size: "3.1 MB", uploaded_by: "Alex Chen", uploaded_at: "2024-11-28", folder: "Venue" },
];

const FOLDERS = ["All", "Schedules", "Contracts", "Designs", "Finance", "Team", "Venue"];

export default function ProductionDocumentsPage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const [search, setSearch] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("All");

  const { data: documents = [], isLoading, error, refetch } = useQuery({
    queryKey: ["production-documents", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/documents`);
      if (!response.ok) return DEMO_DOCUMENTS;
      const data = await response.json();
      return data.documents?.length ? data.documents : DEMO_DOCUMENTS;
    },
  });

  const filteredDocuments = documents.filter((doc: Document) => {
    const matchesSearch = !search || doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = selectedFolder === "All" || doc.folder === selectedFolder;
    return matchesSearch && matchesFolder;
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const getFileIcon = (type: string) => {
    const colors: Record<string, string> = { pdf: "text-error", xlsx: "text-success", dwg: "text-info" };
    return <FileText className={`size-5 ${colors[type] || "text-on-dark-muted"}`} />;
  };

  const tabs = [
    {
      id: "documents",
      label: "Documents",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Documents" value={documents.length.toString()} icon={<FileText className="size-5" />} />
            <StatCard label="Folders" value={FOLDERS.length.toString()} icon={<Folder className="size-5" />} />
            <StatCard label="This Week" value={documents.filter((d: Document) => new Date(d.uploaded_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length.toString()} icon={<Upload className="size-5" />} />
            <StatCard label="Total Size" value="13.1 MB" icon={<FileText className="size-5" />} />
          </Grid>

          <Card className="p-4 mb-6">
            <Box className="flex items-center gap-4 flex-wrap">
              <Box className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-dark-muted" />
                <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </Box>
              <Box className="flex gap-2 flex-wrap">
                {FOLDERS.map((folder) => (
                  <Button key={folder} variant={selectedFolder === folder ? "solid" : "outline"} size="sm" onClick={() => setSelectedFolder(folder)}>
                    {folder}
                  </Button>
                ))}
              </Box>
            </Box>
          </Card>

          <Stack gap={2}>
            {filteredDocuments.map((doc: Document) => (
              <Card key={doc.id} className="p-4">
                <Box className="flex items-center justify-between">
                  <Box className="flex items-center gap-4">
                    <Box className="p-2 bg-grey-800 rounded-card">{getFileIcon(doc.type)}</Box>
                    <Box>
                      <Body className="font-weight-medium">{doc.name}</Body>
                      <Body size="sm" className="text-on-dark-muted">{doc.uploaded_by} • {formatDate(doc.uploaded_at)} • {doc.size}</Body>
                    </Box>
                  </Box>
                  <Box className="flex items-center gap-2">
                    <Badge variant="outline">{doc.folder}</Badge>
                    <Button variant="ghost" size="sm" icon={<Download className="size-4" />} />
                    <Button variant="ghost" size="sm" icon={<Trash2 className="size-4" />} />
                  </Box>
                </Box>
              </Card>
            ))}
          </Stack>
        </Section>
      ),
    },
    {
      id: "upload",
      label: "Upload",
      icon: <Upload className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Upload Documents" description="Add new documents to this production" />
          <Card className="p-8 mt-4 text-center border-2 border-dashed">
            <Upload className="size-12 text-on-dark-disabled mx-auto mb-4" />
            <Body className="font-weight-medium mb-2">Drag and drop files here</Body>
            <Body size="sm" className="text-on-dark-muted mb-4">or click to browse</Body>
            <Button variant="outline">Browse Files</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Production",
        title: "Documents",
        description: "Manage production documents and files",
      }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={<Button variant="solid" icon={<Plus className="size-4" />} iconPosition="left">Upload</Button>}
    />
  );
}
