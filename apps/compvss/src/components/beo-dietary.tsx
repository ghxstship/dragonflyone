"use client";

import { useState, useCallback } from "react";
import { Plus, X, AlertTriangle, Utensils, Users } from "lucide-react";
import {
  Badge,
  Body,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Grid,
  Input,
  Select,
  Stack,
} from '@ghxstship/ui';

export interface DietaryRequirement {
  id: string;
  type: string;
  guest_name?: string;
  guest_count: number;
  notes?: string;
  severity: "preference" | "allergy" | "intolerance" | "medical";
}

interface BEODietaryProps {
  requirements: DietaryRequirement[];
  onChange: (requirements: DietaryRequirement[]) => void;
  readOnly?: boolean;
}

const COMMON_DIETARY = [
  { type: "Vegetarian", severity: "preference" as const },
  { type: "Vegan", severity: "preference" as const },
  { type: "Gluten-Free", severity: "intolerance" as const },
  { type: "Dairy-Free", severity: "intolerance" as const },
  { type: "Nut Allergy", severity: "allergy" as const },
  { type: "Shellfish Allergy", severity: "allergy" as const },
  { type: "Kosher", severity: "preference" as const },
  { type: "Halal", severity: "preference" as const },
];

const SEVERITY_COLORS: Record<string, string> = {
  preference: "bg-info-100 text-info-800 border-info-200",
  intolerance: "bg-warning-100 text-warning-800 border-warning-200",
  allergy: "bg-error-100 text-error-800 border-error-200",
  medical: "bg-error-100 text-error-800 border-error-200",
};

const SEVERITY_LABELS: Record<string, string> = {
  preference: "Preference",
  intolerance: "Intolerance",
  allergy: "Allergy",
  medical: "Medical",
};

export function BEODietary({ requirements, onChange, readOnly = false }: BEODietaryProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newType, setNewType] = useState("");
  const [newGuestName, setNewGuestName] = useState("");
  const [newGuestCount, setNewGuestCount] = useState(1);
  const [newSeverity, setNewSeverity] = useState<DietaryRequirement["severity"]>("preference");
  const [newNotes, setNewNotes] = useState("");

  const addRequirement = useCallback((type: string, severity: DietaryRequirement["severity"]) => {
    const newReq: DietaryRequirement = {
      id: `dietary-${Date.now()}`,
      type,
      guest_count: 1,
      severity,
    };
    onChange([...requirements, newReq]);
  }, [requirements, onChange]);

  const addCustomRequirement = useCallback(() => {
    if (!newType.trim()) return;
    
    const newReq: DietaryRequirement = {
      id: `dietary-${Date.now()}`,
      type: newType,
      guest_name: newGuestName || undefined,
      guest_count: newGuestCount,
      severity: newSeverity,
      notes: newNotes || undefined,
    };
    onChange([...requirements, newReq]);
    
    setNewType("");
    setNewGuestName("");
    setNewGuestCount(1);
    setNewSeverity("preference");
    setNewNotes("");
    setShowAddForm(false);
  }, [requirements, onChange, newType, newGuestName, newGuestCount, newSeverity, newNotes]);

  const removeRequirement = useCallback((id: string) => {
    onChange(requirements.filter((req) => req.id !== id));
  }, [requirements, onChange]);

  const updateRequirement = useCallback((id: string, updates: Partial<DietaryRequirement>) => {
    onChange(requirements.map((req) => (req.id === id ? { ...req, ...updates } : req)));
  }, [requirements, onChange]);

  const allergyCount = requirements.filter(r => r.severity === "allergy" || r.severity === "medical").length;
  const totalGuests = requirements.reduce((sum, r) => sum + r.guest_count, 0);

  return (
    <Stack gap={4}>
      <Stack direction="horizontal" gap={4} className="items-center justify-between">
        <Stack direction="horizontal" gap={2} className="items-center">
          <Utensils className="size-4 text-primary" />
          <Body className="font-weight-semibold text-white">Dietary Requirements</Body>
          {allergyCount > 0 && (
            <Badge variant="solid" className="bg-error text-white">
              <AlertTriangle className="size-3 mr-1" />
              {allergyCount} Allergy
            </Badge>
          )}
        </Stack>
        <Stack direction="horizontal" gap={2} className="items-center">
          <Badge variant="ghost" className="text-mono-xs">
            <Users className="size-3 mr-1" />
            {totalGuests} guests
          </Badge>
          {!readOnly && (
            <Button 
              variant="outline" 
              size="sm" 
              icon={<Plus className="size-4" />}
              onClick={() => setShowAddForm(!showAddForm)}
            >
              Add
            </Button>
          )}
        </Stack>
      </Stack>

      {!readOnly && (
        <Stack direction="horizontal" gap={2} className="flex-wrap">
          {COMMON_DIETARY.map((item) => {
            const exists = requirements.some(r => r.type === item.type);
            return (
              <Button
                key={item.type}
                variant={exists ? "solid" : "ghost"}
                size="sm"
                onClick={() => !exists && addRequirement(item.type, item.severity)}
                disabled={exists}
                className={exists ? "opacity-50" : ""}
              >
                {item.type}
              </Button>
            );
          })}
        </Stack>
      )}

      {showAddForm && !readOnly && (
        <Card inverted className="border-2 border-primary">
          <CardHeader>
            <Body className="font-weight-medium text-white">Add Custom Requirement</Body>
          </CardHeader>
          <CardBody>
            <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
              <Stack gap={2}>
                <Body size="sm" className="text-text-muted">Type</Body>
                <Input
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  placeholder="e.g., Low Sodium"
                />
              </Stack>
              <Stack gap={2}>
                <Body size="sm" className="text-text-muted">Guest Name (optional)</Body>
                <Input
                  value={newGuestName}
                  onChange={(e) => setNewGuestName(e.target.value)}
                  placeholder="e.g., John Smith"
                />
              </Stack>
              <Stack gap={2}>
                <Body size="sm" className="text-text-muted">Guest Count</Body>
                <Input
                  type="number"
                  min={1}
                  value={newGuestCount}
                  onChange={(e) => setNewGuestCount(parseInt(e.target.value) || 1)}
                />
              </Stack>
              <Stack gap={2}>
                <Body size="sm" className="text-text-muted">Severity</Body>
                <Select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as DietaryRequirement["severity"])}
                  className="px-3 py-2 bg-surface-elevated border-2 border-border rounded-button text-body-sm text-text-secondary"
                >
                  <option value="preference">Preference</option>
                  <option value="intolerance">Intolerance</option>
                  <option value="allergy">Allergy</option>
                  <option value="medical">Medical</option>
                </Select>
              </Stack>
            </Grid>
            <Stack gap={2} className="mt-4">
              <Body size="sm" className="text-text-muted">Notes (optional)</Body>
              <Input
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Additional notes..."
              />
            </Stack>
            <Stack direction="horizontal" gap={2} className="mt-4 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
              <Button variant="solid" size="sm" onClick={addCustomRequirement}>Add Requirement</Button>
            </Stack>
          </CardBody>
        </Card>
      )}

      <Card inverted className="border-2 border-border">
        <CardBody>
          {requirements.length > 0 ? (
            <Stack gap={2}>
              {requirements.map((req) => (
                <Box
                  key={req.id}
                  className={`flex items-center justify-between p-3 rounded-button border-2 ${SEVERITY_COLORS[req.severity]}`}
                >
                  <Stack direction="horizontal" gap={3} className="items-center">
                    {(req.severity === "allergy" || req.severity === "medical") && (
                      <AlertTriangle className="size-4" />
                    )}
                    <Stack gap={0}>
                      <Body size="sm" className="font-weight-medium">
                        {req.type}
                        {req.guest_name && ` - ${req.guest_name}`}
                      </Body>
                      <Body size="sm" className="opacity-75">
                        {req.guest_count} guest{req.guest_count > 1 ? "s" : ""} • {SEVERITY_LABELS[req.severity]}
                        {req.notes && ` • ${req.notes}`}
                      </Body>
                    </Stack>
                  </Stack>
                  
                  {!readOnly && (
                    <Stack direction="horizontal" gap={2}>
                      <Input
                        type="number"
                        min={1}
                        value={req.guest_count}
                        onChange={(e) => updateRequirement(req.id, { guest_count: parseInt(e.target.value) || 1 })}
                        className="w-16 text-center"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<X className="size-4" />}
                        onClick={() => removeRequirement(req.id)}
                      />
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>
          ) : (
            <Stack gap={4} className="items-center justify-center py-8">
              <Utensils className="size-8 text-text-disabled" />
              <Body className="text-text-muted">No dietary requirements recorded</Body>
            </Stack>
          )}
        </CardBody>
      </Card>
    </Stack>
  );
}

export default BEODietary;
