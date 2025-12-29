"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function ChatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorPage
      error={error}
      reset={reset}
      appName="GVTEWAY"
      background="black"
      showDashboard={false}
      title="Chat Error"
      description="There was a problem loading the chat. Please try again."
    />
  );
}
