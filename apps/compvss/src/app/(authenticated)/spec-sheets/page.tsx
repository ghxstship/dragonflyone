"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ListPage, H3, Body, Grid, Stack, Button, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Table, TableBody, TableRow, TableCell,
  type ListPageAction} from "@ghxstship/ui";
import { createExportHandler, getSubcategoryNames, getEntityColumns, getEntityFilters } from "@ghxstship/config";
import {
  useSpecSheets,
  type SpecSheet,
} from '@/hooks/useSpecSheets';
import { Eye, Download } from "lucide-react";

const categories = getSubcategoryNames('TECH');

export default function SpecSheetsPage() {
  const router = useRouter();
  const { data: specSheets = [], refetch } = useSpecSheets();
  const [selectedSpec, setSelectedSpec] = useState<SpecSheet | null>(null);

  const columns = getEntityColumns<SpecSheet>('spec-sheets');
  const filters = getEntityFilters('spec-sheets');

  const rowActions: ListPageAction<SpecSheet>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (s) => setSelectedSpec(s) },
    { id: 'download', label: 'Download', icon: <Download className="h-4 w-4" />, onClick: () => {} },
  ];

  const stats = [
    { label: 'Total Specs', value: specSheets.length },
    { label: 'Categories', value: categories.length },
    { label: 'Manufacturers', value: new Set(specSheets.map(s => s.manufacturer)).size },
    { label: 'Downloads', value: specSheets.reduce((sum, s) => sum + s.downloads, 0) },
  ];

  return (
    <>
      <ListPage<SpecSheet>
        title="Technical Specifications"
        subtitle="Equipment specification sheets and cut sheets library"
        data={specSheets}
        columns={columns}
        rowKey="id"
        loading={false}
        onRetry={refetch}
        searchPlaceholder="Search specs..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(s) => setSelectedSpec(s)}
        createLabel="Upload Spec Sheet"
        onCreate={() => router.push('/spec-sheets/upload')}
        entityType="spec-sheets"
        onExport={createExportHandler({
          filename: "spec-sheets",
          getData: () => specSheets.map((s: SpecSheet) => ({
            name: s.name,
            manufacturer: s.manufacturer,
            model: s.model,
            category: s.category,
            version: s.version,
            fileSize: s.fileSize,
            downloads: s.downloads,
          })),
        })}
        stats={stats}
        emptyMessage="No spec sheets found"
        emptyAction={{ label: 'Upload Spec Sheet', onClick: () => router.push('/spec-sheets/upload') }}
        enableCapabilityDetection
        onScanAction={(capability, route) => router.push(route)}
        capabilityBasePath=""
        showFavorite
        showSettings
      />

      <Modal open={!!selectedSpec} onClose={() => setSelectedSpec(null)}>
        <ModalHeader><H3>{selectedSpec?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedSpec && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Stack gap={1}>
                  <Body size="sm" className="">Manufacturer</Body>
                  <Body>{selectedSpec.manufacturer}</Body>
                </Stack>
                <Badge variant="outline">{selectedSpec.category}</Badge>
              </Stack>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Model</Body>
                  <Body>{selectedSpec.model}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Version</Body>
                  <Body>{selectedSpec.version}</Body>
                </Stack>
              </Grid>
              <Stack gap={2}>
                <Body className="font-display">Specifications</Body>
                <Table variant="dark">
                  <TableBody>
                    {selectedSpec.specs.map((spec, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Body size="sm" className="">{spec.label}</Body></TableCell>
                        <TableCell><Body>{spec.value}</Body></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}>
                  <Body size="sm" className="">Last Updated</Body>
                  <Body>{selectedSpec.lastUpdated}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">File Size</Body>
                  <Body>{selectedSpec.fileSize}</Body>
                </Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSpec(null)}>Close</Button>
          <Button variant="solid">Download PDF</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
