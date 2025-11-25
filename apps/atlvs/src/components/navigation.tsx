"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { atlvsNavigation } from "../data/atlvs";
import { Header, Stack, Nav, Link, Button, Body, Box } from "@ghxstship/ui";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Check if we're on the landing page (root)
  const isLandingPage = pathname === "/";

  return (
    <Header className="sticky top-0 z-50 border-b border-ink-800 bg-ink-950/90 backdrop-blur">
      <Stack direction="horizontal" className="mx-auto max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="font-display text-3xl uppercase tracking-tight text-white">
          ATLVS
        </Link>
        <Nav className="hidden gap-8 text-sm uppercase tracking-[0.3em] text-ink-300 md:flex">
          {atlvsNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`transition ${isActive ? "text-white border-b-2 border-white" : "hover:text-ink-50"}`}
              >
                {item.label}
              </Link>
            );
          })}
        </Nav>
        <Stack direction="horizontal" className="items-center gap-3">
          <Link
            href="/deals"
            className="hidden md:inline-flex border border-ink-50 px-6 py-2 text-xs uppercase tracking-[0.3em] transition hover:-translate-y-0.5 hover:bg-ink-50 hover:text-ink-950"
          >
            New Deal
          </Link>
          <Button
            variant="ghost"
            className="md:hidden"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <Body className="sr-only">{isOpen ? "Close navigation" : "Open navigation"}</Body>
            <Stack className="h-5 w-6 gap-1.5">
              {[...Array(3)].map((_, idx) => (
                <Box
                  key={idx}
                  className={`block h-[2px] w-full bg-ink-50 transition-transform ${
                    isOpen && idx === 1 ? "opacity-0" : "opacity-100"
                  } ${isOpen && idx !== 1 ? (idx === 0 ? "translate-y-[7px] rotate-45" : "-translate-y-[7px] -rotate-45") : ""}`}
                />
              ))}
            </Stack>
          </Button>
        </Stack>
      </Stack>

      {isOpen ? (
        <Stack className="fixed inset-0 z-40 bg-ink-950/95 p-6 animate-in fade-in md:hidden">
          <Stack className="h-full justify-between pt-16">
            <Stack gap={6}>
              {atlvsNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`block border-b border-ink-800 pb-4 text-2xl uppercase tracking-[0.3em] ${isActive ? "text-white" : "text-ink-300"}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </Stack>
            <Stack gap={4}>
              <Link
                href="/deals"
                className="block w-full border border-ink-50 px-6 py-4 text-center text-xs uppercase tracking-[0.3em] text-ink-50"
                onClick={() => setIsOpen(false)}
              >
                New Deal
              </Link>
              <Link
                href="/contacts"
                className="block w-full border border-ink-700 px-6 py-4 text-center text-xs uppercase tracking-[0.3em] text-ink-400"
                onClick={() => setIsOpen(false)}
              >
                Contacts
              </Link>
            </Stack>
          </Stack>
        </Stack>
      ) : null}
    </Header>
  );
}
