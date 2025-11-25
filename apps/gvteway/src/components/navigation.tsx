"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { gvtewayNavigation } from "../data/gvteway";
import { Header, Stack, Nav, Link, Button, Display, Box, Body } from "@ghxstship/ui";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <Header className="sticky top-0 z-40 border-b border-ink-800 bg-black/90 backdrop-blur">
      <Stack direction="horizontal" className="mx-auto max-w-6xl items-center justify-between px-6 py-6 text-xs uppercase tracking-[0.35em] text-ink-300 lg:px-8">
        <Link href="/" className="font-display text-3xl tracking-tight text-white">
          GVTEWAY
        </Link>
        <Nav className="hidden gap-6 md:flex">
          {gvtewayNavigation.map((item) => {
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
        </Nav>
        <Stack direction="horizontal" className="items-center gap-3">
          <Link
            href="/events"
            className="hidden border border-white px-6 py-2 text-[0.6rem] tracking-[0.4em] text-white transition hover:-translate-y-0.5 hover:bg-white hover:text-black md:inline-flex"
          >
            Browse Events
          </Link>
          <Link
            href="/auth/signin"
            className="hidden border border-grey-700 px-6 py-2 text-[0.6rem] tracking-[0.4em] text-grey-400 transition hover:border-white hover:text-white md:inline-flex"
          >
            Sign In
          </Link>
          <Button
            variant="ghost"
            className="md:hidden"
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            <Body className="sr-only">{isOpen ? "Close navigation" : "Open navigation"}</Body>
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

      {isOpen ? (
        <Stack className="border-t border-ink-800 bg-black px-6 py-6 text-sm uppercase tracking-[0.4em] text-white md:hidden">
          <Nav className="flex flex-col divide-y divide-ink-900">
            {gvtewayNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`py-4 ${isActive ? "text-white" : "text-grey-400"}`}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </Nav>
          <Stack gap={3} className="mt-6">
            <Link
              href="/events"
              className="block border border-white px-6 py-3 text-center text-[0.6rem] tracking-[0.4em] text-white"
              onClick={() => setIsOpen(false)}
            >
              Browse Events
            </Link>
            <Link
              href="/auth/signin"
              className="block border border-grey-700 px-6 py-3 text-center text-[0.6rem] tracking-[0.4em] text-grey-400"
              onClick={() => setIsOpen(false)}
            >
              Sign In
            </Link>
          </Stack>
        </Stack>
      ) : null}
    </Header>
  );
}
