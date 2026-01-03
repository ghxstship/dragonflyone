"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, GripVertical, Save, Clock, Users, Utensils, Volume2, Settings } from "lucide-react";
import {
  Stack,
  Body,
  Card,
  CardHeader,
  CardBody,
  Button,
  Input,
  Textarea,
  Label,
  Badge,
} from "@ghxstship/ui";

export interface BEOSection {
  id: string;
  type: "event_details" | "timeline" | "catering" | "av_requirements" | "setup_requirements" | "notes";
  title: string;
  content: Record<string, unknown>;
  order: number;
}

interface BEOBuilderProps {
  initialSections?: BEOSection[];
  onSave?: (sections: BEOSection[]) => void;
  isLoading?: boolean;
}

const SECTION_ICONS: Record<string, React.ReactNode> = {
  event_details: <Users className="size-4" />,
  timeline: <Clock className="size-4" />,
  catering: <Utensils className="size-4" />,
  av_requirements: <Volume2 className="size-4" />,
  setup_requirements: <Settings className="size-4" />,
  notes: <Settings className="size-4" />,
};

const SECTION_TEMPLATES: Record<string, { title: string; defaultContent: Record<string, unknown> }> = {
  event_details: { title: "Event Details", defaultContent: { name: "", date: "", time: "", guest_count: 0 } },
  timeline: { title: "Timeline", defaultContent: { items: [] } },
  catering: { title: "Catering", defaultContent: { menu_items: [], dietary_requirements: [] } },
  av_requirements: { title: "A/V Requirements", defaultContent: { items: [] } },
  setup_requirements: { title: "Setup Requirements", defaultContent: { items: [] } },
  notes: { title: "Notes", defaultContent: { text: "" } },
};

export function BEOBuilder({ initialSections = [], onSave, isLoading }: BEOBuilderProps) {
  const [sections, setSections] = useState<BEOSection[]>(initialSections);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addSection = useCallback((type: BEOSection["type"]) => {
    const template = SECTION_TEMPLATES[type];
    const newSection: BEOSection = {
      id: `section-${Date.now()}`,
      type,
      title: template.title,
      content: { ...template.defaultContent },
      order: sections.length,
    };
    setSections([...sections, newSection]);
  }, [sections]);

  const removeSection = useCallback((id: string) => {
    setSections(sections.filter((s) => s.id !== id));
  }, [sections]);

  const updateSection = useCallback((id: string, updates: Partial<BEOSection>) => {
    setSections(sections.map((s) => (s.id === id ? { ...s, ...updates } : s)));
  }, [sections]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newSections = [...sections];
    const [removed] = newSections.splice(draggedIndex, 1);
    newSections.splice(index, 0, removed);
    setSections(newSections.map((s, i) => ({ ...s, order: i })));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSave = () => {
    onSave?.(sections);
  };

  return (
    <Stack gap={6}>
      <Stack direction="horizontal" gap={4} className="items-center justify-between">
        <Body className="font-weight-semibold text-white">BEO Sections</Body>
        <Button 
          variant="solid" 
          size="sm" 
          icon={<Save className="size-4" />}
          onClick={handleSave}
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save BEO"}
        </Button>
      </Stack>

      <Stack direction="horizontal" gap={2} className="flex-wrap">
        {Object.entries(SECTION_TEMPLATES).map(([type, template]) => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            icon={SECTION_ICONS[type]}
            onClick={() => addSection(type as BEOSection["type"])}
          >
            Add {template.title}
          </Button>
        ))}
      </Stack>

      <Stack gap={4}>
        {sections.map((section, index) => (
          <Card
            key={section.id}
            inverted
            className={`border-2 ${draggedIndex === index ? "border-primary" : "border-border"}`}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
          >
            <CardHeader>
              <Stack direction="horizontal" gap={4} className="items-center justify-between">
                <Stack direction="horizontal" gap={3} className="items-center">
                  <GripVertical className="size-4 text-text-disabled cursor-grab" />
                  {SECTION_ICONS[section.type]}
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(section.id, { title: e.target.value })}
                    className="bg-transparent border-none text-white font-weight-medium"
                  />
                  <Badge variant="outline" className="text-mono-xs">
                    {section.type.replace("_", " ")}
                  </Badge>
                </Stack>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="size-4 text-error" />}
                  onClick={() => removeSection(section.id)}
                />
              </Stack>
            </CardHeader>
            <CardBody>
              <BEOSectionEditor
                section={section}
                onUpdate={(content) => updateSection(section.id, { content })}
              />
            </CardBody>
          </Card>
        ))}
      </Stack>

      {sections.length === 0 && (
        <Card inverted className="border-2 border-dashed border-border p-8">
          <Stack gap={4} className="items-center justify-center">
            <Plus className="size-8 text-text-disabled" />
            <Body className="text-text-muted">Add sections to build your BEO</Body>
          </Stack>
        </Card>
      )}
    </Stack>
  );
}

interface BEOSectionEditorProps {
  section: BEOSection;
  onUpdate: (content: Record<string, unknown>) => void;
}

function BEOSectionEditor({ section, onUpdate }: BEOSectionEditorProps) {
  const content = section.content as Record<string, unknown>;

  switch (section.type) {
    case "event_details":
      return (
        <Stack gap={4}>
          <Stack gap={2}>
            <Label size="sm">Event Name</Label>
            <Input
              value={(content.name as string) || ""}
              onChange={(e) => onUpdate({ ...content, name: e.target.value })}
              placeholder="Enter event name"
            />
          </Stack>
          <Stack direction="horizontal" gap={4}>
            <Stack gap={2} className="flex-1">
              <Label size="sm">Date</Label>
              <Input
                type="date"
                value={(content.date as string) || ""}
                onChange={(e) => onUpdate({ ...content, date: e.target.value })}
              />
            </Stack>
            <Stack gap={2} className="flex-1">
              <Label size="sm">Time</Label>
              <Input
                type="time"
                value={(content.time as string) || ""}
                onChange={(e) => onUpdate({ ...content, time: e.target.value })}
              />
            </Stack>
            <Stack gap={2} className="flex-1">
              <Label size="sm">Guest Count</Label>
              <Input
                type="number"
                value={(content.guest_count as number) || 0}
                onChange={(e) => onUpdate({ ...content, guest_count: parseInt(e.target.value) })}
              />
            </Stack>
          </Stack>
        </Stack>
      );

    case "notes":
      return (
        <Textarea
          value={(content.text as string) || ""}
          onChange={(e) => onUpdate({ ...content, text: e.target.value })}
          placeholder="Add notes..."
          rows={4}
        />
      );

    default:
      return (
        <Body size="sm" className="text-text-muted">
          Section editor for {section.type} - content can be edited in JSON format
        </Body>
      );
  }
}

export default BEOBuilder;
