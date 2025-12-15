"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalTabState } from "@ghxstship/config/hooks";
import { useAssetSpecifications, type AssetSpec } from "@ghxstship/config";
import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  Container,
  H3,
  Body,
  Label,
  Grid,
  Stack,
  StatCard,
  Input,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import { DEMO_ASSET_SPECS } from '../../../lib/demo-data';


export default function AssetSpecificationsPage() {
  const router = useRouter();
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useLocalTabState({
    storageKey: 'assets-specifications-tab',
    defaultTab: 'library',
  });
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedSpec, setSelectedSpec] = useState<AssetSpec | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Real API integration with demo fallback
  const { specifications: apiData, isLoading, createSpecAsync, refetch } = useAssetSpecifications();
  const specs: AssetSpec[] = apiData.length > 0 ? apiData : (DEMO_ASSET_SPECS as unknown as AssetSpec[]);

  const filteredSpecs = specs.filter(s => {
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.model.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalDocs = specs.reduce((sum, s) => sum + s.documents.length, 0);

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Asset Specifications Library"
        subtitle="Technical documentation, specifications, and manuals for all equipment"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={8}>

          <Grid cols={4} gap={6}>
            <StatCard label="Spec Sheets" value={specs.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Documents" value={totalDocs} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Categories" value={7} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Linked Assets" value={specs.reduce((sum, s) => sum + s.relatedAssets, 0)} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={3} gap={4}>
            <Input type="search" placeholder="Search specifications..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-ink-700 bg-black text-white" />
            <Select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="border-ink-700 bg-black text-white">
              <option value="All">All Categories</option>
              <option value="Audio">Audio</option>
              <option value="Lighting">Lighting</option>
              <option value="Video">Video</option>
              <option value="Staging">Staging</option>
              <option value="Rigging">Rigging</option>
              <option value="Power">Power</option>
              <option value="Communication">Communication</option>
            </Select>
            <Button variant="outlineWhite" onClick={() => setShowAddModal(true)}>Add Specification</Button>
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={isActive('library')} onClick={() => setActiveTab('library')}>Spec Library</Tab>
              <Tab active={isActive('documents')} onClick={() => setActiveTab('documents')}>All Documents</Tab>
            </TabsList>

            <TabPanel active={isActive('library')}>
              <Grid cols={2} gap={6}>
                {filteredSpecs.map((spec) => (
                  <Card key={spec.id} className="border-2 border-ink-800 bg-ink-900/50 overflow-hidden">
                    <Card className="p-4 bg-ink-800">
                      <Stack direction="horizontal" className="justify-between items-start">
                        <Stack gap={1}>
                          <Body className="font-display text-white text-body-md">{spec.name}</Body>
                          <Label className="text-ink-400">{spec.manufacturer} • {spec.model}</Label>
                        </Stack>
                        <Badge variant="outline">{spec.category}</Badge>
                      </Stack>
                    </Card>
                    <Stack className="p-4" gap={4}>
                      <Grid cols={2} gap={2}>
                        {spec.specifications.slice(0, 4).map((s, idx) => (
                          <Stack key={idx} gap={0}>
                            <Label size="xs" className="text-ink-500">{s.label}</Label>
                            <Label className="text-white">{s.value}{s.unit ? ` ${s.unit}` : ""}</Label>
                          </Stack>
                        ))}
                      </Grid>
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Label className="text-ink-400">{spec.documents.length} documents • {spec.relatedAssets} assets</Label>
                        <Button variant="outline" size="sm" onClick={() => setSelectedSpec(spec)}>View Details</Button>
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={isActive('documents')}>
              <Table variant="dark" className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Document</TableHead>
                    <TableHead>Equipment</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {specs.flatMap(spec => spec.documents.map(doc => ({ ...doc, specName: spec.name, category: spec.category }))).map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell><Body className="text-white">{doc.name}</Body></TableCell>
                      <TableCell><Label className="text-ink-300">{doc.specName}</Label></TableCell>
                      <TableCell><Badge variant="outline">{doc.type}</Badge></TableCell>
                      <TableCell><Label className="text-ink-400">{doc.size}</Label></TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm">View</Button>
                          <Button variant="outline" size="sm">Download</Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Import Specs</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Library</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/assets")}>Back to Assets</Button>
          </Grid>

      <Modal open={!!selectedSpec} onClose={() => setSelectedSpec(null)}>
        <ModalHeader><H3>{selectedSpec?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedSpec && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedSpec.category}</Badge>
                <Label className="text-ink-400">{selectedSpec.manufacturer} • {selectedSpec.model}</Label>
              </Stack>
              
              <Stack gap={2}>
                <Label className="text-ink-400">Specifications</Label>
                <Grid cols={2} gap={3}>
                  {selectedSpec.specifications.map((s, idx) => (
                    <Card key={idx} className="p-2 bg-ink-800 border-2 border-ink-700">
                      <Stack gap={0}>
                        <Label size="xs" className="text-ink-500">{s.label}</Label>
                        <Label className="text-white">{s.value}{s.unit ? ` ${s.unit}` : ""}</Label>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>

              <Stack gap={2}>
                <Label className="text-ink-400">Documents</Label>
                {selectedSpec.documents.map((doc) => (
                  <Card key={doc.id} className="p-3 bg-ink-800 border-2 border-ink-700">
                    <Stack direction="horizontal" className="justify-between items-center">
                      <Stack gap={1}>
                        <Label className="text-white">{doc.name}</Label>
                        <Stack direction="horizontal" gap={2}>
                          <Badge variant="outline">{doc.type}</Badge>
                          <Label size="xs" className="text-ink-500">{doc.size}</Label>
                        </Stack>
                      </Stack>
                      <Button variant="outline" size="sm">Download</Button>
                    </Stack>
                  </Card>
                ))}
              </Stack>

              <Stack gap={1}>
                <Label size="xs" className="text-ink-500">Last Updated</Label>
                <Label className="text-white">{selectedSpec.lastUpdated}</Label>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedSpec(null)}>Close</Button>
          <Button variant="solid">Edit Specification</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Specification</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Equipment Name" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Input placeholder="Manufacturer" className="border-ink-700 bg-black text-white" />
              <Input placeholder="Model" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Select className="border-ink-700 bg-black text-white">
              <option value="">Category...</option>
              <option value="Audio">Audio</option>
              <option value="Lighting">Lighting</option>
              <option value="Video">Video</option>
              <option value="Staging">Staging</option>
              <option value="Rigging">Rigging</option>
              <option value="Power">Power</option>
              <option value="Communication">Communication</option>
            </Select>
            <Textarea placeholder="Key specifications (one per line)..." className="border-ink-700 bg-black text-white" rows={4} />
            <Stack gap={2}>
              <Label>Upload Documents</Label>
              <Card className="p-4 border-2 border-dashed border-ink-700 text-center cursor-pointer">
                <Label className="text-ink-400">Drop files here or click to upload</Label>
              </Card>
            </Stack>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={async () => {
            try {
              await createSpecAsync({
                name: 'New Specification',
                category: 'Audio',
                manufacturer: 'Generic',
                model: 'Standard',
              });
              refetch();
              setShowAddModal(false);
            } catch (err) {
              console.error('Failed to create specification:', err);
            }
          }}>Add Specification</Button>
        </ModalFooter>
      </Modal>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
