"use client";

import { usePathname } from "next/navigation";
import { atlvsNavigation } from "../data/atlvs";
import { AppNavigation } from "@ghxstship/ui";

export function Navigation() {
  const pathname = usePathname();

  return (
    <AppNavigation
      logo="ATLVS"
      navItems={atlvsNavigation}
      pathname={pathname}
      primaryCta={{ label: "New Deal", href: "/deals" }}
      secondaryCta={{ label: "Contacts", href: "/contacts" }}
      colorScheme="ink"
    />
  );
}
