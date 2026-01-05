export type ProposalBlockType =
  | "text"
  | "heading"
  | "image"
  | "pricing"
  | "terms"
  | "timeline"
  | "signature";

export interface ProposalBlock {
  id: string;
  type: ProposalBlockType;
  content: Record<string, unknown>;
  order: number;
}

export interface ProposalBuilderProps {
  blocks: ProposalBlock[];
  onChange: (blocks: ProposalBlock[]) => void;
  onPreview?: () => void;
  readonly?: boolean;
  className?: string;
}
