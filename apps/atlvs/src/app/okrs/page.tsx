"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navigation } from "../../components/navigation";
import {
  H1,
  H3,
  Body,
  StatCard,
  Select,
  Button,
  Badge,
  Card,
  ProgressBar,
  Container,
  Grid,
  Stack,
  Section,
} from "@ghxstship/ui";

const okrs = [
  { id: "OKR-Q4-001", objective: "Scale Production Capacity 50%", owner: "Operations", progress: 65, keyResults: [
    { kr: "Hire 15 new crew members", progress: 80 },
    { kr: "Acquire $2M in new equipment", progress: 60 },
    { kr: "Open second warehouse facility", progress: 45 },
  ]},
  { id: "OKR-Q4-002", objective: "Increase Revenue to $15M", owner: "Business Dev", progress: 70, keyResults: [
    { kr: "Close 8 new festival contracts", progress: 75 },
    { kr: "Expand into 3 new markets", progress: 66 },
    { kr: "Achieve 95% client retention", progress: 100 },
  ]},
  { id: "OKR-Q4-003", objective: "Enhance Operational Excellence", owner: "COO", progress: 55, keyResults: [
    { kr: "Reduce setup time by 25%", progress: 40 },
    { kr: "Achieve 99% on-time delivery", progress: 85 },
    { kr: "Zero safety incidents", progress: 100 },
  ]},
];

export default function OKRsPage() {
  const router = useRouter();
  const [filterOwner, setFilterOwner] = useState("all");

  const filteredOKRs = okrs.filter(okr => 
    filterOwner === "all" || okr.owner.toLowerCase().includes(filterOwner.toLowerCase())
  );

  const avgProgress = Math.round(okrs.reduce((sum, o) => sum + o.progress, 0) / okrs.length);

  return (
    <Section className="relative min-h-screen bg-black text-white">
      <Navigation />
      <Container className="py-16">
        <Stack gap={8}>
          <H1>OKRs & Strategic Goals</H1>

          <Grid cols={4} gap={6}>
            <StatCard
              value={okrs.length}
              label="Active OKRs"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={`${avgProgress}%`}
              label="Avg Progress"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={okrs.filter(o => o.progress >= 70).length}
              label="On Track"
              className="bg-black text-white border-grey-800"
            />
            <StatCard
              value={okrs.filter(o => o.progress < 50).length}
              label="At Risk"
              className="bg-black text-white border-grey-800"
            />
          </Grid>

          <Select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value)}
            className="bg-black text-white border-grey-700 w-48"
          >
            <option value="all">All Owners</option>
            <option value="operations">Operations</option>
            <option value="business">Business Dev</option>
            <option value="coo">COO</option>
          </Select>

          <Stack gap={6}>
            {filteredOKRs.map((okr) => (
              <Card key={okr.id} className="border-2 border-grey-800 p-6 bg-black">
                <Stack gap={4}>
                  <Stack gap={2} direction="horizontal" className="justify-between items-start">
                    <Stack gap={2}>
                      <Body className="font-mono text-xs text-grey-500">{okr.id}</Body>
                      <H3 className="text-white">{okr.objective}</H3>
                      <Body className="text-sm text-grey-400">Owner: {okr.owner}</Body>
                    </Stack>
                    <Badge variant={okr.progress >= 70 ? "solid" : "outline"}>
                      {okr.progress}% Complete
                    </Badge>
                  </Stack>

                  <ProgressBar value={okr.progress} variant="inverse" />

                  <Stack gap={3}>
                    <Body className="font-mono text-xs text-grey-500">Key Results</Body>
                    {okr.keyResults.map((kr, idx) => (
                      <Stack key={idx} gap={3} direction="horizontal" className="justify-between items-center border-l-2 border-grey-700 pl-4">
                        <Body className="text-sm text-grey-300">{kr.kr}</Body>
                        <Stack gap={3} direction="horizontal" className="items-center">
                          <Stack className="w-24">
                            <ProgressBar value={kr.progress} variant="inverse" size="sm" />
                          </Stack>
                          <Body className="font-mono text-xs text-grey-400">{kr.progress}%</Body>
                        </Stack>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>

          <Stack gap={3} direction="horizontal">
            <Button variant="outlineWhite" onClick={() => router.push("/okrs/new")}>
              Create New OKR
            </Button>
            <Button variant="ghost" className="text-grey-400 hover:text-white" onClick={() => router.push("/okrs/export")}>
              Export Progress Report
            </Button>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
