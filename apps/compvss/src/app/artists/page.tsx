"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  Container, H1, H3, Body, Label, Grid, Stack, StatCard, Input, Select,
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, Button,
  Section as UISection, Card, Tabs, TabsList, Tab, TabPanel, Badge,
  Modal, ModalHeader, ModalBody, ModalFooter, Textarea,
} from "@ghxstship/ui";

interface Artist {
  id: string;
  name: string;
  genre: string;
  type: "Solo" | "Band" | "DJ" | "Orchestra" | "Speaker";
  manager?: string;
  managerEmail?: string;
  managerPhone?: string;
  agent?: string;
  technicalRider: boolean;
  hospitalityRider: boolean;
  inputList: boolean;
  stageplot: boolean;
  lastPerformance?: string;
  upcomingShows: number;
  notes?: string;
}

interface TechnicalRequirement {
  category: string;
  items: string[];
}

const mockArtists: Artist[] = [
  { id: "ART-001", name: "The Midnight Collective", genre: "Indie Rock", type: "Band", manager: "Sarah Mitchell", managerEmail: "sarah@mgmt.com", managerPhone: "+1 555-0201", agent: "CAA", technicalRider: true, hospitalityRider: true, inputList: true, stageplot: true, lastPerformance: "2024-10-15", upcomingShows: 3 },
  { id: "ART-002", name: "DJ Phantom", genre: "Electronic", type: "DJ", manager: "Mike Torres", managerEmail: "mike@djmgmt.com", managerPhone: "+1 555-0202", technicalRider: true, hospitalityRider: false, inputList: true, stageplot: false, lastPerformance: "2024-11-10", upcomingShows: 5 },
  { id: "ART-003", name: "Aurora Keys", genre: "Pop", type: "Solo", manager: "Jennifer Lee", managerEmail: "jen@starpower.com", managerPhone: "+1 555-0203", agent: "WME", technicalRider: true, hospitalityRider: true, inputList: true, stageplot: true, upcomingShows: 2 },
  { id: "ART-004", name: "Tampa Symphony", genre: "Classical", type: "Orchestra", manager: "Robert Chen", managerEmail: "rchen@symphony.org", managerPhone: "+1 555-0204", technicalRider: true, hospitalityRider: true, inputList: true, stageplot: true, lastPerformance: "2024-09-20", upcomingShows: 1 },
  { id: "ART-005", name: "Dr. James Wilson", genre: "Keynote", type: "Speaker", manager: "Lisa Park", managerEmail: "lisa@speakers.com", managerPhone: "+1 555-0205", technicalRider: true, hospitalityRider: false, inputList: false, stageplot: false, upcomingShows: 0 },
];

const mockTechRequirements: TechnicalRequirement[] = [
  { category: "Audio", items: ["48-channel digital console (Yamaha CL5 or equivalent)", "12 monitor mixes", "8 wireless IEM systems", "6 wireless microphones (Shure ULXD)", "Full PA system with subs"] },
  { category: "Lighting", items: ["40 moving head fixtures", "LED wash fixtures for stage", "Follow spots (2)", "Hazer", "Lighting console (grandMA2 or MA3)"] },
  { category: "Video", items: ["LED wall upstage (16x9 minimum)", "IMAG screens (2)", "4K camera package", "Video switcher"] },
  { category: "Backline", items: ["Drum kit (DW or equivalent)", "Bass amp (Ampeg SVT)", "Guitar amps (2x Marshall JCM800)", "Keyboard (Nord Stage 3)"] },
];

export default function ArtistsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("directory");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredArtists = mockArtists.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.genre.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "All" || a.type === selectedType;
    return matchesSearch && matchesType;
  });

  const withRiders = mockArtists.filter(a => a.technicalRider).length;
  const upcomingTotal = mockArtists.reduce((sum, a) => sum + a.upcomingShows, 0);

  return (
    <UISection className="relative min-h-screen overflow-hidden bg-ink-950 text-ink-50">
      <Card className="pointer-events-none absolute inset-0 grid-overlay opacity-40" />
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <Stack gap={2}>
            <H1>Artist Database</H1>
            <Label className="text-ink-400">Performer profiles, technical requirements, and contact information</Label>
          </Stack>

          <Grid cols={4} gap={6}>
            <StatCard label="Total Artists" value={mockArtists.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="With Tech Riders" value={withRiders} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Upcoming Shows" value={upcomingTotal} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active This Month" value={mockArtists.filter(a => a.upcomingShows > 0).length} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Grid cols={3} gap={4}>
            <Input type="search" placeholder="Search artists..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-ink-700 bg-black text-white" />
            <Select value={selectedType} onChange={(e) => setSelectedType(e.target.value)} className="border-ink-700 bg-black text-white">
              <option value="All">All Types</option>
              <option value="Solo">Solo Artist</option>
              <option value="Band">Band</option>
              <option value="DJ">DJ</option>
              <option value="Orchestra">Orchestra</option>
              <option value="Speaker">Speaker</option>
            </Select>
            <Button variant="outlineWhite" onClick={() => setShowAddModal(true)}>Add Artist</Button>
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={activeTab === "directory"} onClick={() => setActiveTab("directory")}>Directory</Tab>
              <Tab active={activeTab === "requirements"} onClick={() => setActiveTab("requirements")}>Tech Requirements</Tab>
            </TabsList>

            <TabPanel active={activeTab === "directory"}>
              <Table className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead>Artist</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Upcoming</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArtists.map((artist) => (
                    <TableRow key={artist.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body className="font-display text-white">{artist.name}</Body>
                          <Label size="xs" className="text-ink-500">{artist.genre}</Label>
                        </Stack>
                      </TableCell>
                      <TableCell><Badge variant="outline">{artist.type}</Badge></TableCell>
                      <TableCell>
                        <Stack gap={1}>
                          <Label className="text-white">{artist.manager || "-"}</Label>
                          {artist.agent && <Label size="xs" className="text-ink-500">Agent: {artist.agent}</Label>}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={1}>
                          {artist.technicalRider && <Badge variant="solid">Tech</Badge>}
                          {artist.inputList && <Badge variant="outline">Input</Badge>}
                          {artist.stageplot && <Badge variant="outline">Plot</Badge>}
                        </Stack>
                      </TableCell>
                      <TableCell><Label className={artist.upcomingShows > 0 ? "text-green-400" : "text-ink-400"}>{artist.upcomingShows} shows</Label></TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedArtist(artist)}>View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={activeTab === "requirements"}>
              <Grid cols={2} gap={6}>
                {mockTechRequirements.map((req) => (
                  <Card key={req.category} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Stack gap={3}>
                      <H3>{req.category}</H3>
                      <Stack gap={2}>
                        {req.items.map((item, idx) => (
                          <Card key={idx} className="p-2 bg-ink-800 border border-ink-700">
                            <Label className="text-ink-300">{item}</Label>
                          </Card>
                        ))}
                      </Stack>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>
          </Tabs>

          <Grid cols={3} gap={4}>
            <Button variant="outline" className="border-ink-700 text-ink-400">Import Artists</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400">Export Database</Button>
            <Button variant="outline" className="border-ink-700 text-ink-400" onClick={() => router.push("/directory")}>Full Directory</Button>
          </Grid>
        </Stack>
      </Container>

      <Modal open={!!selectedArtist} onClose={() => setSelectedArtist(null)}>
        <ModalHeader><H3>Artist Profile</H3></ModalHeader>
        <ModalBody>
          {selectedArtist && (
            <Stack gap={4}>
              <Stack gap={1}>
                <Body className="font-display text-white text-xl">{selectedArtist.name}</Body>
                <Stack direction="horizontal" gap={2}>
                  <Badge variant="outline">{selectedArtist.type}</Badge>
                  <Badge variant="outline">{selectedArtist.genre}</Badge>
                </Stack>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Manager</Label><Label className="text-white">{selectedArtist.manager || "N/A"}</Label></Stack>
                <Stack gap={1}><Label size="xs" className="text-ink-500">Agent</Label><Label className="text-white">{selectedArtist.agent || "N/A"}</Label></Stack>
              </Grid>
              {selectedArtist.managerEmail && (
                <Stack gap={1}><Label size="xs" className="text-ink-500">Email</Label><Label className="text-white">{selectedArtist.managerEmail}</Label></Stack>
              )}
              {selectedArtist.managerPhone && (
                <Stack gap={1}><Label size="xs" className="text-ink-500">Phone</Label><Label className="font-mono text-white">{selectedArtist.managerPhone}</Label></Stack>
              )}
              <Stack gap={2}>
                <Label className="text-ink-400">Documents on File</Label>
                <Grid cols={2} gap={2}>
                  <Card className={`p-2 border ${selectedArtist.technicalRider ? "border-green-800 bg-green-900/10" : "border-ink-700"}`}>
                    <Label className={selectedArtist.technicalRider ? "text-green-400" : "text-ink-500"}>
                      {selectedArtist.technicalRider ? "✓" : "○"} Technical Rider
                    </Label>
                  </Card>
                  <Card className={`p-2 border ${selectedArtist.hospitalityRider ? "border-green-800 bg-green-900/10" : "border-ink-700"}`}>
                    <Label className={selectedArtist.hospitalityRider ? "text-green-400" : "text-ink-500"}>
                      {selectedArtist.hospitalityRider ? "✓" : "○"} Hospitality Rider
                    </Label>
                  </Card>
                  <Card className={`p-2 border ${selectedArtist.inputList ? "border-green-800 bg-green-900/10" : "border-ink-700"}`}>
                    <Label className={selectedArtist.inputList ? "text-green-400" : "text-ink-500"}>
                      {selectedArtist.inputList ? "✓" : "○"} Input List
                    </Label>
                  </Card>
                  <Card className={`p-2 border ${selectedArtist.stageplot ? "border-green-800 bg-green-900/10" : "border-ink-700"}`}>
                    <Label className={selectedArtist.stageplot ? "text-green-400" : "text-ink-500"}>
                      {selectedArtist.stageplot ? "✓" : "○"} Stage Plot
                    </Label>
                  </Card>
                </Grid>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedArtist(null)}>Close</Button>
          <Button variant="solid">Edit Artist</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add Artist</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Artist/Performer Name" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Select className="border-ink-700 bg-black text-white">
                <option value="">Type...</option>
                <option value="Solo">Solo Artist</option>
                <option value="Band">Band</option>
                <option value="DJ">DJ</option>
                <option value="Orchestra">Orchestra</option>
                <option value="Speaker">Speaker</option>
              </Select>
              <Input placeholder="Genre" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Input placeholder="Manager Name" className="border-ink-700 bg-black text-white" />
            <Grid cols={2} gap={4}>
              <Input type="email" placeholder="Manager Email" className="border-ink-700 bg-black text-white" />
              <Input placeholder="Manager Phone" className="border-ink-700 bg-black text-white" />
            </Grid>
            <Input placeholder="Booking Agent" className="border-ink-700 bg-black text-white" />
            <Textarea placeholder="Notes..." className="border-ink-700 bg-black text-white" rows={2} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Artist</Button>
        </ModalFooter>
      </Modal>
    </UISection>
  );
}
