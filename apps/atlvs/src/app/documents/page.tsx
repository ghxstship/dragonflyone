'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container, Section, Display, H2, H3, Body, Button, Input, Select, Card, Grid, Badge, Stack, StatCard } from '@ghxstship/ui';
import { Search, Plus, FileText, FolderOpen, Download, Upload, Clock, User } from 'lucide-react';

export default function DocumentsPage() {
  const router = useRouter();
  const [selectedFolder, setSelectedFolder] = useState('all');

  const documents = [
    {
      id: '1',
      name: 'Ultra Music Festival - Master Contract 2025',
      type: 'Contract',
      folder: 'Contracts',
      version: '3.2',
      size: '2.4 MB',
      uploadedBy: 'Sarah Johnson',
      uploadedAt: '2024-11-20',
      status: 'active',
    },
    {
      id: '2',
      name: 'General Liability Insurance Policy',
      type: 'Insurance',
      folder: 'Compliance',
      version: '1.0',
      size: '1.1 MB',
      uploadedBy: 'Mike Peters',
      uploadedAt: '2024-11-15',
      status: 'active',
    },
    {
      id: '3',
      name: 'Q4 2024 Financial Statements',
      type: 'Financial',
      folder: 'Finance',
      version: '2.1',
      size: '856 KB',
      uploadedBy: 'John Doe',
      uploadedAt: '2024-11-18',
      status: 'active',
    },
  ];

  const folders = ['All', 'Contracts', 'Compliance', 'Finance', 'HR', 'Legal', 'Operations'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-white text-black border-2 border-black';
      case 'archived': return 'bg-grey-400 text-white';
      case 'draft': return 'bg-grey-200 text-black';
      default: return 'bg-grey-200 text-black';
    }
  };

  return (
    <Section className="min-h-screen bg-white py-8">
      <Container>
        <Stack gap={8}>
          <Stack gap={4} direction="horizontal" className="justify-between items-start">
            <Stack gap={2}>
              <Display>DOCUMENT MANAGEMENT</Display>
              <Body className="text-grey-600">Centralized document storage with version control</Body>
            </Stack>
            <Stack gap={3} direction="horizontal">
              <Button variant="outline" onClick={() => router.push('/documents/upload')}>
                <Upload className="w-4 h-4 mr-2" />
                UPLOAD
              </Button>
              <Button onClick={() => router.push('/documents/folders/new')}>
                <Plus className="w-4 h-4 mr-2" />
                NEW FOLDER
              </Button>
            </Stack>
          </Stack>

          {/* Folder Navigation */}
          <Card className="p-6">
            <Stack gap={2} direction="horizontal" className="flex-wrap">
              {folders.map((folder) => (
                <Button
                  key={folder}
                  variant={selectedFolder === folder.toLowerCase() ? 'solid' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFolder(folder.toLowerCase())}
                >
                  <FolderOpen className="w-4 h-4 mr-2" />
                  {folder}
                </Button>
              ))}
            </Stack>
          </Card>

          {/* Search and Filters */}
          <Card className="p-6">
            <Stack gap={4} direction="horizontal">
              <Stack className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-grey-500" />
                <Input placeholder="Search documents..." className="pl-10 w-full" />
              </Stack>
              <Select className="w-48">
                <option>All Types</option>
                <option>Contracts</option>
                <option>Insurance</option>
                <option>Financial</option>
                <option>Legal</option>
              </Select>
              <Select className="w-48">
                <option>All Statuses</option>
                <option>Active</option>
                <option>Archived</option>
                <option>Draft</option>
              </Select>
            </Stack>
          </Card>

          {/* Documents List */}
          <Stack gap={4}>
            {documents.map((doc) => (
              <Card key={doc.id} className="p-6 hover:shadow-[8px_8px_0_0_#000] transition-shadow">
                <Stack gap={4} direction="horizontal" className="items-start justify-between">
                  <Stack gap={4} className="flex-1">
                    <Stack gap={3} direction="horizontal" className="items-center">
                      <FileText className="w-6 h-6 text-grey-600" />
                      <H2>{doc.name}</H2>
                      <Badge className={getStatusColor(doc.status)}>
                        v{doc.version}
                      </Badge>
                    </Stack>
                    
                    <Grid cols={4} gap={6}>
                      <Stack gap={1}>
                        <Body className="text-sm text-grey-600">Type</Body>
                        <Body className="font-bold">{doc.type}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-sm text-grey-600">Folder</Body>
                        <Body className="font-bold">{doc.folder}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-sm text-grey-600">Size</Body>
                        <Body className="font-bold">{doc.size}</Body>
                      </Stack>
                      <Stack gap={1}>
                        <Body className="text-sm text-grey-600">Uploaded</Body>
                        <Stack gap={2} direction="horizontal" className="items-center">
                          <Clock className="w-4 h-4 text-grey-600" />
                          <Body className="text-sm">{new Date(doc.uploadedAt).toLocaleDateString()}</Body>
                        </Stack>
                      </Stack>
                    </Grid>

                    <Stack gap={2} direction="horizontal" className="items-center text-sm text-grey-600">
                      <User className="w-4 h-4" />
                      <Body className="text-sm">Uploaded by {doc.uploadedBy}</Body>
                    </Stack>
                  </Stack>

                  <Stack gap={2} direction="horizontal" className="ml-6">
                    <Button variant="outline" size="sm" onClick={() => window.open(`/api/documents/${doc.id}/download`, '_blank')}>
                      <Download className="w-4 h-4 mr-2" />
                      DOWNLOAD
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/documents/${doc.id}`)}>VIEW</Button>
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Stack>

          {/* Storage Stats */}
          <Card className="p-6 bg-grey-50">
            <Grid cols={3} gap={6}>
              <Stack gap={1}>
                <H3>Storage Used</H3>
                <Display size="md">4.3 GB</Display>
                <Body className="text-sm text-grey-600">of 100 GB</Body>
              </Stack>
              <Stack gap={1}>
                <H3>Total Documents</H3>
                <Display size="md">1,247</Display>
                <Body className="text-sm text-grey-600">across all folders</Body>
              </Stack>
              <Stack gap={1}>
                <H3>Active Versions</H3>
                <Display size="md">89</Display>
                <Body className="text-sm text-grey-600">pending approval</Body>
              </Stack>
            </Grid>
          </Card>
        </Stack>
      </Container>
    </Section>
  );
}
