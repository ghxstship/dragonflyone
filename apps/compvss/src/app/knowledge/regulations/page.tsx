"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../../components/app-layout";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Input,
  Select,
  Button,
  Card,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  DEMO_REGULATIONS,
  type DemoRegulation as Regulation,
} from "../../../lib/demo-data";

const mockRegulations = DEMO_REGULATIONS;

const categories = ["All", "OSHA", "Fire", "Electrical", "Labor", "ADA", "Environmental", "Noise"];

export default function RegulationsPage() {
  const router = useRouter();
  const [selectedRegulation, setSelectedRegulation] = useState<Regulation | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRegulations = mockRegulations.filter(r => {
    const matchesCategory = categoryFilter === "All" || r.category === categoryFilter;
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const updatedCount = mockRegulations.filter(r => r.status === "Updated").length;
  const reviewCount = mockRegulations.filter(r => r.status === "Review Required").length;

  const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'ghost' => {
    switch (status) {
      case "Current": return "success";
      case "Updated": return "info";
      case "Review Required": return "warning";
      default: return "ghost";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "OSHA": return "🦺";
      case "Fire": return "🔥";
      case "Electrical": return "⚡";
      case "Labor": return "👷";
      case "ADA": return "♿";
      case "Environmental": return "🌿";
      case "Noise": return "🔊";
      default: return "📋";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Industry Regulations"
        subtitle="Compliance documentation and regulatory references"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard label="Total Regulations" value={mockRegulations.length.toString()} />
              <StatCard label="Categories" value={(categories.length - 1).toString()} />
              <StatCard label="Recently Updated" value={updatedCount.toString()} />
              <StatCard label="Review Required" value={reviewCount.toString()} />
            </Grid>

            <Stack direction="horizontal" className="justify-between">
              <Stack direction="horizontal" gap={4}>
                <Input type="search" placeholder="Search regulations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Stack>
              <Button variant="solid">Request Update</Button>
            </Stack>

            <Grid cols={2} gap={4}>
              {filteredRegulations.map((reg) => (
                <Card key={reg.id}>
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="justify-between">
                      <Stack direction="horizontal" gap={3}>
                        <Body>{getCategoryIcon(reg.category)}</Body>
                        <Stack gap={1}>
                          <Body className="font-display">{reg.title}</Body>
                          <Stack direction="horizontal" gap={2}>
                            <Badge variant="outline">{reg.category}</Badge>
                            <Badge variant="outline">{reg.jurisdiction}</Badge>
                          </Stack>
                        </Stack>
                      </Stack>
                      <Badge variant={getStatusVariant(reg.status)}>{reg.status}</Badge>
                    </Stack>
                    <Body>{reg.summary}</Body>
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Body size="sm" className="">Updated: {reg.lastUpdated}</Body>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm" onClick={() => setSelectedRegulation(reg)}>View Details</Button>
                        <Button variant="ghost" size="sm">Download PDF</Button>
                      </Stack>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>

            <Card>
              <Stack gap={4}>
                <H3>Quick Reference by Category</H3>
                <Grid cols={4} gap={4}>
                  {categories.slice(1).map((cat) => (
                    <Card key={cat} onClick={() => setCategoryFilter(cat)}>
                      <Stack gap={2} className="text-center">
                        <Body>{getCategoryIcon(cat)}</Body>
                        <Body>{cat}</Body>
                        <Body size="sm" className="">{mockRegulations.filter(r => r.category === cat).length} docs</Body>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            </Card>

            <Grid cols={3} gap={4}>
              <Button variant="outline" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
              <Button variant="outline" onClick={() => router.push("/safety")}>Safety</Button>
              <Button variant="outline" onClick={() => router.push("/")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedRegulation} onClose={() => setSelectedRegulation(null)}>
        <ModalHeader><H3>{selectedRegulation?.title}</H3></ModalHeader>
        <ModalBody>
          {selectedRegulation && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Body>{getCategoryIcon(selectedRegulation.category)}</Body>
                <Badge variant="outline">{selectedRegulation.category}</Badge>
                <Badge variant="outline">{selectedRegulation.jurisdiction}</Badge>
                <Badge variant={getStatusVariant(selectedRegulation.status)}>{selectedRegulation.status}</Badge>
              </Stack>
              <Stack gap={1}><Body size="sm" className="">Last Updated</Body><Body>{selectedRegulation.lastUpdated}</Body></Stack>
              <Stack gap={1}><Body size="sm" className="">Summary</Body><Body>{selectedRegulation.summary}</Body></Stack>
              <Card>
                <Stack gap={2}>
                  <Body size="sm" className="">Key Requirements</Body>
                  <Stack gap={1}>
                    <Body>• Compliance documentation required</Body>
                    <Body>• Regular inspections and audits</Body>
                    <Body>• Training and certification records</Body>
                    <Body>• Incident reporting procedures</Body>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRegulation(null)}>Close</Button>
          <Button variant="outline">Download PDF</Button>
          <Button variant="solid">View Full Document</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
