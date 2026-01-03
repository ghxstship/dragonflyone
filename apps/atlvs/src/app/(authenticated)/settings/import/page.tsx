"use client";

/**
 * Data Import Page
 * Import data from various sources
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { Upload, FileText, Database, Users, Calendar, List, Settings } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, DetailPage, Section, SectionHeader, useToast, Box, FileUpload} from "@ghxstship/ui";

interface ImportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  formats: string[];
  template: string;
}

const IMPORT_OPTIONS: ImportOption[] = [
  { id: "events", label: "Events", description: "Import events and schedules", icon: <Calendar className="size-5" />, formats: ["csv"], template: "/templates/imports/events-import.csv" },
  { id: "contacts", label: "Contacts", description: "Import contacts and organizations", icon: <Users className="size-5" />, formats: ["csv"], template: "/templates/imports/contacts-import.csv" },
  { id: "vendors", label: "Vendors", description: "Import vendor records", icon: <FileText className="size-5" />, formats: ["csv"], template: "/templates/imports/vendors-import.csv" },
  { id: "venues", label: "Venues", description: "Import venue information", icon: <FileText className="size-5" />, formats: ["csv"], template: "/templates/imports/venues-import.csv" },
  { id: "assets", label: "Assets", description: "Import equipment and assets", icon: <Database className="size-5" />, formats: ["csv"], template: "/templates/imports/assets-import.csv" },
  { id: "employees", label: "Employees", description: "Import workforce employees", icon: <Users className="size-5" />, formats: ["csv"], template: "/templates/imports/workforce-employees-import.csv" },
  { id: "roles", label: "Roles", description: "Import workforce roles", icon: <Users className="size-5" />, formats: ["csv"], template: "/templates/imports/workforce-roles-import.csv" },
  { id: "shifts", label: "Shifts", description: "Import shift schedules", icon: <Calendar className="size-5" />, formats: ["csv"], template: "/templates/imports/workforce-shifts-import.csv" },
  { id: "time-entries", label: "Time Entries", description: "Import time tracking data", icon: <Calendar className="size-5" />, formats: ["csv"], template: "/templates/imports/workforce-time-entries-import.csv" },
  { id: "certifications", label: "Certifications", description: "Import crew certifications", icon: <FileText className="size-5" />, formats: ["csv"], template: "/templates/imports/workforce-certifications-import.csv" },
  { id: "budgets", label: "Budgets", description: "Import budget records", icon: <FileText className="size-5" />, formats: ["csv"], template: "/templates/imports/finance-budgets-import.csv" },
  { id: "budget-lines", label: "Budget Lines", description: "Import budget line items", icon: <FileText className="size-5" />, formats: ["csv"], template: "/templates/imports/finance-budget-lines-import.csv" },
  { id: "expenses", label: "Expenses", description: "Import expense records", icon: <FileText className="size-5" />, formats: ["csv"], template: "/templates/imports/finance-expenses-import.csv" },
  { id: "bills", label: "Bills", description: "Import bill records", icon: <FileText className="size-5" />, formats: ["csv"], template: "/templates/imports/finance-bills-import.csv" },
  { id: "purchase-orders", label: "Purchase Orders", description: "Import purchase orders", icon: <FileText className="size-5" />, formats: ["csv"], template: "/templates/imports/finance-purchase-orders-import.csv" },
];

export default function ImportSettingsPage() {
  const toast = useToast();

  const [selectedImport, setSelectedImport] = useState<string>("events");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      toast.success("Import Complete", `Successfully imported ${data.count || 0} records`);
      setSelectedFile(null);
    },
    onError: () => {
      toast.error("Import Failed", "Failed to import data. Please check your file format.");
    },
  });

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
                <Box className="flex items-start gap-3">
                  <Box className={`p-2 rounded-card ${selectedImport === option.id ? "bg-primary text-white" : "bg-surface-elevated text-text-muted"}`}>
                    {option.icon}
                  </Box>
                  <Box className="flex-1">
                    <Body className="font-weight-medium">{option.label}</Body>
                    <Body size="sm" className="text-text-muted">{option.description}</Body>
                    <Box className="flex gap-1 mt-2">
                      {option.formats.map((fmt) => (
                        <Badge key={fmt} variant="outline" className="text-body-xs uppercase">{fmt}</Badge>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))}
          </Grid>

          <Card className="p-6 mb-6">
            <SectionHeader title="Upload File" />
            <FileUpload
              accept={currentOption?.formats.map((f) => `.${f}`).join(",")}
              onFilesSelect={(files: File[]) => {
                if (files.length > 0) {
                  setSelectedFile(files[0]);
                }
              }}
              maxFiles={1}
              maxSize={10 * 1024 * 1024}
              className="mt-4"
            />
            {currentOption && (
              <Box className="mt-4 flex items-center justify-between">
                <Body size="sm" className="text-text-muted">Need a template? Download our sample file.</Body>
                <Button variant="ghost" size="sm" onClick={() => window.open(currentOption.template, "_blank")}>Download Template</Button>
              </Box>
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
            <Database className="size-12 text-text-disabled mx-auto mb-4" />
            <Body className="font-weight-medium text-body-lg mb-2">No Recent Imports</Body>
            <Body className="text-text-muted">Your import history will appear here</Body>
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
