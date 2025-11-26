"use client";

import { usePathname } from "next/navigation";
import { gvtewayNavigation } from "../data/gvteway";
import { AppNavigation } from "@ghxstship/ui";

export function Navigation() {
  const pathname = usePathname();

  return (
    <AppNavigation
      logo="GVTEWAY"
      navItems={gvtewayNavigation}
      pathname={pathname}
      primaryCta={{ label: "Browse Events", href: "/events" }}
      secondaryCta={{ label: "Sign In", href: "/auth/signin" }}
      colorScheme="black"
    />
  );
}
