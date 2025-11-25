"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { compvssNavigation } from "../data/compvss";
import { Stack, Button, Header, Nav, Link as UILink, Box, Body } from "@ghxstship/ui";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Header className="sticky top-0 z-50 border-b border-grey-800 bg-black/90 backdrop-blur">
      <Stack direction="horizontal" className="mx-auto max-w-6xl items-center justify-between px-6 py-6 lg:px-8">
        <Link href="/" className="font-display text-3xl uppercase tracking-tight text-white">
          COMPVSS
        </Link>
        <Nav className="hidden md:flex">
          <Stack direction="horizontal" gap={8} className="text-sm uppercase tracking-[0.3em] text-grey-300">
            {compvssNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link 
                  key={item.label} 
                  href={item.href} 
                  className={`transition ${isActive ? "text-white border-b-2 border-white" : "hover:text-white"}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </Stack>
        </Nav>
        <Stack direction="horizontal" gap={3} className="items-center">
          <Link
            href="/projects/new"
            className="hidden md:inline-flex border border-white px-6 py-2 text-xs uppercase tracking-[0.3em] transition hover:-translate-y-0.5 hover:bg-white hover:text-black"
          >
            New Project
          </Link>
          <Button
            variant="ghost"
            className="md:hidden"
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={isOpen}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <Stack className="h-5 w-6 gap-1.5">
              {[...Array(3)].map((_, idx) => (
                <Box
                  key={idx}
                  className={`block h-[2px] w-full bg-white transition-transform ${
                    isOpen && idx === 1 ? "opacity-0" : "opacity-100"
                  } ${
                    isOpen && idx !== 1
                      ? idx === 0
                        ? "translate-y-[7px] rotate-45"
                        : "-translate-y-[7px] -rotate-45"
                      : ""
                  }`}
                />
              ))}
            </Stack>
          </Button>
        </Stack>
      </Stack>

      {isOpen && (
        <Stack className="fixed inset-0 z-40 bg-black/95 p-6 animate-in fade-in md:hidden">
          <Stack className="h-full justify-between pt-16">
            <Stack gap={6}>
              {compvssNavigation.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`block border-b border-grey-800 pb-4 text-2xl uppercase tracking-[0.3em] ${isActive ? "text-white" : "text-grey-300"}`}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </Stack>
            <Stack gap={4}>
              <Link
                href="/projects/new"
                className="block w-full border border-white px-6 py-4 text-center text-xs uppercase tracking-[0.3em] text-white"
                onClick={() => setIsOpen(false)}
              >
                New Project
              </Link>
              <Link
                href="/crew"
                className="block w-full border border-grey-700 px-6 py-4 text-center text-xs uppercase tracking-[0.3em] text-grey-400"
                onClick={() => setIsOpen(false)}
              >
                Crew Directory
              </Link>
            </Stack>
          </Stack>
        </Stack>
      )}
    </Header>
  );
}
