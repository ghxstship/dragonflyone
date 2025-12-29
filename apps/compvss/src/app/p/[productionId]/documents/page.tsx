"use client";

/**
 * Production Documents Page
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { useParams } from "next/navigation";
import { FileText, Search, Upload, Download, Folder, File, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  Badge,
  Body,
  Button,
  Card,
  Input,
  Grid,
  StatCard,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

interface Document {
  id: string;
  name: string;
  type: string;
  folder: string;
  size: string;
  updated: string;
}

const DEMO_DOCUMENTS: Document[] = [
  { id: "1", name: "Production Schedule.pdf", type: "pdf", folder: "Schedules", size: "2.4 MB", updated: "2024-12-15" },
  { id: "2", name: "Crew Contact List.xlsx", type: "xlsx", folder: "Crew", size: "156 KB", updated: "2024-12-14" },
  { id: "3", name: "Technical Rider.pdf", type: "pdf", folder: "Technical", size: "1.8 MB", updated: "2024-12-13" },
];

export default function ProductionDocumentsPage() {
  const params = useParams();
  const productionId = params.productionId as string;
  const [search, setSearch] = useState("");
  const [folder, setFolder] = useState("all");

  const { data: documents = [], isLoading, error, refetch } = useQuery<Document[]>({
    queryKey: ["production-documents", productionId],
    queryFn: async () => {
      const response = await fetch(`/api/productions/${productionId}/documents`);
      if (!response.ok) return DEMO_DOCUMENTS;
      const data = await response.json();
      return data.documents?.length ? data.documents : DEMO_DOCUMENTS;
    },
  });

  const folders: string[] = ["all", ...Array.from(new Set(documents.map((d: Document) => d.folder)))];
  const filteredDocs = documents.filter((doc: Document) => {
    const matchesSearch = doc.name.toLowerCase().includes(search.toLowerCase());
    const matchesFolder = folder === "all" || doc.folder === folder;
    return matchesSearch && matchesFolder;
  });

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  const tabs = [
    {
      id: "documents",
      label: "Documents",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-6">
            <StatCard label="Total Files" value={documents.length.toString()} icon={<FileText className="size-5" />} />
            <StatCard label="Folders" value={folders.length.toString()} icon={<Folder className="size-5" />} />
            <StatCard label="PDFs" value={documents.filter((d: Document) => d.type === "pdf").length.toString()} icon={<File className="size-5" />} />
            <StatCard label="Spreadsheets" value={documents.filter((d: Document) => d.type === "xlsx").length.toString()} icon={<File className="size-5" />} />
          </Grid>

          <div className="flex gap-4 items-center mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-grey-400" />
              <Input placeholder="Search documents..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
            <div className="flex gap-2">
              {folders.map((f) => (
                <Button key={f} variant={folder === f ? "solid" : "outline"} size="sm" onClick={() => setFolder(f)}>
                  {f === "all" ? "All" : f}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredDocs.map((doc: Document) => (
              <Card key={doc.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="size-5 text-grey-400" />
                    <div>
                      <Body className="font-weight-medium">{doc.name}</Body>
                      <Body size="sm" className="text-grey-400">{doc.size} • Updated {formatDate(doc.updated)}</Body>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{doc.folder}</Badge>
                    <Button variant="ghost" size="sm"><Download className="size-4" /></Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
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
          <Card className="p-8 mt-4 border-dashed text-center">
            <Upload className="size-12 text-grey-600 mx-auto mb-4" />
            <Body className="font-weight-medium mb-2">Drop files here or click to upload</Body>
            <Body className="text-grey-400 mb-4">PDF, XLSX, DOCX up to 50MB</Body>
            <Button variant="outline">Select Files</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Production", title: "Documents", description: "Manage production documents" }}
      backButton={{ label: "Overview", href: `/p/${productionId}/overview` }}
      loading={isLoading}
      error={error instanceof Error ? error : null}
      onRetry={refetch}
      tabs={tabs}
      actions={<Button variant="solid" icon={<Upload className="size-4" />} iconPosition="left">Upload</Button>}
    />
  );
}
