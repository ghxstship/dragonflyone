"use client";

import { AppErrorPage } from "@/components/error-pages";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <AppErrorPage error={error} reset={reset} />;
}
