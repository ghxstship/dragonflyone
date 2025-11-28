"use client";

import { ConsumerNavigationPublic } from "@/components/navigation";
import { ErrorPage } from "@ghxstship/ui";

export default function Error({
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
      navigation={<ConsumerNavigationPublic />}
      appName="GVTEWAY"
      background="black"
      showDashboard={false}
    />
  );
}
