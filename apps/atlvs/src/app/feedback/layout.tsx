"use client";

import { ReactNode } from "react";
import { AtlvsAppLayout } from "../../components/app-layout";

/**
 * Feedback Layout - Enhanced Navigation Shell
 */
export default function FeedbackLayout({ children }: { children: ReactNode }) {
  return <AtlvsAppLayout variant="authenticated">{children}</AtlvsAppLayout>;
}
