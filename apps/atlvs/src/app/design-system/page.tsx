"use client";

import { useState } from "react";
import {
  // Atoms (13)
  Badge, Button, Checkbox, Divider, Input, Radio, Select, Spinner, Switch, Textarea,
  Display, H1, H2, H3, Body, Label,
  // Molecules (16)
  Alert, Breadcrumb, BreadcrumbItem, ButtonGroup, Card, CardHeader, CardBody,
  Dropdown, DropdownItem, EmptyState, Field, LoadingSpinner, Newsletter, Pagination,
  ProjectCard, ServiceCard, Skeleton, SkeletonCard, SkeletonTable, StatCard, Table,
  TableHeader, TableBody, TableRow, TableHead, TableCell, Tabs, TabsList, Tab, TabPanel,
  // Organisms (6)
  Footer, FooterColumn, FooterLink, FormWizard, FormStep, Hero, ImageGallery, Modal,
  ModalHeader, ModalBody, ModalFooter, Navigation, NavLink,
  // Templates (2)
  PageLayout, SectionLayout,
  // Foundations (1)
  Container, Section, Grid, Stack,
} from "@ghxstship/ui";

export default function DesignSystemShowcase() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <PageLayout
      background="white"
      header={
        <Navigation logo="ATLVS Design System">
          <NavLink href="/design-system" active>Components</NavLink>
          <NavLink href="/">Home</NavLink>
          <NavLink href="/dashboard">Dashboard</NavLink>
        </Navigation>
      }
      footer={
        <Footer>
          <FooterColumn title="Platform">
            <FooterLink href="/">Home</FooterLink>
            <FooterLink href="/dashboard">Dashboard</FooterLink>
          </FooterColumn>
          <FooterColumn title="Resources">
            <FooterLink href="/design-system">Design System</FooterLink>
            <FooterLink href="/docs">Documentation</FooterLink>
          </FooterColumn>
        </Footer>
      }
    >
      {/* Hero Section (Organism) */}
      <Hero
        title="ATLVS Design System"
        subtitle="Complete Component Library - All 38 Components"
        background="black"
        pattern="grid"
        fullHeight={false}
        cta={
          <ButtonGroup>
            <Button variant="solid">Get Started</Button>
            <Button variant="outline">View Docs</Button>
          </ButtonGroup>
        }
      />

      <Container>
        {/* Breadcrumb Navigation */}
        <Section>
          <Breadcrumb>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/design-system">Design System</BreadcrumbItem>
            <BreadcrumbItem active>Components</BreadcrumbItem>
          </Breadcrumb>
        </Section>

        {/* Atoms Section */}
        <SectionLayout background="white">
          <Display>Atoms (13 Components)</Display>
          <Divider className="my-8" />
          
          <Grid cols={1} gap={8}>
            {/* Typography */}
            <Card>
              <CardHeader>
                <H2>Typography</H2>
              </CardHeader>
              <CardBody>
                <Display>Display Text</Display>
                <H1>Heading 1</H1>
                <H2>Heading 2</H2>
                <H3>Heading 3</H3>
                <Body>Body text with standard styling</Body>
                <Label>Label Text</Label>
              </CardBody>
            </Card>

            {/* Buttons & Badges */}
            <Card>
              <CardHeader>
                <H2>Buttons & Badges</H2>
              </CardHeader>
              <CardBody>
                <Stack direction="horizontal" gap={4} className="flex-wrap mb-4">
                  <Button variant="solid">Solid Button</Button>
                  <Button variant="outline">Outline Button</Button>
                  <Button variant="ghost">Ghost Button</Button>
                  <Button variant="outlineWhite">White Outline</Button>
                </Stack>
                <ButtonGroup>
                  <Button>Grouped</Button>
                  <Button>Button</Button>
                  <Button>Set</Button>
                </ButtonGroup>
                <Stack direction="horizontal" gap={2} className="mt-4">
                  <Badge variant="solid">Solid</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge>Default</Badge>
                </Stack>
              </CardBody>
            </Card>

            {/* Form Inputs */}
            <Card>
              <CardHeader>
                <H2>Form Inputs</H2>
              </CardHeader>
              <CardBody>
                <Grid cols={2} gap={4}>
                  <Field label="Input Field" hint="Helper text">
                    <Input placeholder="Enter text..." />
                  </Field>
                  <Field label="Select Field">
                    <Select>
                      <option>Option 1</option>
                      <option>Option 2</option>
                      <option>Option 3</option>
                    </Select>
                  </Field>
                  <Field label="Textarea">
                    <Textarea placeholder="Enter multi-line text..." rows={3} />
                  </Field>
                  <Stack gap={3}>
                    <Checkbox label="Checkbox Option" />
                    <Radio name="radio-group" label="Radio Option 1" />
                    <Radio name="radio-group" label="Radio Option 2" />
                    <Switch label="Toggle Switch" />
                  </Stack>
                </Grid>
              </CardBody>
            </Card>

            {/* Loading & Dividers */}
            <Card>
              <CardHeader>
                <H2>Loading & Dividers</H2>
              </CardHeader>
              <CardBody>
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
                <Divider className="my-4" />
                <LoadingSpinner />
              </CardBody>
            </Card>
          </Grid>
        </SectionLayout>

        {/* Molecules Section */}
        <SectionLayout background="grey">
          <Display>Molecules (16 Components)</Display>
          <Divider className="my-8" />
          
          <Grid cols={1} gap={8}>
            {/* Alerts */}
            <Stack gap={4}>
              <Alert variant="success">Success alert message</Alert>
              <Alert variant="error">Error alert message</Alert>
              <Alert variant="warning">Warning alert message</Alert>
              <Alert variant="info">Info alert message</Alert>
            </Stack>

            {/* Cards Variations */}
            <Grid cols={3} gap={4}>
              <StatCard
                label="Total Revenue"
                value="$124.5K"
                trendValue="+12.5%"
                trend="up"
              />
              <StatCard
                label="Active Users"
                value="1,234"
                trendValue="-2.3%"
                trend="down"
              />
              <StatCard
                label="Conversion Rate"
                value="3.2%"
                trendValue="+0.8%"
                trend="up"
              />
            </Grid>

            {/* Dropdown */}
            <Card>
              <CardHeader>
                <H2>Dropdown Menu</H2>
              </CardHeader>
              <CardBody>
                <Dropdown trigger={<Button>Open Menu</Button>}>
                  <DropdownItem>Action 1</DropdownItem>
                  <DropdownItem>Action 2</DropdownItem>
                  <DropdownItem href="#">Link Item</DropdownItem>
                </Dropdown>
              </CardBody>
            </Card>

            {/* Table */}
            <Card>
              <CardHeader>
                <H2>Data Table</H2>
              </CardHeader>
              <CardBody>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Project Alpha</TableCell>
                      <TableCell><Badge variant="solid">Active</Badge></TableCell>
                      <TableCell>$12,500</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Project Beta</TableCell>
                      <TableCell><Badge variant="outline">Pending</Badge></TableCell>
                      <TableCell>$8,200</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <Stack className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={10}
                    onPageChange={setCurrentPage}
                  />
                </Stack>
              </CardBody>
            </Card>

            {/* Tabs */}
            <Card>
              <CardHeader>
                <H2>Tab Navigation</H2>
              </CardHeader>
              <CardBody>
                <Tabs>
                  <TabsList>
                    <Tab active>Overview</Tab>
                    <Tab>Analytics</Tab>
                    <Tab>Settings</Tab>
                  </TabsList>
                  <TabPanel active>
                    <Body>Overview content panel with active tab displayed</Body>
                  </TabPanel>
                </Tabs>
              </CardBody>
            </Card>

            {/* Skeleton Loading States */}
            <Card>
              <CardHeader>
                <H2>Skeleton Loading</H2>
              </CardHeader>
              <CardBody>
                <Grid cols={2} gap={4}>
                  <SkeletonCard />
                  <Stack>
                    <Skeleton height="2rem" width="60%" className="mb-2" />
                    <Skeleton height="1rem" width="80%" />
                  </Stack>
                </Grid>
                <Stack className="mt-4">
                  <SkeletonTable rows={3} />
                </Stack>
              </CardBody>
            </Card>

            {/* Empty State */}
            <EmptyState
              title="No Data Available"
              description="There are no items to display at this time. Create your first item to get started."
              action={{
                label: "Create Item",
                onClick: () => console.log("Create clicked")
              }}
            />

            {/* Newsletter */}
            <Card>
              <CardHeader>
                <H2>Newsletter</H2>
              </CardHeader>
              <CardBody>
                <Newsletter
                  placeholder="Enter your email"
                  buttonText="Subscribe"
                  onSubmit={(email) => console.log("Subscribe:", email)}
                />
              </CardBody>
            </Card>

            {/* Project & Service Cards */}
            <Grid cols={3} gap={4}>
              <ProjectCard
                title="Project Name"
                image="https://images.unsplash.com/photo-1557683316-973673baf926"
                imageAlt="Project"
                metadata="2024"
                tags={["Design", "Development"]}
              />
              <ServiceCard
                icon="🎨"
                title="Design Services"
                description="Professional design solutions for your business"
              />
              <ServiceCard
                icon="💻"
                title="Development"
                description="Full-stack development expertise"
                background="grey"
              />
            </Grid>
          </Grid>
        </SectionLayout>

        {/* Organisms Section */}
        <SectionLayout background="white">
          <Display>Organisms (6 Components)</Display>
          <Divider className="my-8" />

          {/* Modal */}
          <Card className="mb-8">
            <CardHeader>
              <H2>Modal Dialog</H2>
            </CardHeader>
            <CardBody>
              <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
              <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <ModalHeader>
                  <H2>Modal Title</H2>
                </ModalHeader>
                <ModalBody>
                  <Body>This is the modal content area with standardized spacing and typography.</Body>
                </ModalBody>
                <ModalFooter>
                  <ButtonGroup>
                    <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
                    <Button variant="solid" onClick={() => setModalOpen(false)}>Confirm</Button>
                  </ButtonGroup>
                </ModalFooter>
              </Modal>
            </CardBody>
          </Card>

          {/* Form Wizard */}
          <Card className="mb-8">
            <CardHeader>
              <H2>Multi-Step Form Wizard</H2>
            </CardHeader>
            <CardBody>
              <FormWizard onComplete={() => alert("Form completed!")}>
                <FormStep title="Step 1">
                  <H3>Personal Information</H3>
                  <Field label="Full Name">
                    <Input placeholder="Enter name" />
                  </Field>
                </FormStep>
                <FormStep title="Step 2">
                  <H3>Contact Details</H3>
                  <Field label="Email">
                    <Input type="email" placeholder="Enter email" />
                  </Field>
                </FormStep>
                <FormStep title="Step 3">
                  <H3>Review & Submit</H3>
                  <Body>Review your information and submit.</Body>
                </FormStep>
              </FormWizard>
            </CardBody>
          </Card>

          {/* Image Gallery */}
          <Card>
            <CardHeader>
              <H2>Image Gallery</H2>
            </CardHeader>
            <CardBody>
              <ImageGallery
                columns={3}
                images={[
                  { src: "https://images.unsplash.com/photo-1557683316-973673baf926", alt: "Image 1", caption: "Gallery Image 1" },
                  { src: "https://images.unsplash.com/photo-1557683311-eac922347aa1", alt: "Image 2", caption: "Gallery Image 2" },
                  { src: "https://images.unsplash.com/photo-1557682224-5b8590cd9ec5", alt: "Image 3", caption: "Gallery Image 3" },
                ]}
              />
            </CardBody>
          </Card>
        </SectionLayout>

        {/* Templates & Foundations */}
        <SectionLayout background="grey">
          <Display>Templates & Foundations (3 Components)</Display>
          <Divider className="my-8" />
          <Card>
            <CardHeader>
              <H2>Layout Components</H2>
            </CardHeader>
            <CardBody>
              <Body className="mb-4">
                This page demonstrates PageLayout, SectionLayout, Container, Section, and Grid
                components all working together to create a cohesive design system.
              </Body>
              <Grid cols={3} gap={4}>
                <Card className="border-2 border-black p-4">
                  <Label>Container</Label>
                  <Body>Max-width wrapper</Body>
                </Card>
                <Card className="border-2 border-black p-4">
                  <Label>Section</Label>
                  <Body>Vertical spacing</Body>
                </Card>
                <Card className="border-2 border-black p-4">
                  <Label>Grid</Label>
                  <Body>Responsive layout</Body>
                </Card>
              </Grid>
            </CardBody>
          </Card>
        </SectionLayout>

        {/* Summary */}
        <Section>
          <Card>
            <CardHeader>
              <H2>Component Integration Summary</H2>
            </CardHeader>
            <CardBody>
              <Grid cols={4} gap={4}>
                <StatCard label="Total Components" value="38" trendValue="100%" trend="up" />
                <StatCard label="Atoms" value="13" />
                <StatCard label="Molecules" value="16" />
                <StatCard label="Organisms" value="6" />
              </Grid>
              <Divider className="my-6" />
              <Alert variant="success">
                ✅ All 38 components from @ghxstship/ui are successfully integrated and demonstrated on this page!
              </Alert>
            </CardBody>
          </Card>
        </Section>
      </Container>
    </PageLayout>
  );
}
