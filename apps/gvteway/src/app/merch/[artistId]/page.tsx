'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Container,
  Section,
  Display,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  LoadingSpinner,
  StatCard,
} from '@ghxstship/ui';

interface Artist {
  id: string;
  name: string;
  image_url?: string;
  bio?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compare_at_price?: number;
  images: string[];
  category: string;
  variants: ProductVariant[];
  inventory_count: number;
  is_limited_edition: boolean;
  is_preorder: boolean;
  release_date?: string;
  tags: string[];
}

interface ProductVariant {
  id: string;
  name: string;
  options: { size?: string; color?: string };
  price: number;
  inventory_count: number;
  sku: string;
}

export default function ArtistMerchPage() {
  const params = useParams();
  const router = useRouter();
  const artistId = params.artistId as string;

  const [artist, setArtist] = useState<Artist | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [filter, setFilter] = useState({ category: '', sort: 'newest' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [artistRes, productsRes] = await Promise.all([
        fetch(`/api/artists/${artistId}`),
        fetch(`/api/merch/catalog?artist_id=${artistId}`),
      ]);

      if (artistRes.ok) {
        const data = await artistRes.json();
        setArtist(data.artist);
      }

      if (productsRes.ok) {
        const data = await productsRes.json();
        setProducts(data.products || []);
      }
    } catch (err) {
      setError('Failed to load merchandise');
    } finally {
      setLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddToCart = async () => {
    if (!selectedProduct) return;

    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: selectedProduct.id,
          variant_id: selectedVariant?.id,
          quantity,
        }),
      });

      if (response.ok) {
        setSuccess('Added to cart!');
        setSelectedProduct(null);
        setSelectedVariant(null);
        setQuantity(1);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add to cart');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const getCategoryBadge = (category: string) => {
    const variants: Record<string, string> = {
      apparel: 'bg-info-500 text-white',
      accessories: 'bg-purple-500 text-white',
      music: 'bg-success-500 text-white',
      collectibles: 'bg-warning-500 text-white',
      posters: 'bg-error-500 text-white',
    };
    return <Badge className={variants[category] || ''}>{category}</Badge>;
  };

  const filteredProducts = products
    .filter(p => !filter.category || p.category === filter.category)
    .sort((a, b) => {
      if (filter.sort === 'price_low') return a.price - b.price;
      if (filter.sort === 'price_high') return b.price - a.price;
      if (filter.sort === 'name') return a.name.localeCompare(b.name);
      return 0; // newest - default order from API
    });

  const categories = [...new Set(products.map(p => p.category))];

  if (loading) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </Section>
    );
  }

  if (!artist) {
    return (
      <Section className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-8 text-center">
          <H3>Artist not found</H3>
          <Button variant="solid" className="mt-4" onClick={() => router.push('/merch')}>
            Back to Store
          </Button>
        </Card>
      </Section>
    );
  }

  return (
    <Section className="min-h-screen bg-white">
      <Container>
        <Section className="border-b-2 border-black py-8 mb-8">
          <Stack direction="horizontal" gap={6} className="items-center">
            <Stack className="w-24 h-24 rounded-full bg-grey-200 overflow-hidden relative flex-shrink-0">
              {artist.image_url ? (
                <Image src={artist.image_url} alt={artist.name} fill className="object-cover" />
              ) : (
                <Stack className="w-full h-full flex items-center justify-center">
                  <Body className="text-3xl">🎤</Body>
                </Stack>
              )}
            </Stack>
            <Stack>
              <Display>{artist.name}</Display>
              <Body className="mt-2 text-grey-600">Official Merchandise</Body>
            </Stack>
          </Stack>
        </Section>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid cols={4} gap={6} className="mb-8">
          <StatCard
            label="Products"
            value={products.length}
            icon={<Body>🛍️</Body>}
          />
          <StatCard
            label="Limited Edition"
            value={products.filter(p => p.is_limited_edition).length}
            icon={<Body>⭐</Body>}
          />
          <StatCard
            label="Pre-Orders"
            value={products.filter(p => p.is_preorder).length}
            icon={<Body>📦</Body>}
          />
          <StatCard
            label="Categories"
            value={categories.length}
            icon={<Body>📂</Body>}
          />
        </Grid>

        <Stack direction="horizontal" gap={4} className="mb-6 flex-wrap">
          <Field label="" className="w-48">
            <Select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </Select>
          </Field>
          <Field label="" className="w-48">
            <Select
              value={filter.sort}
              onChange={(e) => setFilter({ ...filter, sort: e.target.value })}
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="name">Name A-Z</option>
            </Select>
          </Field>
        </Stack>

        <Grid cols={4} gap={6}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => (
              <Card
                key={product.id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => {
                  setSelectedProduct(product);
                  setSelectedVariant(product.variants[0] || null);
                }}
              >
                <Stack className="relative aspect-square bg-grey-100">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <Stack className="w-full h-full flex items-center justify-center">
                      <Body className="text-4xl">🛍️</Body>
                    </Stack>
                  )}
                  {product.is_limited_edition && (
                    <Stack className="absolute top-2 left-2">
                      <Badge className="bg-warning-500 text-white">Limited</Badge>
                    </Stack>
                  )}
                  {product.is_preorder && (
                    <Stack className="absolute top-2 right-2">
                      <Badge className="bg-info-500 text-white">Pre-Order</Badge>
                    </Stack>
                  )}
                  {product.inventory_count < 10 && product.inventory_count > 0 && (
                    <Stack className="absolute bottom-2 left-2">
                      <Badge className="bg-error-500 text-white">Low Stock</Badge>
                    </Stack>
                  )}
                </Stack>
                <Stack className="p-4" gap={2}>
                  {getCategoryBadge(product.category)}
                  <H3 className="line-clamp-2">{product.name}</H3>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Body className="font-bold text-lg">${product.price.toFixed(2)}</Body>
                    {product.compare_at_price && product.compare_at_price > product.price && (
                      <Body className="text-grey-400 line-through text-sm">
                        ${product.compare_at_price.toFixed(2)}
                      </Body>
                    )}
                  </Stack>
                </Stack>
              </Card>
            ))
          ) : (
            <Card className="col-span-4 p-12 text-center">
              <H3 className="mb-4">NO PRODUCTS FOUND</H3>
              <Body className="text-grey-600">
                Check back soon for new merchandise
              </Body>
            </Card>
          )}
        </Grid>

        <Modal
          open={!!selectedProduct}
          onClose={() => {
            setSelectedProduct(null);
            setSelectedVariant(null);
            setQuantity(1);
          }}
          title=""
        >
          {selectedProduct && (
            <Stack gap={6}>
              <Grid cols={2} gap={6}>
                <Stack className="relative aspect-square bg-grey-100 rounded overflow-hidden">
                  {selectedProduct.images[0] ? (
                    <Image
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <Stack className="w-full h-full flex items-center justify-center">
                      <Body className="text-6xl">🛍️</Body>
                    </Stack>
                  )}
                </Stack>
                <Stack gap={4}>
                  <Stack direction="horizontal" gap={2}>
                    {getCategoryBadge(selectedProduct.category)}
                    {selectedProduct.is_limited_edition && (
                      <Badge className="bg-warning-500 text-white">Limited Edition</Badge>
                    )}
                  </Stack>
                  <H2>{selectedProduct.name}</H2>
                  <Body className="text-grey-600">{selectedProduct.description}</Body>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Body className="font-bold text-2xl">
                      ${(selectedVariant?.price || selectedProduct.price).toFixed(2)}
                    </Body>
                    {selectedProduct.compare_at_price && (
                      <Body className="text-grey-400 line-through">
                        ${selectedProduct.compare_at_price.toFixed(2)}
                      </Body>
                    )}
                  </Stack>

                  {selectedProduct.variants.length > 1 && (
                    <Field label="Select Option">
                      <Select
                        value={selectedVariant?.id || ''}
                        onChange={(e) => {
                          const variant = selectedProduct.variants.find(v => v.id === e.target.value);
                          setSelectedVariant(variant || null);
                        }}
                      >
                        {selectedProduct.variants.map(variant => (
                          <option key={variant.id} value={variant.id}>
                            {variant.name} - ${variant.price.toFixed(2)}
                            {variant.inventory_count === 0 ? ' (Out of Stock)' : ''}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  )}

                  <Field label="Quantity">
                    <Stack direction="horizontal" gap={2}>
                      <Button
                        variant="outline"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-20 text-center"
                        min={1}
                      />
                      <Button
                        variant="outline"
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        +
                      </Button>
                    </Stack>
                  </Field>

                  {selectedProduct.is_preorder && selectedProduct.release_date && (
                    <Alert variant="info">
                      Pre-order: Ships {new Date(selectedProduct.release_date).toLocaleDateString()}
                    </Alert>
                  )}

                  <Button
                    variant="solid"
                    className="w-full"
                    onClick={handleAddToCart}
                    disabled={
                      (selectedVariant?.inventory_count === 0) ||
                      (selectedProduct.inventory_count === 0 && !selectedProduct.is_preorder)
                    }
                  >
                    {selectedProduct.is_preorder ? 'Pre-Order Now' : 'Add to Cart'}
                  </Button>
                </Stack>
              </Grid>
            </Stack>
          )}
        </Modal>
      </Container>
    </Section>
  );
}
