import type { ReactNode } from "react";

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  shortcut?: string;
  href?: string;
  action?: () => void;
  category?: string;
  keywords?: string[];
}

export interface CommandCategory {
  id: string;
  label: string;
  items: CommandItem[];
}

export interface CommandPaletteProps {
  /** Whether the palette is open */
  open: boolean;
  /** Callback when palette should close */
  onClose: () => void;
  /** Categories of commands */
  categories?: CommandCategory[];
  /** Flat list of commands (alternative to categories) */
  items?: CommandItem[];
  /** Placeholder text for search */
  placeholder?: string;
  /** Callback when an item is selected */
  onSelect?: (item: CommandItem) => void;
  /** Navigation callback */
  onNavigate?: (href: string) => void;
  /** Recent items to show by default */
  recentItems?: CommandItem[];
  /** Dark mode */
  inverted?: boolean;
  /** Additional className */
  className?: string;
}
