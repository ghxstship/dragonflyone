"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye } from "lucide-react";
import {
  ListPage,
  Badge,
  type ListPageColumn,
  type ListPageFilter,
  type ListPageAction,
} from "@ghxstship/ui";
import { useCrew } from "../../../hooks/useCrew";
import { useEquipment } from "../../../hooks/useEquipment";
import { useQuery } from "@tanstack/react-query";

type SearchCategory = "all" | "crew" | "equipment" | "projects" | "beos";

interface SearchResult {
  id: string;
  type: SearchCategory;
  title: string;
  subtitle: string;
  href: string;
}

const getCategoryVariant = (type: SearchCategory): "solid" | "outline" | "ghost" => {
  switch (type) {
    case "crew":
    case "equipment":
      return "solid";
    case "projects":
      return "outline";
    default:
      return "ghost";
  }
};

export default function SearchPage() {
  const router = useRouter();

  const { data: crew = [], isLoading: crewLoading } = useCrew();
  const { data: equipment = [], isLoading: equipmentLoading } = useEquipment();

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ["projects-search"],
    queryFn: async () => {
      const response = await fetch("/api/projects");
      if (!response.ok) return [];
      const data = await response.json();
      return data.projects || [];
    },
  });

  const { data: beos = [], isLoading: beosLoading } = useQuery({
    queryKey: ["beos-search"],
    queryFn: async () => {
      const response = await fetch("/api/beos");
      if (!response.ok) return [];
      const data = await response.json();
      return data.beos || [];
    },
  });

  const isLoading = crewLoading || equipmentLoading || projectsLoading || beosLoading;

  const allResults = useMemo(() => {
    const results: SearchResult[] = [];

    crew.forEach((member: { id: string; name?: string; first_name?: string; last_name?: string; role?: string }) => {
      const name = member.name || `${member.first_name || ""} ${member.last_name || ""}`.trim();
      results.push({
        id: `crew-${member.id}`,
        type: "crew",
        title: name || "Unknown",
        subtitle: member.role || "Crew Member",
        href: `/crew/${member.id}`,
      });
    });

    equipment.forEach((item: { id: string; name: string; category?: string }) => {
      results.push({
        id: `equipment-${item.id}`,
        type: "equipment",
        title: item.name,
        subtitle: item.category || "Equipment",
        href: `/equipment?id=${item.id}`,
      });
    });

    projects.forEach((project: { id: string; name: string; client?: string }) => {
      results.push({
        id: `project-${project.id}`,
        type: "projects",
        title: project.name,
        subtitle: project.client || "Project",
        href: `/projects?id=${project.id}`,
      });
    });

    beos.forEach((beo: { id: string; name: string; event_name?: string }) => {
      results.push({
        id: `beo-${beo.id}`,
        type: "beos",
        title: beo.name,
        subtitle: beo.event_name || "BEO",
        href: `/beos/${beo.id}`,
      });
    });

    return results;
  }, [crew, equipment, projects, beos]);

  const columns: ListPageColumn<SearchResult>[] = [
    {
      key: "type",
      label: "Type",
      accessor: "type",
      render: (value, row) => (
        <Badge variant={getCategoryVariant(row.type)}>
          {row.type}
        </Badge>
      ),
    },
    {
      key: "title",
      label: "Name",
      accessor: "title",
      sortable: true,
    },
    {
      key: "subtitle",
      label: "Details",
      accessor: "subtitle",
    },
  ];

  const filters: ListPageFilter[] = [
    {
      key: "type",
      label: "Category",
      options: [
        { value: "all", label: "All Categories" },
        { value: "crew", label: "Crew" },
        { value: "equipment", label: "Equipment" },
        { value: "projects", label: "Projects" },
        { value: "beos", label: "BEOs" },
      ],
    },
  ];

  const rowActions: ListPageAction<SearchResult>[] = [
    {
      id: "view",
      label: "View",
      icon: <Eye className="h-4 w-4" />,
      onClick: (result) => router.push(result.href),
    },
  ];

  return (
    <ListPage<SearchResult>
      title="Search"
      subtitle="Search across all resources"
      data={allResults}
      columns={columns}
      rowKey="id"
      filters={filters}
      rowActions={rowActions}
      loading={isLoading}
      searchPlaceholder="Search crew, equipment, projects, BEOs..."
      emptyMessage="No matching results found. Try a different search term."
      onRowClick={(result) => router.push(result.href)}
    />
  );
}
