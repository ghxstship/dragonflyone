import type { ShortcutCategory } from "../../hooks/useKeyboardShortcuts.js";

export interface KeyboardShortcutsModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when modal should close */
  onClose: () => void;
  /** Shortcut categories to display */
  categories: ShortcutCategory[];
  /** Additional class name */
  className?: string;
}
