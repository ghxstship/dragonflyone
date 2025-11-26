"use client";

import { Navigation } from "../components/navigation";
import { NotFoundPage } from "@ghxstship/ui";

export default function NotFound() {
  return (
    <NotFoundPage
      navigation={<Navigation />}
      background="ink"
      showDashboard={true}
      dashboardPath="/dashboard"
    />
  );
}
