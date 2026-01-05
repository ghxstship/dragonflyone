"use client";

import React, { useState, useCallback } from "react";
import {
  GripVertical,
  Trash2,
  Type,
  Image,
  Table,
  FileText,
  DollarSign,
  Calendar,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";
import { proposalBuilderVariants } from "./ProposalBuilder.variants.js";
import type { 
  ProposalBuilderProps,
  ProposalBlock,
  ProposalBlockType
} from "./ProposalBuilder.types.js";

const blockTypes: { type: ProposalBlockType; label: string; icon: React.ElementType }[] = [
  { type: "heading", label: "Heading", icon: Type },
  { type: "text", label: "Text Block", icon: FileText },
  { type: "image", label: "Image", icon: Image },
  { type: "pricing", label: "Pricing Table", icon: DollarSign },
  { type: "terms", label: "Terms & Conditions", icon: Table },
  { type: "timeline", label: "Event Timeline", icon: Calendar },
];

const generateId = () => `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

/**
 * ProposalBuilder component - Bold Contemporary Pop Art Adventure
 * 
 * Features:
 * - Drag and drop block reordering
 * - Multiple content block types
 * - Inline editing for block content
 * - Block management (add, remove, reorder)
 * - Read-only mode support
 * - Visual block type indicators
 */
export function ProposalBuilder({
  blocks,
  onChange,
  readonly = false,
  className,
}: ProposalBuilderProps) {
  const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);

  const addBlock = useCallback(
    (type: ProposalBlockType) => {
      const newBlock: ProposalBlock = {
        id: generateId(),
        type,
        content: getDefaultContent(type),
        order: blocks.length,
      };
      onChange([...blocks, newBlock]);
    },
    [blocks, onChange]
  );

  const updateBlock = useCallback(
    (id: string, content: Record<string, unknown>) => {
      onChange(blocks.map((b) => (b.id === id ? { ...b, content } : b)));
    },
    [blocks, onChange]
  );

  const removeBlock = useCallback(
    (id: string) => {
      onChange(blocks.filter((b) => b.id !== id));
    },
    [blocks, onChange]
  );

  const moveBlock = useCallback(
    (id: string, direction: "up" | "down") => {
      const index = blocks.findIndex((b) => b.id === id);
      if (index === -1) return;
      if (direction === "up" && index === 0) return;
      if (direction === "down" && index === blocks.length - 1) return;

      const newBlocks = [...blocks];
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
      onChange(newBlocks.map((b, i) => ({ ...b, order: i })));
    },
    [blocks, onChange]
  );

  return (
    <div className={clsx(proposalBuilderVariants({ readonly }), className)}>
      {/* Block List */}
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={block.id}
            className={clsx(
              "border-2 rounded-card transition-all",
              draggedBlockId === block.id ? "border-primary opacity-50" : "border-border"
            )}
          >
            {/* Block Header */}
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 border-b border-border">
              {!readonly && (
                <button
                  className="p-1 cursor-grab hover:bg-muted rounded-button transition-colors"
                  onMouseDown={() => setDraggedBlockId(block.id)}
                  onMouseUp={() => setDraggedBlockId(null)}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
              <span className="text-body-sm font-weight-medium capitalize flex-1">
                {block.type.replace("_", " ")}
              </span>
              {!readonly && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveBlock(block.id, "up")}
                    disabled={index === 0}
                    className="p-1 hover:bg-muted rounded-button transition-colors disabled:opacity-50"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveBlock(block.id, "down")}
                    disabled={index === blocks.length - 1}
                    className="p-1 hover:bg-muted rounded-button transition-colors disabled:opacity-50"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => removeBlock(block.id)}
                    className="p-1 hover:bg-destructive/10 text-destructive rounded-button transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Block Content */}
            <div className="p-4">
              <BlockEditor
                block={block}
                onChange={(content) => updateBlock(block.id, content)}
                readonly={readonly}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Block Toolbar */}
      {!readonly && (
        <div className="border-2 border-dashed border-border rounded-card p-4">
          <p className="text-body-sm text-muted-foreground mb-3">Add Content Block</p>
          <div className="flex flex-wrap gap-2">
            {blockTypes.map((bt) => (
              <button
                key={bt.type}
                onClick={() => addBlock(bt.type)}
                className="flex items-center gap-2 px-3 py-2 border-2 border-border rounded-button hover:border-primary hover:text-primary transition-colors"
              >
                <bt.icon className="h-4 w-4" />
                <span className="text-body-sm">{bt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {blocks.length === 0 && readonly && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-body-md text-muted-foreground">No content blocks yet</p>
        </div>
      )}
    </div>
  );
}

function getDefaultContent(type: ProposalBlockType): Record<string, unknown> {
  switch (type) {
    case "heading":
      return { text: "Section Heading", level: 2 };
    case "text":
      return { html: "<p>Enter your content here...</p>" };
    case "image":
      return { url: "", alt: "", caption: "" };
    case "pricing":
      return { items: [], subtotal: 0, tax: 0, total: 0 };
    case "terms":
      return { text: "Enter your terms and conditions..." };
    case "timeline":
      return { events: [] };
    case "signature":
      return { label: "Client Signature", required: true };
    default:
      return {};
  }
}

interface BlockEditorProps {
  block: ProposalBlock;
  onChange: (content: Record<string, unknown>) => void;
  readonly: boolean;
}

function BlockEditor({ block, onChange, readonly }: BlockEditorProps) {
  const content = block.content;

  switch (block.type) {
    case "heading":
      return (
        <input
          type="text"
          value={(content.text as string) || ""}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          placeholder="Enter heading..."
          className="w-full text-h3-md font-weight-bold border-0 bg-transparent focus:outline-none"
          disabled={readonly}
        />
      );

    case "text":
      return (
        <textarea
          value={(content.html as string)?.replace(/<[^>]*>/g, "") || ""}
          onChange={(e) => onChange({ ...content, html: `<p>${e.target.value}</p>` })}
          placeholder="Enter text content..."
          rows={4}
          className="w-full text-body-md border-0 bg-transparent focus:outline-none resize-none"
          disabled={readonly}
        />
      );

    case "terms":
      return (
        <textarea
          value={(content.text as string) || ""}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          placeholder="Enter terms and conditions..."
          rows={6}
          className="w-full text-body-sm border-0 bg-transparent focus:outline-none resize-none"
          disabled={readonly}
        />
      );

    case "image":
      return (
        <div className="space-y-2">
          <input
            type="text"
            value={(content.url as string) || ""}
            onChange={(e) => onChange({ ...content, url: e.target.value })}
            placeholder="Image URL..."
            className="w-full px-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary"
            disabled={readonly}
          />
          <input
            type="text"
            value={(content.caption as string) || ""}
            onChange={(e) => onChange({ ...content, caption: e.target.value })}
            placeholder="Caption (optional)..."
            className="w-full px-3 py-2 border-2 border-border rounded-button text-body-sm focus:outline-none focus:border-primary"
            disabled={readonly}
          />
        </div>
      );

    case "pricing":
      return (
        <div className="text-body-sm text-muted-foreground">
          Pricing table editor - Use the line item editor in the main form
        </div>
      );

    case "timeline":
      return (
        <div className="text-body-sm text-muted-foreground">
          Timeline editor - Add event schedule items
        </div>
      );

    case "signature":
      return (
        <div className="p-4 border-2 border-dashed border-border rounded-card text-center">
          <p className="text-body-sm text-muted-foreground">
            {(content.label as string) || "Signature"} will appear here
          </p>
        </div>
      );

    default:
      return <div className="text-body-sm text-muted-foreground">Unknown block type</div>;
  }
}

export default ProposalBuilder;
