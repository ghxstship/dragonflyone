"use client";

import { AtlvsAppLayout } from "../../components/app-layout";
import {
  Stack,
  Container,
  Body,
  Box,
  Text,
  FullBleedSection,
  Button,
  H2,
} from "@ghxstship/ui";
import { useAuthContext, PlatformRole } from "@ghxstship/config";
import { useRouter } from "next/navigation";
import NextLink from "next/link";
import { GeneratorHero } from "./components/GeneratorHero";
import { GeneratorProgress } from "./components/GeneratorProgress";
import { BlueprintPreview } from "./components/BlueprintPreview";
import { ExportCTA } from "./components/ExportCTA";
import { ChatInterface } from "./components/ChatInterface";
import { useExperienceGenerator } from "./hooks/useExperienceGenerator";

export const runtime = "edge";

// =============================================================================
// EXPERIENCE GENERATOR PAGE
// Public page for AI-powered experience blueprint generation
// Design: Bold Contemporary Pop Art Adventure with ATLVS Miami Pink accent
// Layout: Split-screen with AI chat on right, blueprint preview on left
// =============================================================================

export default function GeneratorPage() {
  const router = useRouter();
  const { user, hasRole } = useAuthContext();
  const ATLVS_ROLES = [
    PlatformRole.ATLVS_SUPER_ADMIN,
    PlatformRole.ATLVS_ADMIN,
    PlatformRole.ATLVS_TEAM_MEMBER,
    PlatformRole.ATLVS_VIEWER,
    PlatformRole.LEGEND_SUPER_ADMIN,
    PlatformRole.LEGEND_ADMIN,
    PlatformRole.LEGEND_DEVELOPER,
  ];
  const isAuthorized = user ? ATLVS_ROLES.some((role) => hasRole(role)) : false;

  const {
    creativeSeed,
    setCreativeSeed,
    isGenerating,
    progress,
    blueprint,
    error,
    messages,
    generate,
    reset,
    sendFollowUp,
  } = useExperienceGenerator();

  // Auth gate: require sign-in before using generator
  if (!user) {
    return (
      <AtlvsAppLayout variant="public" background="white" rawContent>
        <FullBleedSection background="white" pattern="grid" patternOpacity={0.03} className="min-h-screen py-24">
          <Container className="mx-auto max-w-container-4xl px-6 text-center">
            <Stack gap={6} className="items-center">
              <Text className="font-mono text-mono-sm uppercase tracking-label text-grey-500">
                Authentication Required
              </Text>
              <H2 className="text-ink-950">Sign in to generate experience blueprints</H2>
              <Body className="text-grey-600 max-w-2xl">
                The ATLVS Experience Generator is available to authenticated ATLVS and LEGEND users. Please sign in or create an account to continue.
              </Body>
              <Stack direction="horizontal" gap={4} className="flex-wrap justify-center">
                <NextLink href="/auth/signin">
                  <Button variant="primary" size="lg">Sign In</Button>
                </NextLink>
                <NextLink href="/auth/signup">
                  <Button variant="outline" size="lg">Create Account</Button>
                </NextLink>
              </Stack>
            </Stack>
          </Container>
        </FullBleedSection>
      </AtlvsAppLayout>
    );
  }

  // Authorization gate: user signed in but lacks platform roles
  if (!isAuthorized) {
    return (
      <AtlvsAppLayout variant="public" background="white" rawContent>
        <FullBleedSection background="white" className="min-h-screen py-24">
          <Container className="mx-auto max-w-container-4xl px-6 text-center">
            <Stack gap={6} className="items-center">
              <Box className="flex size-16 items-center justify-center border-2 border-warning bg-warning/10">
                <Text className="text-h3-md text-warning">!</Text>
              </Box>
              <H2 className="text-ink-950">Access restricted</H2>
              <Body className="text-grey-600 max-w-2xl">
                You need ATLVS or LEGEND platform access to use the Experience Generator. Contact an admin to request access.
              </Body>
              <Button variant="outline" size="lg" onClick={() => router.push("/auth/unauthorized")}>
                View Access Options
              </Button>
            </Stack>
          </Container>
        </FullBleedSection>
      </AtlvsAppLayout>
    );
  }

  // Initial state - show hero with input
  if (!blueprint && !isGenerating && messages.length === 0) {
    return (
      <AtlvsAppLayout variant="public" background="white" rawContent>
        <GeneratorHero
          creativeSeed={creativeSeed}
          onCreativeSeedChange={setCreativeSeed}
          onGenerate={generate}
          isGenerating={isGenerating}
        />
      </AtlvsAppLayout>
    );
  }

  // Generating state - show progress
  if (isGenerating && !blueprint) {
    return (
      <AtlvsAppLayout variant="public" background="white" rawContent>
        <GeneratorProgress
          progress={progress}
          creativeSeed={creativeSeed}
        />
      </AtlvsAppLayout>
    );
  }

  // Error state
  if (error && !blueprint) {
    return (
      <AtlvsAppLayout variant="public" background="white" rawContent>
        <FullBleedSection background="white" className="min-h-screen py-24">
          <Container className="mx-auto max-w-container-4xl px-6 text-center">
            <Stack gap={6} className="items-center">
              <Box className="flex size-16 items-center justify-center border-2 border-error bg-error/10">
                <Text className="text-h3-md text-error">!</Text>
              </Box>
              <H2 className="text-ink-950">Something went wrong</H2>
              <Body className="text-grey-600">{error}</Body>
              <Button
                onClick={reset}
                className="border-2 border-ink-950 bg-white px-8 py-4 font-display uppercase tracking-label shadow-sm"
              >
                Try Again
              </Button>
            </Stack>
          </Container>
        </FullBleedSection>
      </AtlvsAppLayout>
    );
  }

  // Blueprint generated - show split-screen layout with chat
  if (blueprint) {
    return (
      <AtlvsAppLayout variant="public" background="white" rawContent>
        {/* Split Screen Layout */}
        <Box className="flex min-h-screen flex-col lg:flex-row">
          {/* Left Side - Blueprint Preview (scrollable) */}
          <Box className="flex-1 overflow-y-auto lg:w-3/5">
            <BlueprintPreview blueprint={blueprint} />
            <ExportCTA blueprint={blueprint} onReset={reset} />
          </Box>

          {/* Right Side - AI Chat Panel (fixed) */}
          <Box className="border-l-2 border-ink-950 bg-white lg:w-2/5">
            <Box className="sticky top-0 flex h-screen flex-col">
              {/* Chat Header */}
              <Box className="border-b-2 border-ink-950 bg-grey-50 px-6 py-4">
                <Stack direction="horizontal" gap={3} className="items-center justify-between">
                  <Stack gap={1}>
                    <Text className="font-display text-h6-md uppercase text-ink-950">
                      AI Experience Designer
                    </Text>
                    <Text className="font-mono text-mono-xs text-grey-500">
                      Ask questions to refine your blueprint
                    </Text>
                  </Stack>
                  <Box className="flex size-3 items-center justify-center rounded-avatar bg-success" title="Online" />
                </Stack>
              </Box>

              {/* Chat Messages */}
              <Box className="flex-1 overflow-hidden">
                <ChatInterface
                  messages={messages}
                  isTyping={isGenerating}
                  onSendMessage={sendFollowUp}
                  disabled={isGenerating}
                  placeholder="Ask about budget, sensory design, zones..."
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </AtlvsAppLayout>
    );
  }

  // Fallback - should not reach here
  return (
    <AtlvsAppLayout variant="public" background="white" rawContent>
      <GeneratorHero
        creativeSeed={creativeSeed}
        onCreativeSeedChange={setCreativeSeed}
        onGenerate={generate}
        isGenerating={isGenerating}
      />
    </AtlvsAppLayout>
  );
}
