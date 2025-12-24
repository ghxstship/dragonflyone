"use client";

import React, { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, MoreHorizontal, TrendingUp, GripVertical } from "lucide-react";
import clsx from "clsx";

export interface PipelineDeal {
  id: string;
  deal_number: string;
  name: string;
  value: number;
  probability: number;
  contact_name?: string;
  expected_close_date?: string;
  assignee?: { full_name: string };
}

export interface PipelineStage {
  id: string;
  name: string;
  color: string;
  probability: number;
  order_index: number;
  deals: PipelineDeal[];
}

export interface PipelineBoardProps {
  stages: PipelineStage[];
  onDealMove: (dealId: string, fromStage: string, toStage: string) => void;
  onDealClick?: (deal: PipelineDeal) => void;
  onAddDeal?: (stageId: string) => void;
  onStageSettings?: (stageId: string) => void;
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

interface SortableDealCardProps {
  deal: PipelineDeal;
  onClick?: () => void;
}

function SortableDealCard({ deal, onClick }: SortableDealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        "bg-background border-2 border-border rounded-card p-3 cursor-pointer transition-all",
        isDragging ? "shadow-lg opacity-50 rotate-2" : "hover:shadow-md hover:border-primary/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 -ml-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-body-xs text-muted-foreground">{deal.deal_number}</p>
          <p className="text-body-sm font-weight-medium line-clamp-2 mt-0.5">{deal.name}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-body-sm font-weight-semibold text-primary">
              {formatCurrency(deal.value)}
            </span>
            <span className="text-body-xs px-2 py-0.5 bg-muted rounded-badge">
              {deal.probability}%
            </span>
          </div>
          {deal.contact_name && (
            <p className="text-body-xs text-muted-foreground mt-1 truncate">
              {deal.contact_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function DealCardOverlay({ deal }: { deal: PipelineDeal }) {
  return (
    <div className="bg-background border-2 border-primary rounded-card p-3 shadow-xl rotate-3">
      <div className="flex items-start gap-2">
        <div className="p-1 -ml-1 text-muted-foreground">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-body-xs text-muted-foreground">{deal.deal_number}</p>
          <p className="text-body-sm font-weight-medium line-clamp-2 mt-0.5">{deal.name}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-body-sm font-weight-semibold text-primary">
              {formatCurrency(deal.value)}
            </span>
            <span className="text-body-xs px-2 py-0.5 bg-muted rounded-badge">
              {deal.probability}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PipelineBoard({
  stages,
  onDealMove,
  onDealClick,
  onAddDeal,
  onStageSettings,
  isLoading = false,
}: PipelineBoardProps) {
  const [activeDeal, setActiveDeal] = useState<PipelineDeal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const deal = stages
      .flatMap((s) => s.deals)
      .find((d) => d.id === active.id);
    if (deal) {
      setActiveDeal(deal);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const activeStage = stages.find((s) =>
      s.deals.some((d) => d.id === active.id)
    );
    const overStage = stages.find(
      (s) => s.id === over.id || s.deals.some((d) => d.id === over.id)
    );

    if (!activeStage || !overStage) return;
    if (activeStage.id === overStage.id) return;

    onDealMove(String(active.id), activeStage.id, overStage.id);
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex-shrink-0 w-72 bg-muted/30 rounded-card animate-pulse h-96"
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 min-h-[600px]">
        {stages.map((stage) => {
          const stageValue = stage.deals.reduce((sum, d) => sum + d.value, 0);
          const weightedValue = stage.deals.reduce(
            (sum, d) => sum + (d.value * d.probability) / 100,
            0
          );

          return (
            <div key={stage.id} className="flex-shrink-0 w-72">
              <div className="bg-muted/30 rounded-card border-2 border-border h-full flex flex-col">
                {/* Stage Header */}
                <div className="p-3 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-body-sm font-weight-semibold">
                        {stage.name}
                      </span>
                      <span className="text-body-xs px-1.5 py-0.5 bg-muted rounded-badge">
                        {stage.deals.length}
                      </span>
                    </div>
                    <button
                      onClick={() => onStageSettings?.(stage.id)}
                      className="p-1 hover:bg-muted rounded-button transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-body-xs text-muted-foreground">
                      {formatCurrency(stageValue)}
                    </span>
                    <span className="text-body-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {formatCurrency(weightedValue)}
                    </span>
                  </div>
                </div>

                {/* Deals List */}
                <SortableContext
                  items={stage.deals.map((d) => d.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="p-2 flex-1 overflow-y-auto">
                    <div className="space-y-2">
                      {stage.deals.map((deal) => (
                        <SortableDealCard
                          key={deal.id}
                          deal={deal}
                          onClick={() => onDealClick?.(deal)}
                        />
                      ))}
                    </div>

                    {/* Add Deal Button */}
                    <button
                      onClick={() => onAddDeal?.(stage.id)}
                      className="w-full mt-2 p-2 border-2 border-dashed border-border rounded-card text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-body-xs">Add Deal</span>
                    </button>
                  </div>
                </SortableContext>
              </div>
            </div>
          );
        })}
      </div>

      <DragOverlay>
        {activeDeal ? <DealCardOverlay deal={activeDeal} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export default PipelineBoard;
