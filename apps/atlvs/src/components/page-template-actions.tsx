"use client";

/**
 * PageTemplateActions Component
 * Displays Download Template and Import buttons for pages that support bulk data operations
 */

import { usePathname, useRouter } from "next/navigation";
import { Download, Upload } from "lucide-react";
import { Button, Stack, Tooltip } from "@ghxstship/ui";
import { usePageTemplates } from "@/hooks/usePageTemplates";

interface PageTemplateActionsProps {
  className?: string;
}

export function PageTemplateActions({ className }: PageTemplateActionsProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { primaryTemplate, importEnabled } = usePageTemplates(pathname);

  const handleDownloadTemplate = () => {
    if (primaryTemplate?.downloadUrl) {
      window.open(primaryTemplate.downloadUrl, "_blank");
    }
  };

  const handleImport = () => {
    router.push("/settings/import");
  };

  if (!primaryTemplate && !importEnabled) {
    return null;
  }

  return (
    <Stack direction="horizontal" gap={2} className={className}>
      {primaryTemplate && (
        <Tooltip content={`Download ${primaryTemplate.title}`}>
          <Button
            variant="outline"
            size="sm"
            icon={<Download className="size-4" />}
            onClick={handleDownloadTemplate}
          >
            Download Template
          </Button>
        </Tooltip>
      )}
      <Tooltip content={importEnabled ? "Import data from CSV" : "Bulk import not available for this page"}>
        <Button
          variant="outline"
          size="sm"
          icon={<Upload className="size-4" />}
          onClick={handleImport}
          disabled={!importEnabled}
          className={!importEnabled ? "opacity-50 cursor-not-allowed" : ""}
        >
          Import
        </Button>
      </Tooltip>
    </Stack>
  );
}

export function DownloadTemplateButton({ className }: { className?: string }) {
  const pathname = usePathname();
  const { primaryTemplate } = usePageTemplates(pathname);

  if (!primaryTemplate) {
    return null;
  }

  const handleDownload = () => {
    if (primaryTemplate.downloadUrl) {
      window.open(primaryTemplate.downloadUrl, "_blank");
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      icon={<Download className="size-4" />}
      onClick={handleDownload}
      className={className}
    >
      Download Template
    </Button>
  );
}

export function ImportButton({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { importEnabled } = usePageTemplates(pathname);

  return (
    <Button
      variant="outline"
      size="sm"
      icon={<Upload className="size-4" />}
      onClick={() => router.push("/settings/import")}
      disabled={!importEnabled}
      className={!importEnabled ? `opacity-50 cursor-not-allowed ${className}` : className}
    >
      Import
    </Button>
  );
}
