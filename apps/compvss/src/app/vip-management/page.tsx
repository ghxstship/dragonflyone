"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Badge,
  Textarea,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  DEMO_VIP_GUESTS,
  DEMO_ACCESS_ZONES,
  type DemoVIPGuest as VIPGuest,
} from "../../lib/demo-data";

const mockVIPGuests = DEMO_VIP_GUESTS;
const mockAccessZones = DEMO_ACCESS_ZONES;

export default function VIPManagementPage() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'guests',
    validTabs: ['guests', 'zones'],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState<VIPGuest | null>(null);

  const filteredGuests = mockVIPGuests.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'error' | 'ghost' => {
    switch (status) {
      case "Checked In": return "success";
      case "Approved": return "info";
      case "Pending": return "warning";
      case "Denied": return "error";
      default: return "text-ink-600";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="VIP & Backstage Management"
        subtitle="Guest list management and access control"


        primaryAction={{ label: 'Add Guest', onClick: () => setShowAddModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard label="Checked In" value={mockVIPGuests.filter(g => g.status === "Checked In").length.toString()} />
              <StatCard label="Pending" value={mockVIPGuests.filter(g => g.status === "Pending").length.toString()} />
              <StatCard label="Total Guests" value={mockVIPGuests.length.toString()} />
              <StatCard label="Zone Occupancy" value={`${mockAccessZones.reduce((s,z) => s + z.currentOccupancy, 0)}/${mockAccessZones.reduce((s,z) => s + z.maxCapacity, 0)}`} />
            </Grid>

            <Input type="search" placeholder="Search guests..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

            <Tabs>
              <TabsList>
                <Tab active={isActive('guests')} onClick={() => setActiveTab('guests')}>Guest List</Tab>
                <Tab active={isActive('zones')} onClick={() => setActiveTab('zones')}>Access Zones</Tab>
              </TabsList>

              <TabPanel active={isActive('guests')}>
                <Table variant="dark">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Guest</TableHead>
                      <TableHead>Pass Type</TableHead>
                      <TableHead>Access</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGuests.map((guest) => (
                      <TableRow key={guest.id}>
                        <TableCell>
                          <Stack gap={1}>
                            <Body className="font-display">{guest.name}</Body>
                            <Body size="sm" className="">{guest.email}</Body>
                          </Stack>
                        </TableCell>
                        <TableCell><Badge variant="outline">{guest.passType}</Badge></TableCell>
                        <TableCell>
                          <Stack direction="horizontal" gap={1}>
                            {guest.accessAreas.slice(0,2).map(a => <Badge key={a} variant="outline">{a}</Badge>)}
                          </Stack>
                        </TableCell>
                        <TableCell><Badge variant={getStatusVariant(guest.status)}>{guest.status}</Badge></TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedGuest(guest)}>Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabPanel>

              <TabPanel active={isActive('zones')}>
                <Grid cols={2} gap={6}>
                  {mockAccessZones.map((zone) => (
                    <Card key={zone.id}>
                      <Stack gap={4}>
                        <H3>{zone.name}</H3>
                        <Stack gap={2}>
                          <Body>{zone.currentOccupancy} / {zone.maxCapacity}</Body>
                          <Card>
                            <Body size="sm" className="">{Math.round((zone.currentOccupancy / zone.maxCapacity) * 100)}% capacity</Body>
                          </Card>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </TabPanel>
            </Tabs>

            <Grid cols={3} gap={4}>
              <Button variant="solid" onClick={() => setShowAddModal(true)}>Add Guest</Button>
              <Button variant="outline">Print Credentials</Button>
              <Button variant="outline" onClick={() => router.push("/stage-management")}>Stage Management</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={showAddModal} onClose={() => setShowAddModal(false)}>
        <ModalHeader><H3>Add VIP Guest</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Input placeholder="Full Name" />
            <Input type="email" placeholder="Email" />
            <Select>
              <option value="">Select pass type...</option>
              <option value="VIP">VIP</option>
              <option value="Backstage">Backstage</option>
              <option value="All Access">All Access</option>
            </Select>
            <Textarea placeholder="Notes..." rows={2} />
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddModal(false)}>Add Guest</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedGuest} onClose={() => setSelectedGuest(null)}>
        <ModalHeader><H3>Guest Details</H3></ModalHeader>
        <ModalBody>
          {selectedGuest && (
            <Stack gap={4}>
              <Body className="font-display">{selectedGuest.name}</Body>
              <Body size="sm" className="">{selectedGuest.email}</Body>
              <Badge variant="outline">{selectedGuest.passType}</Badge>
              <Badge variant={getStatusVariant(selectedGuest.status)}>{selectedGuest.status}</Badge>
              {selectedGuest.notes && <Body>{selectedGuest.notes}</Body>}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedGuest(null)}>Close</Button>
          <Button variant="solid">Edit</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
