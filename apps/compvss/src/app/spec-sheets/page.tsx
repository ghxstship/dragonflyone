"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CompvssAppLayout } from "../../components/app-layout";
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
  Table,
  TableBody,
  TableRow,
  TableCell,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";
import {
  useSpecSheets,
  type SpecSheet,
} from '../../hooks/useSpecSheets';


const categories = ["All", "Audio", "Lighting", "Video", "Staging", "Rigging", "Power"];

export default function SpecSheetsPage() {
  const router = useRouter();
  const { data: specSheets = [] } = useSpecSheets();
  const [selectedSpec, setSelectedSpec] = useState<SpecSheet | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filteredSpecs = specSheets.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.manufacturer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || s.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Technical Specifications"
        subtitle="Equipment specification sheets and cut sheets library"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={specSheets.length.toString()} label="Total Specs" />
              <StatCard value={(categories.length - 1).toString()} label="Categories" />
              <StatCard value={new Set(specSheets.map(s => s.manufacturer)).size.toString()} label="Manufacturers" />
              <StatCard value={specSheets.reduce((sum, s) => sum + s.downloads, 0).toString()} label="Downloads" />
            </Grid>

            <Grid cols={3} gap={4}>
              <Input type="search" placeholder="Search specs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="col-span-2" />
              <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Select>
            </Grid>

            <Grid cols={3} gap={4}>
              {filteredSpecs.map((spec) => (
                <Card key={spec.id} className="cursor-pointer p-4" onClick={() => setSelectedSpec(spec)}>
                  <Stack gap={4}>
                    <Stack direction="horizontal" className="items-start justify-between">
                      <Stack gap={1}>
                        <Body className="font-display">{spec.name}</Body>
                        <Body size="sm" className="">{spec.manufacturer}</Body>
                      </Stack>
                      <Badge variant="outline">{spec.category}</Badge>
                    </Stack>
                    <Grid cols={3} gap={2}>
                      {spec.specs.slice(0, 3).map((s, idx) => (
                        <Stack key={idx} gap={0}>
                          <Body size="sm" className="">{s.label}</Body>
                          <Body>{s.value}</Body>
                        </Stack>
                      ))}
                    </Grid>
                    <Stack direction="horizontal" className="justify-between">
                      <Body size="sm" className="">v{spec.version} • {spec.fileSize}</Body>
                      <Body size="sm" className="">{spec.downloads} downloads</Body>
                    </Stack>
                  </Stack>
                </Card>
              ))}
            </Grid>

            <Grid cols={3} gap={4}>
              <Button variant="solid">Upload Spec Sheet</Button>
              <Button variant="outline" onClick={() => router.push("/equipment")}>Equipment</Button>
              <Button variant="outline" onClick={() => router.push("/knowledge")}>Knowledge Base</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedSpec} onClose={() => setSelectedSpec(null)}>
        <ModalHeader><H3>{selectedSpec?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedSpec && (
            <Stack gap={4}>
              <Stack direction="horizontal" className="justify-between">
                <Stack gap={1}>
                  <Body size="sm" className="">Manufacturer</Body>
                  <Body>{selectedSpec.manufacturer}</Body>
                </Stack>
                <Badge variant="outline">{selectedSpec.category}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body size="sm" className="">Model</Body>
                  <Body>{selectedSpec.model}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Version</Body>
                  <Body>{selectedSpec.version}</Body>
                </Stack>
              </Grid>
              <Stack gap={2}>
                <Body className="font-display">Specifications</Body>
                <Table variant="dark">
                  <TableBody>
                    {selectedSpec.specs.map((spec, idx) => (
                      <TableRow key={idx}>
                        <TableCell><Body size="sm" className="">{spec.label}</Body></TableCell>
                        <TableCell><Body>{spec.value}</Body></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body size="sm" className="">Last Updated</Body>
                  <Body>{selectedSpec.lastUpdated}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">File Size</Body>
                  <Body>{selectedSpec.fileSize}</Body>
                </Stack>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSpec(null)}>Close</Button>
          <Button variant="solid">Download PDF</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
