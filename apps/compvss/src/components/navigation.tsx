"use client";

import { usePathname } from "next/navigation";
import { compvssNavigation } from "../data/compvss";
import { AppNavigation } from "@ghxstship/ui";

export function Navigation() {
  const pathname = usePathname();

  return (
    <AppNavigation
      logo="COMPVSS"
      navItems={compvssNavigation}
      pathname={pathname}
      primaryCta={{ label: "New Project", href: "/projects/new" }}
      secondaryCta={{ label: "Crew Directory", href: "/crew" }}
      colorScheme="black"
    />
  );
}
