import { z } from "zod";

export const TenantBrandConfigSchema = z.object({
  name: z.string().min(1).max(100),
  subdomain: z.string().regex(/^[a-z0-9-]+$/).optional(),
  customDomain: z.string().url().optional(),
  logo: z.object({
    primary: z.string(),
    mark: z.string(),
    wordmark: z.string().optional(),
    favicon: z.string(),
    dark: z
      .object({
        primary: z.string(),
        mark: z.string(),
      })
      .optional(),
  }),
  colors: z
    .object({
      primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
      primaryHover: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      primaryActive: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      primarySubtle: z.string().optional(),
      secondary: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      accent: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    })
    .optional(),
  fonts: z
    .object({
      primary: z.string().optional(),
      secondary: z.string().optional(),
      googleFonts: z.array(z.string()).optional(),
    })
    .optional(),
  content: z
    .object({
      appName: z.string().optional(),
      tagline: z.string().optional(),
      supportEmail: z.string().email().optional(),
      supportUrl: z.string().url().optional(),
      docsUrl: z.string().url().optional(),
      termsUrl: z.string().optional(),
      privacyUrl: z.string().optional(),
      copyrightHolder: z.string().optional(),
    })
    .optional(),
  features: z
    .object({
      showPoweredBy: z.boolean().default(true),
      customEmailTemplates: z.boolean().default(false),
      customDomain: z.boolean().default(false),
    })
    .optional(),
});

export type TenantBrandConfig = z.infer<typeof TenantBrandConfigSchema>;
