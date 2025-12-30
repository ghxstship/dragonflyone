"use client";

/**
 * Data Import Page
 * Import data from various sources
 * Uses DetailPage template for consistent layout
 */

import { useState, useCallback } from "react";
import { Upload, FileText, Database, Users, Calendar, List, Settings, Check } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, Input, Label, DetailPage, Section, SectionHeader, useNotifications} from "@ghxstship/ui";

interface ImportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  formats: string[];
  template: string;
}

const IMPORT_OPTIONS: ImportOption[] = [
  { id: "projects", label: "Projects", description: "Import projects from CSV or Excel", icon: <FileText className="size-5" />, formats: ["csv", "xlsx"], template: "/templates/projects-import.csv" },
  { id: "contacts", label: "Contacts", description: "Import contacts and organizations", icon: <Users className="size-5" />, formats: ["csv", "xlsx", "vcf"], template: "/templates/contacts-import.csv" },
  { id: "events", label: "Events", description: "Import events and schedules", icon: <Calendar className="size-5" />, formats: ["csv", "xlsx", "ics"], template: "/templates/events-import.csv" },
];

export default function ImportSettingsPage() {
  const { addNotification } = useNotifications();

  const [selectedImport, setSelectedImport] = useState<string>("projects");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const importMutation = useMutation({
    mutationFn: async (data: { type: string; file: File }) => {
      const formData = new FormData();
      formData.append("type", data.type);
      formData.append("file", data.file);
      const response = await fetch("/api/settings/import", { method: "POST", body: formData });
      if (!response.ok) throw new Error("Failed to import data");
      return response.json();
    },
    onSuccess: (data) => {
      addNotification({ type: "success", title: "Import Complete", message: `Successfully imported ${data.count || 0} records` });
      setSelectedFile(null);
    },
    onError: () => {
      addNotification({ type: "error", title: "Import Failed", message: "Failed to import data. Please check your file format." });
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0]);
  };

  const currentOption = IMPORT_OPTIONS.find((o) => o.id === selectedImport);

  const tabs = [
    {
      id: "import",
      label: "Import",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Select Data Type" description="Choose what type of data you want to import" />
          <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mt-4 mb-6">
            {IMPORT_OPTIONS.map((option) => (
              <Card
                key={option.id}
                className={`p-4 cursor-pointer transition-colors ${selectedImport === option.id ? "border-primary" : ""}`}
                onClick={() => setSelectedImport(option.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-card ${selectedImport === option.id ? "bg-primary text-white" : "bg-grey-800 text-grey-400"}`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <Body className="font-weight-medium">{option.label}</Body>
                    <Body size="sm" className="text-grey-400">{option.description}</Body>
                    <div className="flex gap-1 mt-2">
                      {option.formats.map((fmt) => (
                        <Badge key={fmt} variant="outline" className="text-body-xs uppercase">{fmt}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>

          <Card className="p-6 mb-6">
            <SectionHeader title="Upload File" />
            <div
              className={`mt-4 border-2 border-dashed rounded-card p-8 text-center transition-colors ${dragActive ? "border-primary bg-primary/10" : "border-grey-700"}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <Check className="size-6 text-success" />
                  <div>
                    <Body className="font-weight-medium">{selectedFile.name}</Body>
                    <Body size="sm" className="text-grey-400">{(selectedFile.size / 1024).toFixed(1)} KB</Body>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedFile(null)}>Remove</Button>
                </div>
              ) : (
                <>
                  <Upload className="size-12 text-grey-600 mx-auto mb-4" />
                  <Body className="font-weight-medium mb-2">Drag and drop your file here</Body>
                  <Body size="sm" className="text-grey-400 mb-4">or click to browse</Body>
                  <Input type="file" accept={currentOption?.formats.map((f) => `.${f}`).join(",")} onChange={handleFileChange} className="hidden" id="file-upload" />
                  <Label htmlFor="file-upload">
                    <Button variant="outline" className="cursor-pointer">Browse Files</Button>
                  </Label>
                </>
              )}
            </div>
            {currentOption && (
              <div className="mt-4 flex items-center justify-between">
                <Body size="sm" className="text-grey-400">Need a template? Download our sample file.</Body>
                <Button variant="ghost" size="sm" onClick={() => window.open(currentOption.template, "_blank")}>Download Template</Button>
              </div>
            )}
          </Card>

          <Button
            variant="solid"
            onClick={() => selectedFile && importMutation.mutate({ type: selectedImport, file: selectedFile })}
            disabled={!selectedFile || importMutation.isPending}
            icon={<Upload className="size-4" />}
            iconPosition="left"
          >
            {importMutation.isPending ? "Importing..." : "Start Import"}
          </Button>
        </Section>
      ),
    },
    {
      id: "history",
      label: "Import History",
      icon: <Settings className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Recent Imports" description="Your previous import operations" />
          <Card className="p-8 text-center mt-4">
            <Database className="size-12 text-grey-600 mx-auto mb-4" />
            <Body className="font-weight-medium text-body-lg mb-2">No Recent Imports</Body>
            <Body className="text-grey-400">Your import history will appear here</Body>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Settings", title: "Import Data", description: "Import data from files or other sources" }}
      backButton={{ label: "Settings", href: "/settings" }}
      tabs={tabs}
    />
  );
}
