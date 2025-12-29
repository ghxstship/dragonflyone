"use client";

import { ConsumerNavigationPublic } from "@/components/navigation";
import { NotFoundPage } from "@ghxstship/ui";

export default function NotFound() {
  return (
    <NotFoundPage
      navigation={<ConsumerNavigationPublic />}
      background="black"
      showDashboard={false}
      homePath="/events"
      showSearch={true}
      searchPath="/search"
      message="The page you are looking for does not exist or has been moved. Try browsing our events or use search to find what you need."
    />
  );
}
