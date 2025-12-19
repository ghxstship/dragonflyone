'use client';

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
    <header className={clsx('sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border', className)}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-card flex items-center justify-center">
              <span className="text-primary-foreground font-weight-bold text-body-sm">A</span>
            </div>
            <span className="font-weight-bold text-h4-md tracking-label">ATLVS</span>
          </Link>

          {/* Desktop Navigation */}
          <PublicMegaMenu />

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-body-sm font-weight-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-body-sm font-weight-medium bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors border-2 border-primary shadow-sm"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Products */}
            <div>
              <div className="font-weight-medium text-foreground mb-2">Products</div>
              <div className="space-y-1 pl-4">
                {productsNavigation.products.map((product) => (
                  <Link
                    key={product.href}
                    href={product.href}
                    className="block py-1 text-body-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {product.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Solutions */}
            <div>
              <div className="font-weight-medium text-foreground mb-2">Solutions</div>
              <div className="space-y-1 pl-4">
                {solutionsNavigation.groups.slice(0, 3).map((group) => (
                  <div key={group.title}>
                    <div className="text-body-xs text-muted-foreground uppercase tracking-kicker mt-2 mb-1">{group.title}</div>
                    {group.items.slice(0, 2).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block py-1 text-body-sm text-muted-foreground hover:text-foreground"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
                <Link
                  href="/solutions"
                  className="block py-1 text-body-sm text-primary font-weight-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  View All Solutions
                </Link>
              </div>
            </div>

            {/* Resources */}
            <div>
              <div className="font-weight-medium text-foreground mb-2">Resources</div>
              <div className="space-y-1 pl-4">
                {resourcesNavigation.groups.map((group) => (
                  <Link
                    key={group.items[0].href}
                    href={group.items[0].href}
                    className="block py-1 text-body-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {group.title}
                  </Link>
                ))}
              </div>
            </div>

            {/* Pricing */}
            <Link
              href="/pricing"
              className="block font-weight-medium text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>

            {/* CTAs */}
            <div className="pt-4 border-t border-border space-y-2">
              <Link
                href="/login"
                className="block w-full text-center px-4 py-2 text-body-sm font-weight-medium border-2 border-border rounded-button hover:bg-muted transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="block w-full text-center px-4 py-2 text-body-sm font-weight-medium bg-primary text-primary-foreground rounded-button hover:bg-primary/90 transition-colors border-2 border-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default PublicHeader;
