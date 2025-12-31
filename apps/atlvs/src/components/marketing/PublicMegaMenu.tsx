'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Command, Users, Ticket, ArrowRight, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import {
  Body,
  Box,
  Button,
  Grid,
  List,
  ListItem,
  Nav,
  Stack,
  Text,
} from '@ghxstship/ui';
import {
  productsNavigation,
  solutionsNavigation,
  resourcesNavigation,
} from '@/data/public-navigation';

interface MegaMenuProps {
  className?: string;
}

const productIcons = {
  command: Command,
  users: Users,
  ticket: Ticket,
  sparkles: Sparkles,
};

export function PublicMegaMenu({ className }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMouseEnter = (menu: string) => setActiveMenu(menu);
  const handleMouseLeave = () => setActiveMenu(null);

  return (
    <Nav className={clsx('hidden lg:flex items-center gap-1', className)}>
      {/* Products Dropdown */}
      <Box
        className="relative"
        onMouseEnter={() => handleMouseEnter('products')}
        onMouseLeave={handleMouseLeave}
      >
        <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
          {productsNavigation.label}
          <ChevronDown className={clsx('h-4 w-4 chevron-toggle', activeMenu === 'products' && 'open')} />
        </Button>

        {activeMenu === 'products' && (
          <Box className="absolute left-0 top-full pt-2 z-50">
            <Box className="bg-background border-2 border-border rounded-card shadow-xl min-w-dropdown-md p-6">
              <Grid cols={3} gap={6}>
                {productsNavigation.products.map((product) => {
                  const IconComponent = productIcons[product.icon as keyof typeof productIcons] || Command;
                  return (
                    <Link
                      key={product.href}
                      href={product.href}
                      className="group p-4 rounded-card hover:bg-muted/50 border-2 interactive-border-primary"
                    >
                      <Stack direction="horizontal" gap={3} className="items-center mb-2">
                        <Box className="p-2 rounded-card bg-primary/10 text-primary">
                          <IconComponent className="h-5 w-5" />
                        </Box>
                        <Stack gap={0}>
                          <Text className="font-weight-bold text-foreground">{product.label}</Text>
                          <Text className="text-body-xs text-on-dark-muted">{product.tagline}</Text>
                        </Stack>
                      </Stack>
                      <Body className="text-body-sm text-on-dark-muted mb-3">{product.description}</Body>
                      <List className="flex flex-col gap-1">
                        {product.features.map((feature) => (
                          <ListItem key={feature} className="text-body-xs text-on-dark-muted flex items-center gap-2">
                            <Text className="w-1 h-1 rounded-avatar bg-primary" />
                            {feature}
                          </ListItem>
                        ))}
                      </List>
                      <Stack direction="horizontal" gap={1} className="mt-3 text-body-sm font-weight-medium text-primary items-center opacity-0 group-hover:opacity-100 transition-reveal">
                        View All Features <ArrowRight className="h-3 w-3" />
                      </Stack>
                    </Link>
                  );
                })}
              </Grid>

              <Box className="mt-6 pt-4 border-t border-border">
                <Text className="text-body-xs font-weight-medium text-on-dark-disabled uppercase tracking-kicker mb-2">Platform</Text>
                <Stack direction="horizontal" gap={4}>
                  {productsNavigation.quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-body-sm nav-link"
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Solutions Dropdown */}
      <Box
        className="relative"
        onMouseEnter={() => handleMouseEnter('solutions')}
        onMouseLeave={handleMouseLeave}
      >
        <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
          {solutionsNavigation.label}
          <ChevronDown className={clsx('h-4 w-4 chevron-toggle', activeMenu === 'solutions' && 'open')} />
        </Button>

        {activeMenu === 'solutions' && (
          <Box className="absolute left-0 top-full pt-2 z-50">
            <Box className="bg-background border-2 border-border rounded-card shadow-xl min-w-dropdown-lg p-6">
              <Text className="text-body-xs font-weight-medium text-on-dark-disabled uppercase tracking-kicker mb-4">Solutions by Role</Text>
              <Grid cols={3} gap={4} className="gap-x-8">
                {solutionsNavigation.groups.map((group) => (
                  <Stack key={group.title} gap={2}>
                    <Text className="font-weight-medium text-foreground">{group.title}</Text>
                    <List className="flex flex-col gap-1">
                      {group.items.map((item) => (
                        <ListItem key={item.href}>
                          <Link
                            href={item.href}
                            className="text-body-sm nav-link"
                          >
                            {item.label}
                          </Link>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                ))}
              </Grid>

              <Box className="mt-6 pt-4 border-t border-border">
                <Text className="text-body-xs font-weight-medium text-on-dark-disabled uppercase tracking-kicker mb-2">By Vertical</Text>
                <Stack direction="horizontal" gap={4}>
                  {solutionsNavigation.verticals.map((vertical) => (
                    <Link
                      key={vertical.href}
                      href={vertical.href}
                      className="text-body-sm nav-link"
                    >
                      {vertical.label}
                    </Link>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Resources Dropdown */}
      <Box
        className="relative"
        onMouseEnter={() => handleMouseEnter('resources')}
        onMouseLeave={handleMouseLeave}
      >
        <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
          {resourcesNavigation.label}
          <ChevronDown className={clsx('h-4 w-4 chevron-toggle', activeMenu === 'resources' && 'open')} />
        </Button>

        {activeMenu === 'resources' && (
          <Box className="absolute left-0 top-full pt-2 z-50">
            <Box className="bg-background border-2 border-border rounded-card shadow-xl min-w-dropdown-sm p-6">
              <Grid cols={3} gap={8}>
                {resourcesNavigation.groups.map((group) => (
                  <Stack key={group.title} gap={3}>
                    <Text className="font-weight-medium text-foreground">{group.title}</Text>
                    <List className="flex flex-col gap-2">
                      {group.items.map((item) => (
                        <ListItem key={item.href}>
                          <Link
                            href={item.href}
                            className="text-body-sm nav-link"
                          >
                            {item.label}
                          </Link>
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                ))}
              </Grid>

              <Box className="mt-6 pt-4 border-t border-border">
                <Text className="text-body-xs font-weight-medium text-on-dark-disabled uppercase tracking-kicker mb-2">Featured</Text>
                <Stack direction="horizontal" gap={4}>
                  {resourcesNavigation.featured.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-body-sm font-weight-medium text-primary nav-link"
                    >
                      {link.label}
                    </Link>
                  ))}
                </Stack>
              </Box>
            </Box>
          </Box>
        )}
      </Box>

      {/* Integrations (no dropdown) */}
      <Link
        href="/integrations"
        className="px-4 py-2 text-body-sm font-weight-medium nav-link"
      >
        Integrations
      </Link>

      {/* Pricing (no dropdown) */}
      <Link
        href="/pricing"
        className="px-4 py-2 text-body-sm font-weight-medium nav-link"
      >
        Pricing
      </Link>
    </Nav>
  );
}

export default PublicMegaMenu;
