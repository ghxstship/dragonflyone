"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Input, Select,
} from "@ghxstship/ui";

interface ShoppablePost {
  id: string;
  imageUrl: string;
  caption: string;
  creator: string;
  platform: "Instagram" | "TikTok" | "Twitter";
  products: ShoppableProduct[];
  likes: number;
  createdAt: string;
  eventName?: string;
}

interface ShoppableProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  inStock: boolean;
}

const mockPosts: ShoppablePost[] = [
  { id: "SP-001", imageUrl: "/post1.jpg", caption: "Festival vibes in this amazing merch! 🎵", creator: "@festivalfan", platform: "Instagram", products: [{ id: "P-001", name: "Summer Fest Tee", price: 35, image: "/tee.jpg", inStock: true }, { id: "P-002", name: "Festival Cap", price: 25, image: "/cap.jpg", inStock: true }], likes: 1245, createdAt: "2024-11-24", eventName: "Summer Fest 2024" },
  { id: "SP-002", imageUrl: "/post2.jpg", caption: "Best concert outfit ever! Shop my look 👇", creator: "@musiclover", platform: "TikTok", products: [{ id: "P-003", name: "Band Hoodie", price: 65, image: "/hoodie.jpg", inStock: true }], likes: 3421, createdAt: "2024-11-23" },
  { id: "SP-003", imageUrl: "/post3.jpg", caption: "VIP experience was incredible!", creator: "@vipfan", platform: "Instagram", products: [{ id: "P-004", name: "VIP Lanyard", price: 15, image: "/lanyard.jpg", inStock: false }, { id: "P-005", name: "Poster Set", price: 45, image: "/poster.jpg", inStock: true }], likes: 892, createdAt: "2024-11-22", eventName: "Fall Concert" },
  { id: "SP-004", imageUrl: "/post4.jpg", caption: "Rocking this limited edition piece!", creator: "@collector", platform: "Twitter", products: [{ id: "P-006", name: "Limited Vinyl", price: 55, image: "/vinyl.jpg", inStock: true }], likes: 567, createdAt: "2024-11-21" },
];

export default function ShoppablePostsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [selectedPost, setSelectedPost] = useState<ShoppablePost | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ShoppableProduct | null>(null);

  const totalProducts = mockPosts.reduce((sum, p) => sum + p.products.length, 0);
  const totalEngagement = mockPosts.reduce((sum, p) => sum + p.likes, 0);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Instagram": return "📸";
      case "TikTok": return "🎵";
      case "Twitter": return "🐦";
      default: return "📱";
    }
  };

  const filteredPosts = activeTab === "all" ? mockPosts : mockPosts.filter(p => p.platform.toLowerCase() === activeTab);

  return (
    <UISection className="min-h-screen bg-white">
      <Container className="py-8">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>SHOP THE LOOK</H1>
            <Body className="text-gray-600">Shop products featured in fan posts and social content</Body>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Shoppable Posts" value={mockPosts.length} className="border-2 border-black" />
            <StatCard label="Products Tagged" value={totalProducts} className="border-2 border-black" />
            <StatCard label="Total Engagement" value={totalEngagement.toLocaleString()} className="border-2 border-black" />
            <StatCard label="Conversion Rate" value="4.2%" trend="up" className="border-2 border-black" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>All</Tab>
              <Tab active={activeTab === "instagram"} onClick={() => setActiveTab("instagram")}>Instagram</Tab>
              <Tab active={activeTab === "tiktok"} onClick={() => setActiveTab("tiktok")}>TikTok</Tab>
              <Tab active={activeTab === "twitter"} onClick={() => setActiveTab("twitter")}>Twitter</Tab>
            </TabsList>

            <TabPanel active={true}>
              <Grid cols={2} gap={6}>
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="border-2 border-black overflow-hidden">
                    <Card className="h-64 bg-gray-100 relative flex items-center justify-center cursor-pointer" onClick={() => setSelectedPost(post)}>
                      <Label className="text-6xl">🖼️</Label>
                      <Card className="absolute top-2 right-2 px-2 py-1 bg-black text-white">
                        <Label size="xs">{getPlatformIcon(post.platform)} {post.platform}</Label>
                      </Card>
                      <Card className="absolute bottom-2 left-2 px-2 py-1 bg-white border border-black">
                        <Label size="xs">🛍️ {post.products.length} products</Label>
                      </Card>
                    </Card>
                    <Stack className="p-4" gap={3}>
                      <Stack direction="horizontal" className="justify-between">
                        <Label className="font-bold">{post.creator}</Label>
                        <Label className="text-gray-500">❤️ {post.likes.toLocaleString()}</Label>
                      </Stack>
                      <Body className="text-gray-600 line-clamp-2">{post.caption}</Body>
                      {post.eventName && <Badge variant="outline">{post.eventName}</Badge>}
                      <Stack gap={2}>
                        <Label size="xs" className="text-gray-500">Shop Products:</Label>
                        <Grid cols={3} gap={2}>
                          {post.products.map((product) => (
                            <Card key={product.id} className="p-2 border border-gray-200 cursor-pointer hover:border-black" onClick={() => setSelectedProduct(product)}>
                              <Stack gap={1} className="text-center">
                                <Card className="h-12 bg-gray-100 flex items-center justify-center">
                                  <Label>🛍️</Label>
                                </Card>
                                <Label size="xs" className="truncate">{product.name}</Label>
                                <Label size="xs" className="font-bold">${product.price}</Label>
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

          <Grid cols={2} gap={4}>
            <Button variant="outline" onClick={() => router.push("/merch")}>Browse All Merch</Button>
            <Button variant="outline" onClick={() => router.push("/community/fan-content")}>Fan Content</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedPost} onClose={() => setSelectedPost(null)}>
        <ModalHeader><H3>Shoppable Post</H3></ModalHeader>
        <ModalBody>
          {selectedPost && (
            <Stack gap={4}>
              <Card className="h-64 bg-gray-100 flex items-center justify-center">
                <Label className="text-6xl">🖼️</Label>
              </Card>
              <Stack direction="horizontal" className="justify-between">
                <Stack gap={1}>
                  <Label className="font-bold">{selectedPost.creator}</Label>
                  <Badge variant="outline">{selectedPost.platform}</Badge>
                </Stack>
                <Label>❤️ {selectedPost.likes.toLocaleString()}</Label>
              </Stack>
              <Body>{selectedPost.caption}</Body>
              <Stack gap={2}>
                <Label className="font-bold">Products in this post:</Label>
                {selectedPost.products.map((product) => (
                  <Card key={product.id} className="p-3 border border-gray-200">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack direction="horizontal" gap={3}>
                        <Card className="w-12 h-12 bg-gray-100 flex items-center justify-center">
                          <Label>🛍️</Label>
                        </Card>
                        <Stack gap={1}>
                          <Label>{product.name}</Label>
                          <Label className="font-bold">${product.price}</Label>
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
              <Card className="h-48 bg-gray-100 flex items-center justify-center">
                <Label className="text-6xl">🛍️</Label>
              </Card>
              <Body className="font-bold text-xl">{selectedProduct.name}</Body>
              <Label className="font-mono text-2xl">${selectedProduct.price}</Label>
              <Label className={selectedProduct.inStock ? "text-green-600" : "text-red-600"}>
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
    </UISection>
  );
}
