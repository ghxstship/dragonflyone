"use client";

import { useState } from "react";
// Layout provided by route group
import {
  ListPage, H3, Body, Stack, Button, Card, Badge, Modal, ModalHeader, ModalBody, ModalFooter} from "@ghxstship/ui";
import { createExportHandler, getSubcategoryNames } from "@ghxstship/config";
import {
  useTroubleshootingGuides,
  type TroubleshootingGuide,
} from '@/hooks/useTroubleshooting';
import { Eye, ThumbsUp } from "lucide-react";

const categories = getSubcategoryNames('TECH');

export default function TroubleshootingPage() {
  const { data: guides = [], isLoading, refetch } = useTroubleshootingGuides();
  const [selectedGuide, setSelectedGuide] = useState<TroubleshootingGuide | null>(null);

  const columns: ListPageColumn<TroubleshootingGuide>[] = [
    {
      key: 'title',
      label: 'Guide',
      accessor: 'title',
      sortable: true,
      render: (_, g) => (
        <Stack gap={1}>
          <Body className="font-display">{g.title}</Body>
          <Body size="sm" className="text-muted-foreground">{g.symptom}</Body>
        </Stack>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      accessor: 'category',
      sortable: true,
      render: (_, g) => <Badge variant="outline">{g.category}</Badge>,
    },
    { key: 'steps', label: 'Steps', accessor: (g) => `${g.steps.length} steps` },
    { key: 'views', label: 'Views', accessor: 'views', sortable: true },
    { key: 'helpful', label: 'Helpful', accessor: (g) => `${g.helpful}%`, sortable: true },
  ];

  const filters: ListPageFilter[] = [
    {
      key: 'category',
      label: 'Category',
      options: categories.map(c => ({ value: c, label: c })),
    },
  ];

  const rowActions: ListPageAction<TroubleshootingGuide>[] = [
    { id: 'view', label: 'View', icon: <Eye className="h-4 w-4" />, onClick: (g) => setSelectedGuide(g) },
    { id: 'helpful', label: 'Mark Helpful', icon: <ThumbsUp className="h-4 w-4" />, onClick: () => {} },
  ];

  const stats = [
    { label: 'Total Guides', value: guides.length },
    { label: 'Categories', value: categories.length },
    { label: 'Total Views', value: guides.reduce((s, g) => s + g.views, 0) },
    { label: 'Helpful Rate', value: '81%' },
  ];

  return (
    <>
      <ListPage<TroubleshootingGuide>
        title="Troubleshooting Guides"
        subtitle="Decision trees and step-by-step problem resolution"
        data={guides}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        onRetry={refetch}
        searchPlaceholder="Describe your issue..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(g) => setSelectedGuide(g)}
        entityType="troubleshooting"
        onExport={createExportHandler({
          filename: "troubleshooting-guides",
          getData: () => guides.map((g: TroubleshootingGuide) => ({
            title: g.title,
            category: g.category,
            symptom: g.symptom,
            steps: g.steps.length,
            views: g.views,
            helpful: g.helpful,
          })),
        })}
        stats={stats}
        emptyMessage="No troubleshooting guides found"
        showFavorite
        showSettings
      />

      <Modal open={!!selectedGuide} onClose={() => setSelectedGuide(null)}>
        <ModalHeader><H3>{selectedGuide?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedGuide && (
            <Stack gap={4}>
              <Badge variant="outline">{selectedGuide.category}</Badge>
              <Stack gap={1}>
                <Body size="sm" className="">Symptom</Body>
                <Body>{selectedGuide.symptom}</Body>
              </Stack>
              <Stack gap={2}>
                <Body size="sm" className="">Troubleshooting Steps</Body>
                {selectedGuide.steps.map((step, idx) => (
                  <Card key={idx} className="p-3">
                    <Stack direction="horizontal" gap={3}>
                      <Badge variant="solid">{idx + 1}</Badge>
                      <Body>{step}</Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Stack gap={1}>
                <Body size="sm" className="">Resolution</Body>
                <Body>{selectedGuide.resolution}</Body>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedGuide(null)}>Close</Button>
          <Button variant="outline">Not Helpful</Button>
          <Button variant="solid">Helpful</Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
