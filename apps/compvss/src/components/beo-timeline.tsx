"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, Clock, GripVertical } from "lucide-react";
import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  CardBody,
  Input,
  Label,
  Select,
  Stack,
} from '@ghxstship/ui';

export interface TimelineItem {
  id: string;
  time: string;
  description: string;
  department?: string;
  duration_minutes?: number;
  is_critical?: boolean;
}

interface BEOTimelineProps {
  items: TimelineItem[];
  onChange: (items: TimelineItem[]) => void;
  readOnly?: boolean;
}

const DEPARTMENTS = ["Kitchen", "Service", "Bar", "A/V", "Setup", "Management"];

export function BEOTimeline({ items, onChange, readOnly = false }: BEOTimelineProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addItem = useCallback(() => {
    const newItem: TimelineItem = {
      id: `timeline-${Date.now()}`,
      time: "",
      description: "",
      department: "Service",
      is_critical: false,
    };
    onChange([...items, newItem]);
  }, [items, onChange]);

  const removeItem = useCallback((id: string) => {
    onChange(items.filter((item) => item.id !== id));
  }, [items, onChange]);

  const updateItem = useCallback((id: string, updates: Partial<TimelineItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }, [items, onChange]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...items];
    const [removed] = newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, removed);
    onChange(newItems);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const sortedItems = [...items].sort((a, b) => {
    if (!a.time || !b.time) return 0;
    return a.time.localeCompare(b.time);
  });

  return (
    <Stack gap={4}>
      <Stack direction="horizontal" gap={4} className="items-center justify-between">
        <Stack direction="horizontal" gap={2} className="items-center">
          <Clock className="size-4 text-primary" />
          <Body className="font-weight-semibold text-white">Event Timeline</Body>
          <Badge variant="ghost" className="text-mono-xs">{items.length} items</Badge>
        </Stack>
        {!readOnly && (
          <Button variant="outline" size="sm" icon={<Plus className="size-4" />} onClick={addItem}>
            Add Item
          </Button>
        )}
      </Stack>

      <Card inverted className="border-2 border-border">
        <CardBody>
          {items.length > 0 ? (
            <Stack gap={2}>
              {sortedItems.map((item, index) => (
                <Box
                  key={item.id}
                  draggable={!readOnly}
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`flex items-start gap-4 p-3 rounded-button border-2 transition-colors ${
                    draggedIndex === index ? "border-primary bg-surface-elevated" : "border-border hover:border-border"
                  } ${item.is_critical ? "border-l-4 border-l-warning" : ""}`}
                >
                  {!readOnly && (
                    <GripVertical className="size-4 text-text-disabled cursor-grab mt-2" />
                  )}
                  
                  <Stack gap={2} className="flex-1">
                    <Stack direction="horizontal" gap={4} className="items-center">
                      {readOnly ? (
                        <Body className="text-primary font-mono text-body-sm min-w-[70px]">
                          {item.time || "--:--"}
                        </Body>
                      ) : (
                        <Input
                          type="time"
                          value={item.time}
                          onChange={(e) => updateItem(item.id, { time: e.target.value })}
                          className="w-24"
                        />
                      )}
                      
                      {readOnly ? (
                        <Badge variant="ghost" className="text-mono-xs">
                          {item.department}
                        </Badge>
                      ) : (
                        <Select
                          value={item.department || "Service"}
                          onChange={(e) => updateItem(item.id, { department: e.target.value })}
                          className="px-2 py-1 bg-surface-elevated border-2 border-border rounded-button text-body-sm text-text-secondary"
                        >
                          {DEPARTMENTS.map((dept) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </Select>
                      )}

                      {!readOnly && (
                        <Label className="flex items-center gap-2 text-body-sm text-text-muted">
                          <Input
                            type="checkbox"
                            checked={item.is_critical || false}
                            onChange={(e) => updateItem(item.id, { is_critical: e.target.checked })}
                            className="rounded"
                          />
                          Critical
                        </Label>
                      )}
                    </Stack>

                    {readOnly ? (
                      <Body size="sm" className="text-text-secondary">{item.description}</Body>
                    ) : (
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, { description: e.target.value })}
                        placeholder="Description..."
                        className="flex-1"
                      />
                    )}
                  </Stack>

                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Trash2 className="size-4 text-error" />}
                      onClick={() => removeItem(item.id)}
                    />
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <Stack gap={4} className="items-center justify-center py-8">
              <Clock className="size-8 text-text-disabled" />
              <Body className="text-text-muted">No timeline items yet</Body>
              {!readOnly && (
                <Button variant="outline" size="sm" icon={<Plus className="size-4" />} onClick={addItem}>
                  Add First Item
                </Button>
              )}
            </Stack>
          )}
        </CardBody>
      </Card>
    </Stack>
  );
}

export default BEOTimeline;
