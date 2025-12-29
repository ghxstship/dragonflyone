"use client";

import { CreatorNavigationAuthenticated } from "../components/navigation";
import { NotFoundPage } from "@ghxstship/ui";

export default function NotFound() {
  return (
    <NotFoundPage
      navigation={<CreatorNavigationAuthenticated />}
      background="ink"
      showDashboard={true}
      dashboardPath="/dashboard"
      showSearch={true}
      searchPath="/search"
      message="The page you are looking for does not exist or has been moved. Return to your dashboard or use search to find what you need."
    />
  );
}
