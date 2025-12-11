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
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  DEMO_ACCESS_POINTS,
  DEMO_VEHICLE_PASSES,
  type DemoVehiclePass as VehiclePass,
} from "../../lib/demo-data";

const mockAccessPoints = DEMO_ACCESS_POINTS;
const mockVehiclePasses = DEMO_VEHICLE_PASSES;

export default function SiteAccessPage() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'access',
    validTabs: ['access', 'vehicles', 'schedule'],
  });
  const [showAddPassModal, setShowAddPassModal] = useState(false);
  const [selectedPass, setSelectedPass] = useState<VehiclePass | null>(null);

  const openPoints = mockAccessPoints.filter(p => p.status === "Open").length;
  const activeVehicles = mockAccessPoints.reduce((sum, p) => sum + (p.currentVehicles || 0), 0);
  const activePasses = mockVehiclePasses.filter(p => p.status === "Active").length;

  const getStatusVariant = (status: string): 'success' | 'info' | 'warning' | 'error' | 'ghost' => {
    switch (status) {
      case "Open": case "Active": return "success";
      case "Restricted": case "Pending": return "warning";
      case "Closed": case "Expired": return "error";
      default: return "ghost";
    }
  };

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Site Access Management"
        subtitle="Gates, parking, loading docks, and vehicle passes"
        primaryAction={{ label: 'Issue Vehicle Pass', onClick: () => setShowAddPassModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            <Grid cols={4} gap={6}>
              <StatCard value={`${openPoints}/${mockAccessPoints.length}`} label="Open Access Points" />
              <StatCard value={activeVehicles.toString()} label="Vehicles On Site" />
              <StatCard value={activePasses.toString()} label="Active Passes" />
              <StatCard value={mockVehiclePasses.filter(p => p.status === "Pending").length.toString()} label="Pending Approval" />
            </Grid>

            <Tabs>
              <TabsList>
                <Tab active={isActive('access')} onClick={() => setActiveTab('access')}>Access Points</Tab>
                <Tab active={isActive('vehicles')} onClick={() => setActiveTab('vehicles')}>Vehicle Passes</Tab>
                <Tab active={isActive('schedule')} onClick={() => setActiveTab('schedule')}>Delivery Schedule</Tab>
              </TabsList>

              <TabPanel active={isActive('access')}>
                <Grid cols={3} gap={6}>
                  {mockAccessPoints.map((point) => (
                    <Card key={point.id} className="p-6">
                      <Stack gap={4}>
                        <Stack direction="horizontal" className="items-start justify-between">
                          <Stack gap={1}>
                            <H3>{point.name}</H3>
                            <Badge variant="outline">{point.type}</Badge>
                          </Stack>
                          <Badge variant={getStatusVariant(point.status)}>{point.status}</Badge>
                        </Stack>
                        {point.currentVehicles !== undefined && (
                          <Stack gap={2}>
                            <Body className="text-body-sm">Capacity: {point.currentVehicles}/{point.maxCapacity}</Body>
                          </Stack>
                        )}
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="outline" size="sm">{point.status === "Open" ? "Close" : "Open"}</Button>
                          <Button variant="ghost" size="sm">Details</Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </TabPanel>

              <TabPanel active={isActive('vehicles')}>
                <Table variant="dark">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead>Access</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockVehiclePasses.map((pass) => (
                      <TableRow key={pass.id}>
                        <TableCell>
                          <Stack gap={1}>
                            <Badge variant="outline">{pass.vehicleType}</Badge>
                            <Body className="text-body-sm">{pass.licensePlate}</Body>
                          </Stack>
                        </TableCell>
                        <TableCell><Body>{pass.company}</Body></TableCell>
                        <TableCell><Body className="text-body-sm">{pass.driver}</Body></TableCell>
                        <TableCell>
                          <Stack direction="horizontal" gap={1}>
                            {pass.accessPoints.slice(0, 2).map(ap => <Badge key={ap} variant="outline">{ap}</Badge>)}
                          </Stack>
                        </TableCell>
                        <TableCell><Body className="text-body-sm">{new Date(pass.validUntil).toLocaleTimeString()}</Body></TableCell>
                        <TableCell><Badge variant={getStatusVariant(pass.status)}>{pass.status}</Badge></TableCell>
                        <TableCell>
                          <Stack direction="horizontal" gap={2}>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedPass(pass)}>View</Button>
                            {pass.status === "Pending" && <Button variant="outline" size="sm">Approve</Button>}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabPanel>

              <TabPanel active={isActive('schedule')}>
                <Card className="p-6">
                  <Stack gap={4}>
                    <H3>Today&apos;s Deliveries</H3>
                    <Stack gap={2}>
                      {mockVehiclePasses.map((pass) => (
                        <Card key={pass.id} className="p-4">
                          <Grid cols={4} gap={4}>
                            <Stack gap={1}>
                              <Body className="text-body-sm">Time</Body>
                              <Body>{new Date(pass.validFrom).toLocaleTimeString()}</Body>
                            </Stack>
                            <Stack gap={1}>
                              <Body className="text-body-sm">Company</Body>
                              <Body>{pass.company}</Body>
                            </Stack>
                            <Stack gap={1}>
                              <Body className="text-body-sm">Vehicle</Body>
                              <Body>{pass.vehicleType} - {pass.licensePlate}</Body>
                            </Stack>
                            <Stack gap={1}>
                              <Body className="text-body-sm">Destination</Body>
                              <Body>{pass.accessPoints[1] || pass.accessPoints[0]}</Body>
                            </Stack>
                          </Grid>
                        </Card>
                      ))}
                    </Stack>
                  </Stack>
                </Card>
              </TabPanel>
            </Tabs>

            <Grid cols={3} gap={4}>
              <Button variant="solid" onClick={() => setShowAddPassModal(true)}>Issue Vehicle Pass</Button>
              <Button variant="outline">Print Manifest</Button>
              <Button variant="outline" onClick={() => router.push("/build-strike")}>Build & Strike</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={showAddPassModal} onClose={() => setShowAddPassModal(false)}>
        <ModalHeader><H3>Issue Vehicle Pass</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select>
              <option value="">Vehicle type...</option>
              <option value="Truck">Truck</option>
              <option value="Van">Van</option>
              <option value="Car">Car</option>
              <option value="Bus">Bus</option>
            </Select>
            <Input placeholder="License Plate" />
            <Input placeholder="Company" />
            <Input placeholder="Driver Name" />
            <Grid cols={2} gap={4}>
              <Input type="datetime-local" />
              <Input type="datetime-local" />
            </Grid>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowAddPassModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowAddPassModal(false)}>Issue Pass</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedPass} onClose={() => setSelectedPass(null)}>
        <ModalHeader><H3>Vehicle Pass Details</H3></ModalHeader>
        <ModalBody>
          {selectedPass && (
            <Stack gap={4}>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="text-body-sm">Vehicle</Body>
                  <Body>{selectedPass.vehicleType}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="text-body-sm">License</Body>
                  <Body>{selectedPass.licensePlate}</Body>
                </Stack>
              </Grid>
              <Stack gap={1}>
                <Body className="text-body-sm">Company</Body>
                <Body>{selectedPass.company}</Body>
              </Stack>
              <Stack gap={1}>
                <Body className="text-body-sm">Driver</Body>
                <Body>{selectedPass.driver}</Body>
              </Stack>
              <Stack gap={2}>
                <Body className="text-body-sm">Access Points</Body>
                <Stack direction="horizontal" gap={2}>{selectedPass.accessPoints.map(ap => <Badge key={ap} variant="outline">{ap}</Badge>)}</Stack>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedPass(null)}>Close</Button>
          <Button variant="solid">Print Pass</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
