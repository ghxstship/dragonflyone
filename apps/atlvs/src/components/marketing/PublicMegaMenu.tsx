'use client';

import Link from 'next/link';
import { Command, Users, Ticket, Sparkles } from 'lucide-react';
import clsx from 'clsx';
import {
  Grid,
  List,
  ListItem,
  Stack,
  Text,
  MegaMenu,
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
  return (
    <MegaMenu.Root className={clsx('hidden lg:flex', className)}>
      {/* Products Dropdown */}
      <MegaMenu.Item>
        <MegaMenu.Trigger>{productsNavigation.label}</MegaMenu.Trigger>
        <MegaMenu.Content size="lg">
          <Grid cols={2} gap={4}>
            {productsNavigation.products.map((product) => {
              const IconComponent = productIcons[product.icon as keyof typeof productIcons] || Command;
              return (
                <MegaMenu.ItemLink
                  key={product.href}
                  href={product.href}
                  icon={<IconComponent className="h-5 w-5" />}
                  description={product.tagline}
                >
                  {product.label}
                </MegaMenu.ItemLink>
              );
            })}
          </Grid>

          <MegaMenu.Footer>
            <MegaMenu.Section title="Platform">
              <Stack direction="horizontal" gap={4}>
                {productsNavigation.quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-body-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </MegaMenu.Section>
          </MegaMenu.Footer>
        </MegaMenu.Content>
      </MegaMenu.Item>

      {/* Solutions Dropdown */}
      <MegaMenu.Item>
        <MegaMenu.Trigger>{solutionsNavigation.label}</MegaMenu.Trigger>
        <MegaMenu.Content size="xl">
          <Text className="text-mono-xs font-weight-medium text-muted-foreground uppercase tracking-kicker mb-4">
            Solutions by Role
          </Text>
          <Grid cols={3} gap={6}>
            {solutionsNavigation.groups.map((group) => (
              <MegaMenu.Section key={group.title} title={group.title}>
                <List className="flex flex-col gap-1">
                  {group.items.map((item) => (
                    <ListItem key={item.href}>
                      <Link
                        href={item.href}
                        className="text-body-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </MegaMenu.Section>
            ))}
          </Grid>

          <MegaMenu.Footer>
            <MegaMenu.Section title="By Vertical">
              <Stack direction="horizontal" gap={4}>
                {solutionsNavigation.verticals.map((vertical) => (
                  <Link
                    key={vertical.href}
                    href={vertical.href}
                    className="text-body-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {vertical.label}
                  </Link>
                ))}
              </Stack>
            </MegaMenu.Section>
          </MegaMenu.Footer>
        </MegaMenu.Content>
      </MegaMenu.Item>

      {/* Resources Dropdown */}
      <MegaMenu.Item>
        <MegaMenu.Trigger>{resourcesNavigation.label}</MegaMenu.Trigger>
        <MegaMenu.Content size="lg">
          <Grid cols={3} gap={6}>
            {resourcesNavigation.groups.map((group) => (
              <MegaMenu.Section key={group.title} title={group.title}>
                <List className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <ListItem key={item.href}>
                      <Link
                        href={item.href}
                        className="text-body-sm text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </MegaMenu.Section>
            ))}
          </Grid>

          <MegaMenu.Footer>
            <MegaMenu.Section title="Featured">
              <Stack direction="horizontal" gap={4}>
                {resourcesNavigation.featured.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-body-sm font-weight-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </Stack>
            </MegaMenu.Section>
          </MegaMenu.Footer>
        </MegaMenu.Content>
      </MegaMenu.Item>

      {/* Integrations (no dropdown) */}
      <MegaMenu.Link href="/integrations">Integrations</MegaMenu.Link>

      {/* Pricing (no dropdown) */}
      <MegaMenu.Link href="/pricing">Pricing</MegaMenu.Link>
    </MegaMenu.Root>
  );
}

export default PublicMegaMenu;
