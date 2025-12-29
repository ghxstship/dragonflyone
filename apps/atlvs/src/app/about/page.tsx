"use client";

/**
 * About Page
 * Company information and mission
 * Uses DetailPage template for consistent layout
 */

import { useRouter } from "next/navigation";
import { Building2, Users, Target, Award, Heart, Globe, List, Briefcase } from "lucide-react";
import {
  Body,
  Button,
  Card,
  Grid,
  StatCard,
  DetailPage,
  Section,
  SectionHeader,
} from "@ghxstship/ui";

const TEAM_MEMBERS = [
  { name: "Alex Chen", role: "CEO & Founder", image: "👨‍💼" },
  { name: "Sarah Williams", role: "CTO", image: "👩‍💻" },
  { name: "Michael Brown", role: "Head of Product", image: "👨‍🎨" },
  { name: "Emily Davis", role: "Head of Sales", image: "👩‍💼" },
];

const VALUES = [
  { icon: <Heart className="size-6" />, title: "Customer First", description: "We put our customers at the center of everything we do" },
  { icon: <Target className="size-6" />, title: "Excellence", description: "We strive for excellence in every aspect of our work" },
  { icon: <Users className="size-6" />, title: "Collaboration", description: "We believe in the power of teamwork and partnership" },
  { icon: <Globe className="size-6" />, title: "Innovation", description: "We continuously push boundaries to create better solutions" },
];

export default function AboutPage() {
  const router = useRouter();

  const tabs = [
    {
      id: "about",
      label: "About Us",
      icon: <List className="size-4" />,
      content: (
        <Section>
          <Card className="p-8 mb-8">
            <SectionHeader title="Our Mission" />
            <Body className="font-weight-medium text-grey-300 mt-4 leading-relaxed">
              ATLVS is the premier production management platform designed for live events, entertainment, and experiential marketing. 
              We empower production teams to streamline their workflows, manage resources efficiently, and deliver exceptional experiences.
            </Body>
          </Card>

          <Grid cols={4} gap={4} className="grid-cols-2 md:grid-cols-4 mb-8">
            <StatCard label="Founded" value="2020" icon={<Building2 className="size-5" />} />
            <StatCard label="Team Members" value="50+" icon={<Users className="size-5" />} />
            <StatCard label="Customers" value="1,000+" icon={<Briefcase className="size-5" />} />
            <StatCard label="Events Managed" value="10K+" icon={<Award className="size-5" />} />
          </Grid>

          <SectionHeader title="Our Values" description="The principles that guide everything we do" />
          <Grid cols={2} gap={4} className="grid-cols-1 md:grid-cols-2 mt-4">
            {VALUES.map((value, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-primary/20 rounded-card text-primary">{value.icon}</div>
                  <div>
                    <Body className="font-weight-bold font-weight-medium">{value.title}</Body>
                    <Body className="text-grey-400 mt-1">{value.description}</Body>
                  </div>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>
      ),
    },
    {
      id: "team",
      label: "Our Team",
      icon: <Users className="size-4" />,
      content: (
        <Section>
          <SectionHeader title="Leadership Team" description="Meet the people behind ATLVS" />
          <Grid cols={4} gap={6} className="grid-cols-2 md:grid-cols-4 mt-6">
            {TEAM_MEMBERS.map((member, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="text-6xl mb-4">{member.image}</div>
                <Body className="font-weight-bold">{member.name}</Body>
                <Body size="sm" className="text-grey-400">{member.role}</Body>
              </Card>
            ))}
          </Grid>

          <Card className="p-8 mt-8 text-center">
            <Body className="font-weight-bold font-weight-bold mb-2">Join Our Team</Body>
            <Body className="text-grey-400 mb-4">We&apos;re always looking for talented people to join us</Body>
            <Button variant="solid" onClick={() => router.push("/careers")}>View Open Positions</Button>
          </Card>
        </Section>
      ),
    },
  ];

  return (
    <DetailPage
      header={{
        kicker: "Company",
        title: "About ATLVS",
        description: "Learn about our mission, values, and the team behind the platform",
      }}
      tabs={tabs}
      actions={<Button variant="outline" onClick={() => router.push("/contact")}>Contact Us</Button>}
    />
  );
}
