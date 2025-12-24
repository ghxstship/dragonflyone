'use client';

import {
  Body,
  Button,
  H3,
  Input,
  Label,
  Text,
  Textarea,
} from '@ghxstship/ui';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Layout, Plus, Trash2, RotateCcw, ZoomIn, ZoomOut, Move, MousePointer } from 'lucide-react';
import { useFloorPlan, useUpdateFloorPlan, useFloorPlanObjects } from '@/hooks/useFloorPlans';

interface PlacedObject {
  id: string;
  object_id: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  name?: string;
  metadata?: Record<string, unknown>;
}

type Tool = 'select' | 'move' | 'add';

export default function EditFloorPlanPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();

  const { data, isLoading, error } = useFloorPlan(id);
  const { data: objectsData } = useFloorPlanObjects();
  const updateMutation = useUpdateFloorPlan();

  const floorPlan = data?.floor_plan;
  const availableObjects = useMemo(() => objectsData?.objects || [], [objectsData?.objects]);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [placedObjects, setPlacedObjects] = useState<PlacedObject[]>([]);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [zoom, setZoom] = useState(1);
  const [hasChanges, setHasChanges] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (floorPlan) {
      setName(floorPlan.name);
      setDescription(floorPlan.description || '');
      setPlacedObjects(floorPlan.objects || []);
    }
  }, [floorPlan]);

  const handleSave = async () => {
    if (!floorPlan) return;

    setSaveError(null);
    try {
      await updateMutation.mutateAsync({
        id,
        input: {
          name,
          description: description || undefined,
          objects: placedObjects,
        },
      });
      setHasChanges(false);
      router.push(`/floor-plans/${id}`);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save floor plan');
    }
  };

  const handleAddObject = useCallback((objectId: string) => {
    const objectDef = availableObjects.find((o) => o.id === objectId);
    if (!objectDef) return;

    const newObject: PlacedObject = {
      id: `placed-${Date.now()}`,
      object_id: objectId,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      rotation: 0,
      scale: 1,
      name: objectDef.name,
    };

    setPlacedObjects((prev) => [...prev, newObject]);
    setSelectedObject(newObject.id);
    setHasChanges(true);
  }, [availableObjects]);

  const handleDeleteSelected = useCallback(() => {
    if (!selectedObject) return;
    setPlacedObjects((prev) => prev.filter((o) => o.id !== selectedObject));
    setSelectedObject(null);
    setHasChanges(true);
  }, [selectedObject]);

  const handleRotateSelected = useCallback((direction: 'cw' | 'ccw') => {
    if (!selectedObject) return;
    setPlacedObjects((prev) =>
      prev.map((o) =>
        o.id === selectedObject
          ? { ...o, rotation: (o.rotation + (direction === 'cw' ? 15 : -15)) % 360 }
          : o
      )
    );
    setHasChanges(true);
  }, [selectedObject]);

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded-card w-1/3" />
          <div className="h-96 bg-muted rounded-card" />
        </div>
      </div>
    );
  }

  if (error || !floorPlan) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border-2 border-destructive rounded-card p-4 text-destructive">
          Failed to load floor plan. The floor plan may not exist.
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => {
              if (hasChanges && !confirm('You have unsaved changes. Leave anyway?')) return;
              router.push(`/floor-plans/${id}`);
            }}
            className="p-2 border-2 border-border hover:bg-muted rounded-button transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-card border-2 border-primary/20">
              <Layout className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setHasChanges(true);
                }}
                className="text-h3-md font-weight-bold text-foreground bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-primary rounded px-1"
                placeholder="Floor Plan Name"
              />
              {floorPlan.space && (
                <Body className="text-body-xs text-muted-foreground">{floorPlan.space.name}</Body>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <Text className="text-body-xs text-warning mr-2">Unsaved changes</Text>
          )}
          <Button
            onClick={handleSave}
            disabled={updateMutation.isPending || !hasChanges}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-button border-2 border-primary font-weight-medium text-body-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {updateMutation.isPending ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className="px-4 py-2 bg-destructive/10 border-b border-destructive text-destructive text-body-sm">
          {saveError}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Objects */}
        <div className="w-64 border-r border-border bg-muted/20 overflow-y-auto">
          <div className="p-4">
            <H3 className="text-body-sm font-weight-semibold text-foreground mb-3">Objects</H3>
            <div className="space-y-2">
              {availableObjects.map((obj) => (
                <Button
                  key={obj.id}
                  onClick={() => handleAddObject(obj.id)}
                  className="w-full flex items-center gap-2 p-2 rounded-button border-2 border-border hover:bg-muted transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-body-xs">
                    {obj.icon_svg ? (
                      <div dangerouslySetInnerHTML={{ __html: obj.icon_svg }} />
                    ) : (
                      obj.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Body className="text-body-sm font-weight-medium truncate">{obj.name}</Body>
                    <Body className="text-body-xs text-muted-foreground capitalize">{obj.category}</Body>
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </Button>
              ))}
              {availableObjects.length === 0 && (
                <Body className="text-body-xs text-muted-foreground text-center py-4">
                  No objects available
                </Body>
              )}
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-background">
            <div className="flex items-center gap-1">
              <Button
                onClick={() => setActiveTool('select')}
                className={`p-2 rounded-button transition-colors ${
                  activeTool === 'select' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                title="Select"
              >
                <MousePointer className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setActiveTool('move')}
                className={`p-2 rounded-button transition-colors ${
                  activeTool === 'move' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                }`}
                title="Move"
              >
                <Move className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => setZoom((z) => Math.max(0.25, z - 0.25))}
                className="p-2 hover:bg-muted rounded-button transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Text className="text-body-xs text-muted-foreground w-12 text-center">
                {Math.round(zoom * 100)}%
              </Text>
              <Button
                onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
                className="p-2 hover:bg-muted rounded-button transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <Button
                onClick={() => handleRotateSelected('ccw')}
                disabled={!selectedObject}
                className="p-2 hover:bg-muted rounded-button transition-colors disabled:opacity-50"
                title="Rotate CCW"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleDeleteSelected}
                disabled={!selectedObject}
                className="p-2 hover:bg-destructive/10 text-destructive rounded-button transition-colors disabled:opacity-50"
                title="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 overflow-auto bg-muted/30 p-4">
            <div
              className="relative bg-white border-2 border-border rounded-card mx-auto"
              style={{
                width: `${(floorPlan.dimensions?.width || 800) * zoom}px`,
                height: `${(floorPlan.dimensions?.height || 600) * zoom}px`,
                backgroundImage: 'linear-gradient(#e5e5e5 1px, transparent 1px), linear-gradient(90deg, #e5e5e5 1px, transparent 1px)',
                backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedObject(null);
                }
              }}
            >
              {placedObjects.map((obj) => {
                const objDef = availableObjects.find((o) => o.id === obj.object_id);
                const isSelected = selectedObject === obj.id;

                return (
                  <div
                    key={obj.id}
                    className={`absolute cursor-move flex items-center justify-center rounded transition-shadow ${
                      isSelected ? 'ring-2 ring-primary ring-offset-2' : ''
                    }`}
                    style={{
                      left: `${obj.x * zoom}px`,
                      top: `${obj.y * zoom}px`,
                      width: `${(objDef?.dimensions?.width || 40) * obj.scale * zoom}px`,
                      height: `${(objDef?.dimensions?.height || 40) * obj.scale * zoom}px`,
                      transform: `rotate(${obj.rotation}deg)`,
                      backgroundColor: 'rgba(99, 102, 241, 0.2)',
                      border: '2px solid rgba(99, 102, 241, 0.5)',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedObject(obj.id);
                    }}
                  >
                    <Text className="text-body-xs font-weight-medium text-primary truncate px-1">
                      {obj.name || objDef?.name || 'Object'}
                    </Text>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 border-l border-border bg-muted/20 overflow-y-auto">
          <div className="p-4">
            <H3 className="text-body-sm font-weight-semibold text-foreground mb-3">Properties</H3>

            <div className="space-y-4">
              <div>
                <Label className="block text-body-xs text-muted-foreground mb-1">Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => {
                    setDescription(e.target.value);
                    setHasChanges(true);
                  }}
                  rows={3}
                  className="w-full px-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="Floor plan description..."
                />
              </div>

              <div className="pt-4 border-t border-border">
                <Body className="text-body-xs text-muted-foreground mb-2">Floor Plan Info</Body>
                <div className="space-y-1 text-body-xs">
                  <Body>
                    <Text className="text-muted-foreground">Dimensions: </Text>
                    {floorPlan.dimensions?.width} x {floorPlan.dimensions?.height} {floorPlan.dimensions?.unit || 'ft'}
                  </Body>
                  <Body>
                    <Text className="text-muted-foreground">Objects: </Text>
                    {placedObjects.length}
                  </Body>
                  <Body>
                    <Text className="text-muted-foreground">Version: </Text>
                    {floorPlan.version}
                  </Body>
                </div>
              </div>

              {selectedObject && (
                <div className="pt-4 border-t border-border">
                  <Body className="text-body-xs font-weight-medium text-foreground mb-2">Selected Object</Body>
                  {(() => {
                    const obj = placedObjects.find((o) => o.id === selectedObject);
                    if (!obj) return null;
                    return (
                      <div className="space-y-2 text-body-xs">
                        <Body>
                          <Text className="text-muted-foreground">Name: </Text>
                          {obj.name || 'Unnamed'}
                        </Body>
                        <Body>
                          <Text className="text-muted-foreground">Position: </Text>
                          ({Math.round(obj.x)}, {Math.round(obj.y)})
                        </Body>
                        <Body>
                          <Text className="text-muted-foreground">Rotation: </Text>
                          {obj.rotation}°
                        </Body>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
