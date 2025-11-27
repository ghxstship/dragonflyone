"use client";

import { CreatorNavigationAuthenticated } from "../components/navigation";
import { NotFoundPage } from "@ghxstship/ui";

export default function NotFound() {
  return (
    <NotFoundPage
      navigation={<CreatorNavigationAuthenticated />}
      background="black"
      showDashboard={true}
      dashboardPath="/dashboard"
    />
  );
}
