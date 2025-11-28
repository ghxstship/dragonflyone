"use client";

import { ConsumerNavigationPublic } from "@/components/navigation";
import { NotFoundPage } from "@ghxstship/ui";

export default function NotFound() {
  return (
    <NotFoundPage
      navigation={<ConsumerNavigationPublic />}
      background="black"
      showDashboard={false}
    />
  );
}
