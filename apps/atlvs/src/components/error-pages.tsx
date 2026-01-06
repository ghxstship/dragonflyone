"use client";

import { createAppErrorComponents } from "@ghxstship/ui";
import { errorConfig } from "@/config/error-config";

/**
 * ATLVS Error Components - Generated from shared factory
 * Eliminates duplication by using centralized error component creation
 */
export const { AppErrorPage, AppErrorContent, AppNotFoundPage } = createAppErrorComponents(errorConfig);
