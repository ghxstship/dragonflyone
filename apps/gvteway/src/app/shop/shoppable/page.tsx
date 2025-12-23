"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { Camera, Music, Twitter, Smartphone, ImageIcon, Heart, ShoppingBag } from "lucide-react";
// Layout provided by route group
import {
  H2, H3, Body, Label, Grid, Stack, StatCard, Button,
  Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Input, Select,
  Kicker,
} from "@ghxstship/ui";

import {
  DEMO_SHOPPABLE_POSTS,
  type DemoShoppablePost as ShoppablePost,
  type DemoShoppableProduct as ShoppableProduct,
} from "@/lib/demo-data";

const mockPosts = DEMO_SHOPPABLE_POSTS;

function ShoppablePostsPageContent() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'all',
    validTabs: ['all', 'instagram', 'tiktok', 'twitter'],
  });
  const [selectedPost, setSelectedPost] = useState<ShoppablePost | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ShoppableProduct | null>(null);

  const totalProducts = mockPosts.reduce((sum, p) => sum + p.products.length, 0);
  const totalEngagement = mockPosts.reduce((sum, p) => sum + p.likes, 0);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Instagram": return <Camera className="size-4 inline" />;
      case "TikTok": return <Music className="size-4 inline" />;
      case "Twitter": return <Twitter className="size-4 inline" />;
      default: return <Smartphone className="size-4 inline" />;
    }
  };

  const filteredPosts = activeTab === "all" ? mockPosts : mockPosts.filter(p => p.platform.toLowerCase() === activeTab);

  return (
    <>
          <Stack gap={10}>
            {/* Page Header */}
            <Stack gap={2}>
              <Kicker colorScheme="on-dark">Shop</Kicker>
              <H2 size="lg" className="text-white">Shop the Look</H2>
              <Body className="text-on-dark-muted">Shop products featured in fan posts and social content</Body>
            </Stack>

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Shoppable Posts" value={mockPosts.length} className="border-2 border-black" />
            <StatCard label="Products Tagged" value={totalProducts} className="border-2 border-black" />
            <StatCard label="Total Engagement" value={totalEngagement.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Conversion Rate" value="4.2%" trend="up" className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
              <Tab active={isActive('instagram')} onClick={() => setActiveTab('instagram')}>Instagram</Tab>
              <Tab active={isActive('tiktok')} onClick={() => setActiveTab('tiktok')}>TikTok</Tab>
              <Tab active={isActive('twitter')} onClick={() => setActiveTab('twitter')}>Twitter</Tab>
            </TabsList>

            <TabPanel active={true}>
              <Grid cols={2} gap={6} className="sm:grid-cols-1 lg:grid-cols-2">
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="border-2 border-black overflow-hidden">
                    <Card className="h-64 bg-ink-100 relative flex items-center justify-center cursor-pointer" onClick={() => setSelectedPost(post)}>
                      <ImageIcon className="size-12" />
                      <Card className="absolute top-2 right-2 px-2 py-1 bg-black text-white">
                        <Label size="xs">{getPlatformIcon(post.platform)} {post.platform}</Label>
                      </Card>
                      <Card className="absolute bottom-2 left-2 px-2 py-1 bg-white border-2 border-black">
                        <Label size="xs"><ShoppingBag className="size-3 inline mr-1" /> {post.products.length} products</Label>
                      </Card>
                    </Card>
                    <Stack className="p-4" gap={3}>
                      <Stack direction="horizontal" className="justify-between">
                        <Label className="font-weight-bold">{post.creator}</Label>
                        <Label className="text-ink-500"><Heart className="size-3 inline mr-1" /> {post.likes.toLocaleString()}</Label>
                      </Stack>
                      <Body className="text-ink-600 line-clamp-2">{post.caption}</Body>
                      {post.eventName && <Badge variant="outline">{post.eventName}</Badge>}
                      <Stack gap={2}>
                        <Label size="xs" className="text-ink-500">Shop Products:</Label>
                        <Grid cols={3} gap={2} className="sm:grid-cols-2 lg:grid-cols-3">
                          {post.products.map((product) => (
                            <Card key={product.id} className="p-2 border-2 border-ink-200 cursor-pointer hover:border-black" onClick={() => setSelectedProduct(product)}>
                              <Stack gap={1} className="text-center">
                                <Card className="h-12 bg-ink-100 flex items-center justify-center">
                                  <ShoppingBag className="size-5" />
                                </Card>
                                <Label size="xs" className="truncate">{product.name}</Label>
                                <Label size="xs" className="font-weight-bold">${product.price}</Label>
                              </Stack>
                            </Card>
                          ))}
                        </Grid>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
            <Button variant="outlineInk" onClick={() => router.push("/merch")}>Browse All Merch</Button>
            <Button variant="outlineInk" onClick={() => router.push("/community/fan-content")}>Fan Content</Button>
          </Grid>
          </Stack>

      <Modal open={!!selectedPost} onClose={() => setSelectedPost(null)}>
        <ModalHeader><H3>Shoppable Post</H3></ModalHeader>
        <ModalBody>
          {selectedPost && (
            <Stack gap={4}>
              <Card className="h-64 bg-ink-100 flex items-center justify-center">
                <ImageIcon className="size-12" />
              </Card>
              <Stack direction="horizontal" className="justify-between">
                <Stack gap={1}>
                  <Label className="font-weight-bold">{selectedPost.creator}</Label>
                  <Badge variant="outline">{selectedPost.platform}</Badge>
                </Stack>
                <Label><Heart className="size-4 inline mr-1" /> {selectedPost.likes.toLocaleString()}</Label>
              </Stack>
              <Body>{selectedPost.caption}</Body>
              <Stack gap={2}>
                <Label className="font-weight-bold">Products in this post:</Label>
                {selectedPost.products.map((product) => (
                  <Card key={product.id} className="p-3 border-2 border-ink-200">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack direction="horizontal" gap={3}>
                        <Card className="w-12 h-12 bg-ink-100 flex items-center justify-center">
                          <ShoppingBag className="size-5" />
                        </Card>
                        <Stack gap={1}>
                          <Label>{product.name}</Label>
                          <Label className="font-weight-bold">${product.price}</Label>
                        </Stack>
                      </Stack>
                      <Button variant={product.inStock ? "solid" : "outline"} size="sm" disabled={!product.inStock}>
                        {product.inStock ? "Add to Cart" : "Sold Out"}
                      </Button>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPost(null)}>Close</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedProduct} onClose={() => setSelectedProduct(null)}>
        <ModalHeader><H3>Product Details</H3></ModalHeader>
        <ModalBody>
          {selectedProduct && (
            <Stack gap={4}>
              <Card className="h-48 bg-ink-100 flex items-center justify-center">
                <ShoppingBag className="size-12" />
              </Card>
              <Body className="font-weight-bold text-h6-md">{selectedProduct.name}</Body>
              <Label className="font-mono text-h5-md">${selectedProduct.price}</Label>
              <Label className={selectedProduct.inStock ? "text-success-600" : "text-error-600"}>
                {selectedProduct.inStock ? "In Stock" : "Out of Stock"}
              </Label>
              <Select className="border-2 border-black">
                <option value="">Select Size...</option>
                <option value="s">Small</option>
                <option value="m">Medium</option>
                <option value="l">Large</option>
                <option value="xl">X-Large</option>
              </Select>
              <Input type="number" defaultValue={1} min={1} className="border-2 border-black" />
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedProduct(null)}>Cancel</Button>
          <Button variant="solid" disabled={!selectedProduct?.inStock} onClick={() => setSelectedProduct(null)}>
            Add to Cart - ${selectedProduct?.price}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}

export default function ShoppablePostsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-ink-950"><div className="text-white">Loading...</div></div>}>
      <ShoppablePostsPageContent />
    </Suspense>
  );
}
