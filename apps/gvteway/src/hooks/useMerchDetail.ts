'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface Artist {
  id: string;
  name: string;
  image_url?: string;
  bio?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  options: { size?: string; color?: string };
  price: number;
  inventory_count: number;
  sku: string;
}

export interface Product {
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

const DEMO_ARTIST: Artist = {
  id: 'demo-1',
  name: 'Demo Artist',
  bio: 'Popular touring artist',
};

const DEMO_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Tour T-Shirt',
    description: 'Official tour merchandise',
    price: 35,
    images: ['/merch/tshirt.jpg'],
    category: 'apparel',
    variants: [{ id: 'v1', name: 'Medium Black', options: { size: 'M', color: 'Black' }, price: 35, inventory_count: 50, sku: 'TSH-M-BLK' }],
    inventory_count: 100,
    is_limited_edition: false,
    is_preorder: false,
    tags: ['apparel', 'tour'],
  },
];

export const merchDetailKeys = {
  all: ['merch-detail'] as const,
  artist: (artistId: string) => [...merchDetailKeys.all, 'artist', artistId] as const,
  products: (artistId: string) => [...merchDetailKeys.all, 'products', artistId] as const,
};

export function useArtistDetail(artistId: string) {
  return useQuery({
    queryKey: merchDetailKeys.artist(artistId),
    queryFn: async () => {
      const response = await fetch(`/api/artists/${artistId}`);
      if (!response.ok) return DEMO_ARTIST;
      const data = await response.json();
      return data.artist || DEMO_ARTIST;
    },
    enabled: !!artistId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useMerchProducts(artistId: string) {
  return useQuery({
    queryKey: merchDetailKeys.products(artistId),
    queryFn: async () => {
      const response = await fetch(`/api/merch/catalog?artist_id=${artistId}`);
      if (!response.ok) return DEMO_PRODUCTS;
      const data = await response.json();
      return data.products || DEMO_PRODUCTS;
    },
    enabled: !!artistId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: { product_id: string; variant_id: string; quantity: number }) => {
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error('Failed to add to cart');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });
}

export function useMerchDetailData(artistId: string) {
  const artistQuery = useArtistDetail(artistId);
  const productsQuery = useMerchProducts(artistId);
  const addToCartMutation = useAddToCart();

  return {
    artist: artistQuery.data || null,
    products: productsQuery.data || [],
    isLoading: artistQuery.isLoading || productsQuery.isLoading,
    error: artistQuery.error || productsQuery.error,
    addToCart: addToCartMutation.mutateAsync,
    isAddingToCart: addToCartMutation.isPending,
  };
}
