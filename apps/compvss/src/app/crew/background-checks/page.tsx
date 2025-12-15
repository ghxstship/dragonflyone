"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTabState } from "@ghxstship/config/hooks";
import { CompvssAppLayout } from "../../../components/app-layout";
import {
  Container,
  H3,
  Body,
  Grid,
  Stack,
  StatCard,
  Select,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  EnterprisePageHeader,
  MainContent,
} from "@ghxstship/ui";

import {
  useBackgroundChecks,
  type BackgroundCheck,
} from "../../../hooks/useBackgroundChecks";

export default function BackgroundChecksPage() {
  const router = useRouter();
  const { data: backgroundChecks = [] } = useBackgroundChecks();
  
  // URL-synced tab state for deep-linking support
  const { activeTab, setActiveTab, isActive } = useTabState({
    defaultTab: 'all',
    validTabs: ['all', 'pending', 'expiring', 'expired'],
  });
  const [selectedCheck, setSelectedCheck] = useState<BackgroundCheck | null>(null);
  const [showInitiateModal, setShowInitiateModal] = useState(false);

  const expiringCount = backgroundChecks.filter(c => c.daysUntilExpiry !== undefined && c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 30).length;
  const expiredCount = backgroundChecks.filter(c => c.status === "Expired" || (c.daysUntilExpiry !== undefined && c.daysUntilExpiry < 0)).length;
  const pendingCount = backgroundChecks.filter(c => c.status === "Pending" || c.status === "In Progress").length;

  const filteredChecks = activeTab === "all" ? backgroundChecks :
    activeTab === "expiring" ? backgroundChecks.filter(c => c.daysUntilExpiry !== undefined && c.daysUntilExpiry > 0 && c.daysUntilExpiry <= 30) :
    activeTab === "expired" ? backgroundChecks.filter(c => c.status === "Expired" || (c.daysUntilExpiry !== undefined && c.daysUntilExpiry < 0)) :
    backgroundChecks.filter(c => c.status === "In Progress" || c.status === "Pending");

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Background Checks"
        subtitle="Background check status and renewal alerts"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

            {(expiringCount > 0 || expiredCount > 0) && (
              <Alert variant="warning">
                {expiringCount} check(s) expiring within 30 days, {expiredCount} expired check(s) require renewal
              </Alert>
            )}

            <Grid cols={4} gap={6}>
              <StatCard value={backgroundChecks.length.toString()} label="Total Checks" />
              <StatCard value={pendingCount.toString()} label="In Progress" />
              <StatCard value={expiringCount.toString()} label="Expiring Soon" />
              <StatCard value={expiredCount.toString()} label="Expired" />
            </Grid>

            <Stack direction="horizontal" className="justify-between">
              <Tabs>
                <TabsList>
                  <Tab active={isActive('all')} onClick={() => setActiveTab('all')}>All</Tab>
                  <Tab active={isActive('pending')} onClick={() => setActiveTab('pending')}>In Progress</Tab>
                  <Tab active={isActive('expiring')} onClick={() => setActiveTab('expiring')}>Expiring</Tab>
                  <Tab active={isActive('expired')} onClick={() => setActiveTab('expired')}>Expired</Tab>
                </TabsList>
              </Tabs>
              <Button variant="solid" onClick={() => setShowInitiateModal(true)}>Initiate Check</Button>
            </Stack>

            <Card className="overflow-hidden">
              <Table variant="dark">
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Check Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChecks.map((check) => (
                    <TableRow key={check.id}>
                      <TableCell>
                        <Stack gap={1}>
                          <Body>{check.crewMemberName}</Body>
                          <Body size="sm" className="">{check.crewMemberId}</Body>
                        </Stack>
                      </TableCell>
                      <TableCell><Badge variant="outline">{check.department}</Badge></TableCell>
                      <TableCell><Body size="sm" className="">{check.checkType}</Body></TableCell>
                      <TableCell><Badge variant={check.status === "Cleared" ? "solid" : "outline"}>{check.status}</Badge></TableCell>
                      <TableCell><Body size="sm" className="">{check.status === "Cleared" ? "Clear" : "-"}</Body></TableCell>
                      <TableCell>
                        {check.expirationDate ? (
                          <Stack gap={1}>
                            <Body size="sm" className="">{check.expirationDate}</Body>
                            <Body size="sm" className="">
                              {check.daysUntilExpiry && check.daysUntilExpiry < 0 ? `${Math.abs(check.daysUntilExpiry)} days ago` : `${check.daysUntilExpiry} days`}
                            </Body>
                          </Stack>
                        ) : (
                          <Body size="sm" className="">-</Body>
                        )}
                      </TableCell>
                      <TableCell>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedCheck(check)}>View</Button>
                          {(check.status === "Expired" || (check.daysUntilExpiry && check.daysUntilExpiry <= 30)) && (
                            <Button variant="solid" size="sm">Renew</Button>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Grid cols={3} gap={4}>
              <Button variant="outline" onClick={() => router.push("/crew")}>Crew</Button>
              <Button variant="outline" onClick={() => router.push("/certifications")}>Certifications</Button>
              <Button variant="outline" onClick={() => router.push("/dashboard")}>Dashboard</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedCheck} onClose={() => setSelectedCheck(null)}>
        <ModalHeader><H3>Background Check Details</H3></ModalHeader>
        <ModalBody>
          {selectedCheck && (
            <Stack gap={4}>
              <Body className="font-display">{selectedCheck.crewMemberName}</Body>
              <Stack direction="horizontal" gap={2}>
                <Badge variant="outline">{selectedCheck.department}</Badge>
                <Badge variant="outline">{selectedCheck.checkType}</Badge>
              </Stack>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="font-display">Status</Body>
                  <Badge variant={selectedCheck.status === "Cleared" ? "solid" : "outline"}>{selectedCheck.status}</Badge>
                </Stack>
                <Stack gap={1}>
                  <Body className="font-display">Result</Body>
                  <Body>{selectedCheck.status === "Cleared" ? "Clear" : "Pending"}</Body>
                </Stack>
              </Grid>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body className="font-display">Submitted</Body>
                  <Body>{selectedCheck.submittedDate}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body className="font-display">Completed</Body>
                  <Body>{selectedCheck.completedDate || "In Progress"}</Body>
                </Stack>
              </Grid>
              {selectedCheck.expirationDate && (
                <Stack gap={1}>
                  <Body className="font-display">Expiry Date</Body>
                  <Body>{selectedCheck.expirationDate}</Body>
                </Stack>
              )}
              {selectedCheck.status === "Flagged" && (
                <Alert variant="warning">
                  This background check requires manual review before clearance.
                </Alert>
              )}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedCheck(null)}>Close</Button>
          <Button variant="outline">Download Report</Button>
          {selectedCheck?.status === "Expired" && <Button variant="solid">Initiate Renewal</Button>}
        </ModalFooter>
      </Modal>

      <Modal open={showInitiateModal} onClose={() => setShowInitiateModal(false)}>
        <ModalHeader><H3>Initiate Background Check</H3></ModalHeader>
        <ModalBody>
          <Stack gap={4}>
            <Select>
              <option value="">Select Employee...</option>
              {backgroundChecks.map(c => <option key={c.crewMemberId} value={c.crewMemberId}>{c.crewMemberName}</option>)}
            </Select>
            <Select>
              <option value="">Check Type...</option>
              <option value="Criminal">Criminal</option>
              <option value="Employment">Employment Verification</option>
              <option value="Education">Education Verification</option>
              <option value="Credit">Credit Check</option>
              <option value="Comprehensive">Comprehensive</option>
            </Select>
            <Card className="p-4">
              <Stack gap={2}>
                <Body className="font-display">Check Pricing</Body>
                <Grid cols={2} gap={2}>
                  <Body size="sm" className="">Criminal: $25</Body>
                  <Body size="sm" className="">Employment: $35</Body>
                  <Body size="sm" className="">Education: $30</Body>
                  <Body size="sm" className="">Comprehensive: $75</Body>
                </Grid>
              </Stack>
            </Card>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowInitiateModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => setShowInitiateModal(false)}>Submit Request</Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
