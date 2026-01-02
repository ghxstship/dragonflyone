'use client';

import {
  Box,
  Button,
  Text,
  Stack,
  Container,
  Label,
  Body,
  Header,
} from '@ghxstship/ui';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import clsx from 'clsx';
import { PublicMegaMenu } from './PublicMegaMenu';
import {
  productsNavigation,
  solutionsNavigation,
  resourcesNavigation,
} from '@/data/public-navigation';

interface PublicHeaderProps {
  className?: string;
}

export function PublicHeader({ className }: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <Header variant="page" className={clsx('sticky top-0 z-header bg-surface-primary/95 backdrop-blur supports-[backdrop-filter]:bg-surface-primary/60 border-b-2 border-ink-950', className)}>
      <Container size="xl" className="px-container-sm">
        <Stack direction="horizontal" gap={4} className="items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <Stack direction="horizontal" gap={2} className="items-center">
              <Box className="w-8 h-8 bg-ink-950 rounded-card flex items-center justify-center">
                <Text className="text-white font-heading text-body-sm">A</Text>
              </Box>
              <Text className="font-heading text-h4-md tracking-label">ATLVS</Text>
            </Stack>
          </Link>

          {/* Desktop Navigation */}
          <PublicMegaMenu />

          {/* Desktop CTAs */}
          <Stack direction="horizontal" gap={3} className="hidden lg:flex items-center">
            <Link href="/auth/signup">
              <Button variant="primary" size="sm" inverted={false}>Get Started</Button>
            </Link>
            <Link href="/auth/signin">
              <Button variant="ghost" size="sm" inverted={false}>Sign In</Button>
            </Link>
          </Stack>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            inverted
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
          </Button>
        </Stack>
      </Container>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <Box className="lg:hidden border-t-2 border-ink-950 bg-surface-primary">
          <Container size="xl" className="px-container-sm py-container-sm">
            <Stack gap={4}>
              {/* Products */}
              <Stack gap={2}>
                <Label size="sm" className="text-ink-950">Products</Label>
                <Stack gap={1} className="pl-4">
                  {productsNavigation.products.map((product) => (
                    <Link
                      key={product.href}
                      href={product.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Body size="sm" className="text-on-light-muted hover:text-ink-950 transition-colors py-1">{product.label}</Body>
                    </Link>
                  ))}
                </Stack>
              </Stack>

              {/* Solutions */}
              <Stack gap={2}>
                <Label size="sm" className="text-ink-950">Solutions</Label>
                <Stack gap={1} className="pl-4">
                  {solutionsNavigation.groups.slice(0, 3).map((group) => (
                    <Stack key={group.title} gap={1}>
                      <Label size="xs" className="text-on-light-muted uppercase mt-2">{group.title}</Label>
                      {group.items.slice(0, 2).map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Body size="sm" className="text-on-light-muted hover:text-ink-950 transition-colors py-1">{item.label}</Body>
                        </Link>
                      ))}
                    </Stack>
                  ))}
                  <Link
                    href="/solutions"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Body size="sm" className="text-brand-pink font-heading py-1">View All Solutions</Body>
                  </Link>
                </Stack>
              </Stack>

              {/* Resources */}
              <Stack gap={2}>
                <Label size="sm" className="text-ink-950">Resources</Label>
                <Stack gap={1} className="pl-4">
                  {resourcesNavigation.groups.map((group) => (
                    <Link
                      key={group.items[0].href}
                      href={group.items[0].href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Body size="sm" className="text-on-light-muted hover:text-ink-950 transition-colors py-1">{group.title}</Body>
                    </Link>
                  ))}
                </Stack>
              </Stack>

              {/* Pricing */}
              <Stack gap={2}>
                <Link
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Label size="sm" className="text-ink-950">Pricing</Label>
                </Link>
              </Stack>

              {/* CTAs */}
              <Stack gap={2} className="pt-4 border-t-2 border-ink-950">
                <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" fullWidth inverted={false}>Get Started</Button>
                </Link>
                <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" size="md" fullWidth inverted={false}>Sign In</Button>
                </Link>
              </Stack>
            </Stack>
          </Container>
        </Box>
      )}
    </Header>
  );
}

export default PublicHeader;
