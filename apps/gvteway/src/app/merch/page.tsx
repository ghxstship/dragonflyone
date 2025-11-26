"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useNotifications } from "@ghxstship/ui";
import { useMerch } from "../../hooks/useMerch";
import {
  PageLayout,
  Navigation,
  Footer,
  FooterColumn,
  FooterLink,
  Display,
  H2,
  Body,
  Button,
  Badge,
  Select,
  SectionLayout,
  LoadingSpinner,
  EmptyState,
  Container,
  Grid,
  Stack,
  Card,
  Link,
} from "@ghxstship/ui";

export default function MerchPage() {
  const router = useRouter();
  const { addNotification } = useNotifications();
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("featured");

  const { data: merchItems, isLoading, error, refetch } = useMerch(
    filterCategory !== "all" ? { category: filterCategory } : undefined
  );

  const sortedMerch = [...(merchItems || [])].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    return 0;
  });

  if (isLoading) {
    return (
      <PageLayout
        background="black"
        header={
          <Navigation
            logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
            cta={<Button variant="outlineWhite" size="sm" onClick={() => router.push('/cart')}>CART (0)</Button>}
          >
            <Link href="/" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Home</Link>
            <Link href="/events" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Events</Link>
          </Navigation>
        }
        footer={
          <Footer
            logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES."
          >
            <FooterColumn title="Shop">
              <FooterLink href="/merch">Merchandise</FooterLink>
              <FooterLink href="/cart">Cart</FooterLink>
            </FooterColumn>
          </Footer>
        }
      >
        <Container className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" text="Loading merchandise..." />
        </Container>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        background="black"
        header={
          <Navigation
            logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
            cta={<Button variant="outlineWhite" size="sm" onClick={() => router.push('/cart')}>CART (0)</Button>}
          >
            <Link href="/" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Home</Link>
            <Link href="/events" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Events</Link>
          </Navigation>
        }
        footer={
          <Footer
            logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
            copyright="© 2024 GHXSTSHIP INDUSTRIES."
          >
            <FooterColumn title="Shop">
              <FooterLink href="/merch">Merchandise</FooterLink>
              <FooterLink href="/cart">Cart</FooterLink>
            </FooterColumn>
          </Footer>
        }
      >
        <Container className="py-16">
          <EmptyState
            title="Error Loading Merchandise"
            description={error instanceof Error ? error.message : "An error occurred"}
            action={{ label: "Retry", onClick: () => refetch() }}
          />
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      background="black"
      header={
        <Navigation
          logo={<Display size="md" className="text-display-md">GVTEWAY</Display>}
          cta={<Button variant="outlineWhite" size="sm" onClick={() => router.push('/cart')}>CART (0)</Button>}
        >
          <Link href="/" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Home</Link>
          <Link href="/events" className="font-heading text-sm uppercase tracking-wider hover:text-grey-400">Events</Link>
        </Navigation>
      }
      footer={
        <Footer
          logo={<Display size="md" className="text-white text-display-md">GVTEWAY</Display>}
          copyright="© 2024 GHXSTSHIP INDUSTRIES."
        >
          <FooterColumn title="Shop">
            <FooterLink href="/merch">Merchandise</FooterLink>
            <FooterLink href="/cart">Cart</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      <SectionLayout background="black">
        <Container>
          <Stack gap={8}>
            <H2 className="text-white">Official Merchandise</H2>
            <Body className="text-grey-400">
              Exclusive gear from your favorite events and festivals
            </Body>

            <Stack gap={4} direction="horizontal">
              <Select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-black text-white border-grey-700"
              >
                <option value="all">All Categories</option>
                <option value="apparel">Apparel</option>
                <option value="accessories">Accessories</option>
                <option value="art">Art</option>
              </Select>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black text-white border-grey-700"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </Select>
            </Stack>

            {sortedMerch.length === 0 ? (
              <EmptyState
                title="No Merchandise Found"
                description="Check back soon for new items"
              />
            ) : (
              <Grid cols={3} gap={6}>
                {sortedMerch.map((item) => (
                  <Card key={item.id} className="border-2 border-grey-800 p-6 transition hover:border-white bg-black">
                    <Stack gap={4}>
                      <Stack className="aspect-square bg-grey-900" />
                      <Stack gap={2} direction="horizontal" className="justify-between items-start">
                        <Body className="font-display text-lg text-white">{item.name}</Body>
                        <Badge variant="outline">{item.category}</Badge>
                      </Stack>
                      <Body className="font-mono text-2xl text-white">${item.price}</Body>
                      <Body className="text-sm text-grey-400">{item.stock} in stock</Body>
                      <Button variant="solid" className="w-full" onClick={() => { addNotification({ type: 'success', title: 'Added', message: `${item.name} added to cart` }); }}>Add to Cart</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            )}
          </Stack>
        </Container>
      </SectionLayout>
    </PageLayout>
  );
}
