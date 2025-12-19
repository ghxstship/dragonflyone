"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocalTabState } from "@ghxstship/config/hooks";
import { AtlvsAppLayout } from "../../../components/app-layout";
import {
  Container,
  H3,
  Body,
  Label,
  Grid,
  Stack,
  StatCard,
  Button,
  Card,
  Tabs,
  TabsList,
  Tab,
  TabPanel,
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
  DEMO_UNION_LOCALS,
  DEMO_UNION_COMPLIANCE_RULES,
  type DemoUnionLocal as UnionLocal,
  type DemoUnionComplianceRule as UnionRule,
} from '../../../lib/demo-data';

export default function UnionCompliancePage() {
  const router = useRouter();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useLocalTabState({
    storageKey: 'union-compliance-tab',
    defaultTab: 'locals',
  });
  const [selectedLocal, setSelectedLocal] = useState<UnionLocal | null>(null);
  const [selectedRule, setSelectedRule] = useState<UnionRule | null>(null);

  const expiringCount = DEMO_UNION_LOCALS.filter(l => l.status === "Expiring").length;
  const totalMembers = DEMO_UNION_LOCALS.reduce((s, l) => s + l.memberCount, 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "text-success-400";
      case "Expiring": return "text-warning-400";
      case "Expired": return "text-error-400";
      default: return "text-ink-400";
    }
  };

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Union Compliance"
        subtitle="Union rules, agreements, and compliance tracking"


        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

          {expiringCount > 0 && (
            <Alert variant="warning">
              {expiringCount} union agreement(s) expiring within 90 days
            </Alert>
          )}

          <Grid cols={4} gap={6} className="sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Union Locals" value={DEMO_UNION_LOCALS.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Total Members" value={totalMembers.toLocaleString()} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Active Rules" value={DEMO_UNION_COMPLIANCE_RULES.length} className="bg-transparent border-2 border-ink-800" />
            <StatCard label="Expiring Agreements" value={expiringCount} trend={expiringCount > 0 ? "down" : "neutral"} className="bg-transparent border-2 border-ink-800" />
          </Grid>

          <Tabs>
            <TabsList>
              <Tab active={isActive('locals')} onClick={() => setActiveTab('locals')}>Union Locals</Tab>
              <Tab active={isActive('rules')} onClick={() => setActiveTab('rules')}>Work Rules</Tab>
              <Tab active={isActive('agreements')} onClick={() => setActiveTab('agreements')}>Agreements</Tab>
            </TabsList>

            <TabPanel active={isActive('locals')}>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                {DEMO_UNION_LOCALS.map((local) => (
                  <Card key={local.id} className="border-2 border-ink-800 bg-ink-900/50 p-6">
                    <Stack gap={4}>
                      <Stack direction="horizontal" className="justify-between">
                        <Stack gap={1}>
                          <Body className="font-display text-white">{local.name}</Body>
                          <Badge variant="outline">{local.code}</Badge>
                        </Stack>
                        <Label className={getStatusColor(local.status)}>{local.status}</Label>
                      </Stack>
                      <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Jurisdiction</Label><Label className="text-white">{local.jurisdiction}</Label></Stack>
                        <Stack gap={1}><Label size="xs" className="text-ink-500">Members</Label><Label className="font-mono text-white">{local.memberCount.toLocaleString()}</Label></Stack>
                      </Grid>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Contact</Label>
                        <Label className="text-white">{local.contactName}</Label>
                        <Label className="text-ink-400">{local.contactPhone}</Label>
                      </Stack>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Agreement Expiry</Label>
                        <Label className={getStatusColor(local.status)}>{local.agreementExpiry}</Label>
                      </Stack>
                      <Button variant="outline" size="sm" onClick={() => setSelectedLocal(local)}>View Details</Button>
                    </Stack>
                  </Card>
                ))}
              </Grid>
            </TabPanel>

            <TabPanel active={isActive('rules')}>
              <Table variant="dark" className="border-2 border-ink-800">
                <TableHeader>
                  <TableRow className="bg-ink-900">
                    <TableHead className="text-ink-400">Local</TableHead>
                    <TableHead className="text-ink-400">Category</TableHead>
                    <TableHead className="text-ink-400">Rule</TableHead>
                    <TableHead className="text-ink-400">Requirement</TableHead>
                    <TableHead className="text-ink-400">Penalty</TableHead>
                    <TableHead className="text-ink-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DEMO_UNION_COMPLIANCE_RULES.map((rule) => (
                    <TableRow key={rule.id} className="border-ink-800">
                      <TableCell><Badge variant="outline">{DEMO_UNION_LOCALS.find(l => l.id === rule.localId)?.code}</Badge></TableCell>
                      <TableCell><Label className="text-ink-300">{rule.category}</Label></TableCell>
                      <TableCell><Label className="text-white">{rule.rule}</Label></TableCell>
                      <TableCell><Label className="text-ink-300">{rule.requirement}</Label></TableCell>
                      <TableCell><Label className="text-error-400">{rule.penalty || "-"}</Label></TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => setSelectedRule(rule)}>Details</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabPanel>

            <TabPanel active={isActive('agreements')}>
              <Stack gap={4}>
                {DEMO_UNION_LOCALS.map((local) => (
                  <Card key={local.id} className="border-2 border-ink-800 bg-ink-900/50 p-4">
                    <Grid cols={6} gap={4} className="items-center">
                      <Stack gap={1}>
                        <Label className="text-white">{local.name}</Label>
                        <Badge variant="outline">{local.code}</Badge>
                      </Stack>
                      <Label className="text-ink-300">{local.jurisdiction}</Label>
                      <Stack gap={1}>
                        <Label size="xs" className="text-ink-500">Expiry Date</Label>
                        <Label className={getStatusColor(local.status)}>{local.agreementExpiry}</Label>
                      </Stack>
                      <Label className={getStatusColor(local.status)}>{local.status}</Label>
                      <Stack direction="horizontal" gap={2}>
                        <Button variant="outline" size="sm">View Agreement</Button>
                        {local.status === "Expiring" && <Button variant="solid" size="sm">Initiate Renewal</Button>}
                      </Stack>
                    </Grid>
                  </Card>
                ))}
              </Stack>
            </TabPanel>
          </Tabs>

            <Grid cols={3} gap={4} className="sm:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" className="border-ink-800 text-grey-400" onClick={() => router.push("/workforce")}>Workforce</Button>
              <Button variant="outline" className="border-ink-800 text-grey-400" onClick={() => router.push("/employees")}>Employees</Button>
              <Button variant="outline" className="border-ink-800 text-grey-400" onClick={() => router.push("/")}>Dashboard</Button>
            </Grid>

      <Modal open={!!selectedLocal} onClose={() => setSelectedLocal(null)}>
        <ModalHeader><H3>{selectedLocal?.name}</H3></ModalHeader>
        <ModalBody>
          {selectedLocal && (
            <Stack gap={4}>
              <Badge variant="outline">{selectedLocal.code}</Badge>
              <Grid cols={2} gap={4} className="sm:grid-cols-1 lg:grid-cols-2">
                <Stack gap={1}><Label className="text-grey-400">Jurisdiction</Label><Label className="text-white">{selectedLocal.jurisdiction}</Label></Stack>
                <Stack gap={1}><Label className="text-grey-400">Members</Label><Label className="font-mono text-white">{selectedLocal.memberCount.toLocaleString()}</Label></Stack>
              </Grid>
              <Stack gap={1}>
                <Label className="text-grey-400">Contact</Label>
                <Label className="text-white">{selectedLocal.contactName}</Label>
                <Label className="text-grey-300">{selectedLocal.contactPhone}</Label>
              </Stack>
              <Stack gap={1}>
                <Label className="text-grey-400">Agreement Status</Label>
                <Label className={getStatusColor(selectedLocal.status)}>{selectedLocal.status} - Expires {selectedLocal.agreementExpiry}</Label>
              </Stack>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedLocal(null)}>Close</Button>
          <Button variant="solid">View Agreement</Button>
        </ModalFooter>
      </Modal>

      <Modal open={!!selectedRule} onClose={() => setSelectedRule(null)}>
        <ModalHeader><H3>{selectedRule?.rule}</H3></ModalHeader>
        <ModalBody>
          {selectedRule && (
            <Stack gap={4}>
              <Badge variant="outline">{selectedRule.category}</Badge>
              <Stack gap={1}><Label className="text-grey-400">Requirement</Label><Body className="text-white">{selectedRule.requirement}</Body></Stack>
              {selectedRule.penalty && <Stack gap={1}><Label className="text-grey-400">Penalty</Label><Label className="text-error-400">{selectedRule.penalty}</Label></Stack>}
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedRule(null)}>Close</Button>
        </ModalFooter>
      </Modal>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
