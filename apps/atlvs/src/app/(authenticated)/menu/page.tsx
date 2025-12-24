"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Edit } from "lucide-react";
import {
  ListPage,
  Badge,
  DetailDrawer,
  Grid,
  Body,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
  type DetailSection,
} from "@ghxstship/ui";
import { createExportHandler } from "@ghxstship/config";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: "appetizer" | "main" | "dessert" | "beverage" | "special";
  price: number;
  cost: number;
  status: "available" | "sold_out" | "seasonal" | "discontinued";
  dietary: string[];
  prep_time: number;
}

const mockMenuItems: MenuItem[] = [
  { id: "1", name: "Truffle Risotto", description: "Creamy arborio rice with black truffle", category: "main", price: 32, cost: 12, status: "available", dietary: ["vegetarian", "gluten-free"], prep_time: 25 },
  { id: "2", name: "Wagyu Slider Trio", description: "Three mini wagyu burgers with house sauce", category: "appetizer", price: 28, cost: 14, status: "available", dietary: [], prep_time: 15 },
  { id: "3", name: "Lobster Bisque", description: "Rich creamy lobster soup with cognac", category: "appetizer", price: 18, cost: 6, status: "available", dietary: ["gluten-free"], prep_time: 10 },
  { id: "4", name: "Chocolate Lava Cake", description: "Warm chocolate cake with molten center", category: "dessert", price: 14, cost: 4, status: "available", dietary: ["vegetarian"], prep_time: 20 },
  { id: "5", name: "Seasonal Pumpkin Soup", description: "Roasted pumpkin with sage", category: "special", price: 15, cost: 5, status: "seasonal", dietary: ["vegan", "gluten-free"], prep_time: 8 },
  { id: "6", name: "Craft Cocktail Selection", description: "House-made specialty cocktails", category: "beverage", price: 16, cost: 5, status: "available", dietary: [], prep_time: 5 },
];

const formatCurrency = (amount: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

const getStatusVariant = (status: MenuItem["status"]): "solid" | "outline" | "ghost" => {
  switch (status) {
    case "available": return "solid";
    case "seasonal": return "outline";
    case "sold_out": return "ghost";
    default: return "ghost";
  }
};

const columns: ListPageColumn<MenuItem>[] = [
  { key: "name", label: "Item", accessor: "name", sortable: true },
  { key: "category", label: "Category", accessor: "category", sortable: true, render: (v) => <Badge variant="outline" className="capitalize">{String(v)}</Badge> },
  { key: "price", label: "Price", accessor: (r) => formatCurrency(r.price), sortable: true },
  { key: "cost", label: "Cost", accessor: (r) => formatCurrency(r.cost), sortable: true },
  { key: "margin", label: "Margin", accessor: (r) => `${Math.round(((r.price - r.cost) / r.price) * 100)}%`, sortable: true },
  { key: "prep_time", label: "Prep Time", accessor: (r) => `${r.prep_time} min` },
  { key: "status", label: "Status", accessor: "status", sortable: true, render: (v) => <Badge variant={getStatusVariant(v as MenuItem["status"])} className="capitalize">{String(v).replace("_", " ")}</Badge> },
];

const filters: ListPageFilter[] = [
  { key: "category", label: "Category", options: [
    { value: "appetizer", label: "Appetizer" },
    { value: "main", label: "Main" },
    { value: "dessert", label: "Dessert" },
    { value: "beverage", label: "Beverage" },
    { value: "special", label: "Special" },
  ]},
  { key: "status", label: "Status", options: [
    { value: "available", label: "Available" },
    { value: "sold_out", label: "Sold Out" },
    { value: "seasonal", label: "Seasonal" },
  ]},
];

export default function MenuPage() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const totalItems = mockMenuItems.length;
  const availableItems = mockMenuItems.filter(i => i.status === "available").length;
  const avgMargin = Math.round(mockMenuItems.reduce((sum, i) => sum + ((i.price - i.cost) / i.price) * 100, 0) / mockMenuItems.length);

  const rowActions: ListPageAction<MenuItem>[] = [
    { id: "view", label: "View Details", icon: <Eye className="size-4" />, onClick: (r) => { setSelectedItem(r); setDrawerOpen(true); } },
    { id: "edit", label: "Edit Item", icon: <Edit className="size-4" />, onClick: (r) => router.push(`/menu/${r.id}/edit`) },
  ];

  const stats = [
    { label: "Total Items", value: totalItems },
    { label: "Available", value: availableItems },
    { label: "Avg Margin", value: `${avgMargin}%` },
  ];

  const detailSections: DetailSection[] = selectedItem ? [
    { id: "overview", title: "Item Details", content: (
      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
        <Body size="sm"><strong>Name:</strong> {selectedItem.name}</Body>
        <Body size="sm"><strong>Category:</strong> {selectedItem.category}</Body>
        <Body size="sm"><strong>Price:</strong> {formatCurrency(selectedItem.price)}</Body>
        <Body size="sm"><strong>Cost:</strong> {formatCurrency(selectedItem.cost)}</Body>
        <Body size="sm"><strong>Margin:</strong> {Math.round(((selectedItem.price - selectedItem.cost) / selectedItem.price) * 100)}%</Body>
        <Body size="sm"><strong>Prep Time:</strong> {selectedItem.prep_time} min</Body>
        <Body size="sm"><strong>Status:</strong> {selectedItem.status}</Body>
        <Body size="sm"><strong>Dietary:</strong> {selectedItem.dietary.join(", ") || "None"}</Body>
        <Body size="sm" className="col-span-2"><strong>Description:</strong> {selectedItem.description}</Body>
      </Grid>
    )},
  ] : [];

  return (
    <>
      <ListPage<MenuItem>
        title="Menu"
        subtitle="Manage menu items and pricing"
        data={mockMenuItems}
        columns={columns}
        rowKey="id"
        searchPlaceholder="Search menu items..."
        filters={filters}
        rowActions={rowActions}
        onRowClick={(r) => { setSelectedItem(r); setDrawerOpen(true); }}
        entityType="menu"
        onExport={createExportHandler({
          filename: "menu-items",
          getData: () => mockMenuItems.map(i => ({
            name: i.name,
            category: i.category,
            price: i.price,
            cost: i.cost,
            status: i.status,
            prep_time: i.prep_time,
          })),
        })}
        stats={stats}
        emptyMessage="No menu items found"
        showFavorite
        showSettings
      />
      <DetailDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        record={selectedItem}
        title={(r) => r.name}
        subtitle={(r) => r.category}
        sections={detailSections}
        actions={[
          { id: "edit", label: "Edit Item", icon: <Edit className="size-4" /> },
        ]}
        onAction={(id, r) => {
          if (id === "edit") router.push(`/menu/${r.id}/edit`);
          setDrawerOpen(false);
        }}
      />
    </>
  );
}
