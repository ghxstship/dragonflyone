'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, Command, Users, Ticket, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import {
  Body,
  Button,
  List,
  ListItem,
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
};

export function PublicMegaMenu({ className }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleMouseEnter = (menu: string) => setActiveMenu(menu);
  const handleMouseLeave = () => setActiveMenu(null);

  return (
    <nav className={clsx('hidden lg:flex items-center gap-1', className)}>
      {/* Products Dropdown */}
      <div
        className="relative"
        onMouseEnter={() => handleMouseEnter('products')}
        onMouseLeave={handleMouseLeave}
      >
        <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
          {productsNavigation.label}
          <ChevronDown className={clsx('h-4 w-4 transition-transform', activeMenu === 'products' && 'rotate-180')} />
        </Button>

        {activeMenu === 'products' && (
          <div className="absolute left-0 top-full pt-2 z-50">
            <div className="bg-background border-2 border-border rounded-card shadow-xl min-w-[720px] p-6">
              <div className="grid grid-cols-3 gap-6">
                {productsNavigation.products.map((product) => {
                  const IconComponent = productIcons[product.icon as keyof typeof productIcons] || Command;
                  return (
                    <Link
                      key={product.href}
                      href={product.href}
                      className="group p-4 rounded-card hover:bg-muted/50 transition-colors border-2 border-transparent hover:border-border"
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-card bg-primary/10 text-primary">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-weight-bold text-foreground">{product.label}</div>
                          <div className="text-body-xs text-muted-foreground">{product.tagline}</div>
                        </div>
                      </div>
                      <Body className="text-body-sm text-muted-foreground mb-3">{product.description}</Body>
                      <List className="space-y-1">
                        {product.features.map((feature) => (
                          <ListItem key={feature} className="text-body-xs text-muted-foreground flex items-center gap-2">
                            <Text className="w-1 h-1 rounded-avatar bg-primary" />
                            {feature}
                          </ListItem>
                        ))}
                      </List>
                      <div className="mt-3 text-body-sm font-weight-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        View All Features <ArrowRight className="h-3 w-3" />
                      </div>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker mb-2">Platform</div>
                <div className="flex gap-4">
                  {productsNavigation.quickLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-body-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Solutions Dropdown */}
      <div
        className="relative"
        onMouseEnter={() => handleMouseEnter('solutions')}
        onMouseLeave={handleMouseLeave}
      >
        <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
          {solutionsNavigation.label}
          <ChevronDown className={clsx('h-4 w-4 transition-transform', activeMenu === 'solutions' && 'rotate-180')} />
        </Button>

        {activeMenu === 'solutions' && (
          <div className="absolute left-0 top-full pt-2 z-50">
            <div className="bg-background border-2 border-border rounded-card shadow-xl min-w-[800px] p-6">
              <div className="text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker mb-4">Solutions by Role</div>
              <div className="grid grid-cols-3 gap-x-8 gap-y-4">
                {solutionsNavigation.groups.map((group) => (
                  <div key={group.title}>
                    <div className="font-weight-medium text-foreground mb-2">{group.title}</div>
                    <List className="space-y-1">
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
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker mb-2">By Vertical</div>
                <div className="flex gap-4">
                  {solutionsNavigation.verticals.map((vertical) => (
                    <Link
                      key={vertical.href}
                      href={vertical.href}
                      className="text-body-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {vertical.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resources Dropdown */}
      <div
        className="relative"
        onMouseEnter={() => handleMouseEnter('resources')}
        onMouseLeave={handleMouseLeave}
      >
        <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
          {resourcesNavigation.label}
          <ChevronDown className={clsx('h-4 w-4 transition-transform', activeMenu === 'resources' && 'rotate-180')} />
        </Button>

        {activeMenu === 'resources' && (
          <div className="absolute left-0 top-full pt-2 z-50">
            <div className="bg-background border-2 border-border rounded-card shadow-xl min-w-[600px] p-6">
              <div className="grid grid-cols-3 gap-8">
                {resourcesNavigation.groups.map((group) => (
                  <div key={group.title}>
                    <div className="font-weight-medium text-foreground mb-3">{group.title}</div>
                    <List className="space-y-2">
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
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border">
                <div className="text-body-xs font-weight-medium text-muted-foreground uppercase tracking-kicker mb-2">Featured</div>
                <div className="flex gap-4">
                  {resourcesNavigation.featured.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-body-sm font-weight-medium text-primary hover:text-primary/80 transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pricing (no dropdown) */}
      <Link
        href="/pricing"
        className="px-4 py-2 text-body-sm font-weight-medium text-foreground/80 hover:text-foreground transition-colors"
      >
        Pricing
      </Link>
    </nav>
  );
}

export default PublicMegaMenu;
