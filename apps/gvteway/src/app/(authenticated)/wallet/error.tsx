"use client";

import { ErrorPage } from "@ghxstship/ui";

export default function WalletError({
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
      title="Wallet Error"
      description="There was a problem loading your wallet. Please try again."
    />
  );
}
