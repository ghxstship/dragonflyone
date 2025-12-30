"use client";

/**
 * Data Export Page
 * Export your data in various formats
 * Uses DetailPage template for consistent layout
 */

import { useState } from "react";
import { Download, FileText, Database, Calendar, Users, Clock, List, Settings } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import {
  Badge, Body, Button, Card, Grid, Input, Select, DetailPage, Section, SectionHeader, useNotifications} from "@ghxstship/ui";

interface ExportOption {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  formats: string[];
}

const EXPORT_OPTIONS: ExportOption[] = [
  { id: "all", label: "All Data", description: "Complete export of all your data", icon: <Database className="size-5" />, formats: ["json", "csv", "xlsx"] },
  { id: "projects", label: "Projects", description: "All projects and related data", icon: <FileText className="size-5" />, formats: ["json", "csv", "xlsx"] },
  { id: "contacts", label: "Contacts", description: "All contacts and organizations", icon: <Users className="size-5" />, formats: ["json", "csv", "xlsx", "vcf"] },
  { id: "events", label: "Events", description: "All events and schedules", icon: <Calendar className="size-5" />, formats: ["json", "csv", "xlsx", "ics"] },
  { id: "activity", label: "Activity Log", description: "Your activity and audit history", icon: <Clock className="size-5" />, formats: ["json", "csv"] },
];

export default function ExportSettingsPage() {
  const { addNotification } = useNotifications();

  const [selectedExport, setSelectedExport] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<string>("json");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const exportMutation = useMutation({
    mutationFn: async (data: { type: string; format: string; dateFrom?: string; dateTo?: string }) => {
      const response = await fetch("/api/settings/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to start export");
      return response.json();
    },
    onSuccess: () => {
      addNotification({ type: "success", title: "Export Started", message: "You will receive an email when your export is ready" });
    },
    onError: () => {
      addNotification({ type: "error", title: "Error", message: "Failed to start export" });
    },
  });

  const currentOption = EXPORT_OPTIONS.find((o) => o.id === selectedExport);

  const tabs = [
    {
      id: "export",
      label: "Export",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Select Data to Export" description="Choose what data you want to export" />
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mt-4 mb-6">
            {EXPORT_OPTIONS.map((option) => (
              <Card
                key={option.id}
                className={`p-4 cursor-pointer transition-colors ${selectedExport === option.id ? "border-primary" : ""}`}
                onClick={() => { setSelectedExport(option.id); setSelectedFormat(option.formats[0]); }}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-card ${selectedExport === option.id ? "bg-primary text-white" : "bg-grey-800 text-on-dark-muted"}`}>
                    {option.icon}
                  </div>
                  <div className="flex-1">
                    <Body className="font-weight-medium">{option.label}</Body>
                    <Body size="sm" className="text-on-dark-muted">{option.description}</Body>
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
            <SectionHeader title="Export Options" />
            <Grid cols={3} gap={4} className="grid-cols-1 md:grid-cols-3 mt-4">
              <div>
                <Body size="sm" className="text-on-dark-muted mb-1">Format</Body>
                <Select value={selectedFormat} onChange={(e) => setSelectedFormat(e.target.value)}>
                  {currentOption?.formats.map((fmt) => (
                    <option key={fmt} value={fmt}>{fmt.toUpperCase()}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Body size="sm" className="text-on-dark-muted mb-1">From Date (Optional)</Body>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
              </div>
              <div>
                <Body size="sm" className="text-on-dark-muted mb-1">To Date (Optional)</Body>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
              </div>
            </Grid>
          </Card>

          <Button
            variant="solid"
            onClick={() => exportMutation.mutate({ type: selectedExport, format: selectedFormat, dateFrom: dateFrom || undefined, dateTo: dateTo || undefined })}
            disabled={exportMutation.isPending}
            icon={<Download className="size-4" />}
            iconPosition="left"
          >
            {exportMutation.isPending ? "Starting Export..." : "Start Export"}
          </Button>
        </Section>
      ),
    },
    {
      id: "history",
      label: "Export History",
      icon: <Settings className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Recent Exports" description="Your previous export requests" />
          <Card className="p-8 text-center mt-4">
            <Download className="size-12 text-on-dark-disabled mx-auto mb-4" />
            <Body className="font-weight-medium text-body-lg mb-2">No Recent Exports</Body>
            <Body className="text-on-dark-muted">Your export history will appear here</Body>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{ kicker: "Settings", title: "Export Data", description: "Export your data in various formats" }}
      backButton={{ label: "Settings", href: "/settings" }}
      tabs={tabs}
    />
  );
}
