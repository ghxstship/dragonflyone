'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AtlvsAppLayout } from '../../../components/app-layout';
import {
  Container,
  H2,
  H3,
  Body,
  Label,
  Button,
  Card,
  Field,
  Input,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  StatCard,
  Tabs,
  TabsList,
  Tab,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';

interface Contact {
  id: string;
  name: string;
  title: string;
  company: string;
  type: 'client' | 'vendor' | 'partner' | 'prospect' | 'internal';
  email: string;
  phone?: string;
}

interface Relationship {
  id: string;
  from_contact_id: string;
  from_contact: Contact;
  to_contact_id: string;
  to_contact: Contact;
  relationship_type: 'reports_to' | 'manages' | 'works_with' | 'referred_by' | 'decision_maker' | 'influencer' | 'champion' | 'blocker';
  strength: 'strong' | 'moderate' | 'weak';
  notes?: string;
}

interface StakeholderMap {
  organization_id: string;
  organization_name: string;
  stakeholders: {
    contact: Contact;
    role: string;
    influence: 'high' | 'medium' | 'low';
    sentiment: 'positive' | 'neutral' | 'negative';
  }[];
}

const mockContacts: Contact[] = [
  { id: 'CON-001', name: 'Sarah Mitchell', title: 'VP of Events', company: 'Acme Corp', type: 'client', email: 'sarah@acme.com', phone: '+1 555-0101' },
  { id: 'CON-002', name: 'John Davis', title: 'Event Manager', company: 'Acme Corp', type: 'client', email: 'john@acme.com', phone: '+1 555-0102' },
  { id: 'CON-003', name: 'Lisa Chen', title: 'CFO', company: 'Acme Corp', type: 'client', email: 'lisa@acme.com' },
  { id: 'CON-004', name: 'Mike Thompson', title: 'CEO', company: 'Acme Corp', type: 'client', email: 'mike@acme.com' },
  { id: 'CON-005', name: 'Emily Park', title: 'Procurement Director', company: 'Acme Corp', type: 'client', email: 'emily@acme.com' },
];

const mockRelationships: Relationship[] = [
  { id: 'REL-001', from_contact_id: 'CON-002', from_contact: mockContacts[1], to_contact_id: 'CON-001', to_contact: mockContacts[0], relationship_type: 'reports_to', strength: 'strong' },
  { id: 'REL-002', from_contact_id: 'CON-001', from_contact: mockContacts[0], to_contact_id: 'CON-004', to_contact: mockContacts[3], relationship_type: 'reports_to', strength: 'strong' },
  { id: 'REL-003', from_contact_id: 'CON-003', from_contact: mockContacts[2], to_contact_id: 'CON-004', to_contact: mockContacts[3], relationship_type: 'reports_to', strength: 'strong' },
  { id: 'REL-004', from_contact_id: 'CON-001', from_contact: mockContacts[0], to_contact_id: 'CON-003', to_contact: mockContacts[2], relationship_type: 'works_with', strength: 'moderate' },
];

const mockStakeholderMap: StakeholderMap = {
  organization_id: 'ORG-001',
  organization_name: 'Acme Corp',
  stakeholders: [
    { contact: mockContacts[3], role: 'Executive Sponsor', influence: 'high', sentiment: 'positive' },
    { contact: mockContacts[0], role: 'Project Owner', influence: 'high', sentiment: 'positive' },
    { contact: mockContacts[2], role: 'Budget Approver', influence: 'high', sentiment: 'neutral' },
    { contact: mockContacts[1], role: 'Day-to-Day Contact', influence: 'medium', sentiment: 'positive' },
    { contact: mockContacts[4], role: 'Procurement Lead', influence: 'medium', sentiment: 'neutral' },
  ],
};

export default function RelationshipsPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [relationships, setRelationships] = useState<Relationship[]>(mockRelationships);
  const [stakeholderMap, setStakeholderMap] = useState<StakeholderMap>(mockStakeholderMap);
  const [activeTab, setActiveTab] = useState('map');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [newRelationship, setNewRelationship] = useState({
    from_contact_id: '',
    to_contact_id: '',
    relationship_type: 'works_with',
    strength: 'moderate',
    notes: '',
  });

  const handleAddRelationship = () => {
    if (!newRelationship.from_contact_id || !newRelationship.to_contact_id) {
      setError('Please select both contacts');
      return;
    }

    const fromContact = contacts.find(c => c.id === newRelationship.from_contact_id);
    const toContact = contacts.find(c => c.id === newRelationship.to_contact_id);

    if (!fromContact || !toContact) return;

    const relationship: Relationship = {
      id: `REL-${Date.now()}`,
      from_contact_id: newRelationship.from_contact_id,
      from_contact: fromContact,
      to_contact_id: newRelationship.to_contact_id,
      to_contact: toContact,
      relationship_type: newRelationship.relationship_type as Relationship['relationship_type'],
      strength: newRelationship.strength as Relationship['strength'],
      notes: newRelationship.notes,
    };

    setRelationships([...relationships, relationship]);
    setShowAddModal(false);
    setNewRelationship({ from_contact_id: '', to_contact_id: '', relationship_type: 'works_with', strength: 'moderate', notes: '' });
    setSuccess('Relationship added');
  };

  const getRelationshipBadge = (type: string) => {
    const colors: Record<string, string> = {
      reports_to: 'bg-info-500 text-white',
      manages: 'bg-purple-500 text-white',
      works_with: 'bg-success-500 text-white',
      referred_by: 'bg-warning-500 text-black',
      decision_maker: 'bg-error-500 text-white',
      influencer: 'bg-warning-500 text-white',
      champion: 'bg-success-600 text-white',
      blocker: 'bg-error-600 text-white',
    };
    return <Badge className={colors[type] || ''}>{type.replace('_', ' ')}</Badge>;
  };

  const getInfluenceBadge = (influence: string) => {
    const colors: Record<string, string> = {
      high: 'bg-error-500 text-white',
      medium: 'bg-warning-500 text-black',
      low: 'bg-success-500 text-white',
    };
    return <Badge className={colors[influence] || ''}>{influence}</Badge>;
  };

  const getSentimentBadge = (sentiment: string) => {
    const colors: Record<string, string> = {
      positive: 'bg-success-500 text-white',
      neutral: 'bg-ink-500 text-white',
      negative: 'bg-error-500 text-white',
    };
    return <Badge className={colors[sentiment] || ''}>{sentiment}</Badge>;
  };

  const getContactRelationships = (contactId: string) => {
    return relationships.filter(r => r.from_contact_id === contactId || r.to_contact_id === contactId);
  };

  return (
    <AtlvsAppLayout>
      <EnterprisePageHeader
        title="Relationship Mapping"
        subtitle="Stakeholder org charts and relationship visualization"
        breadcrumbs={[{ label: 'ATLVS', href: '/dashboard' }, { label: 'Contacts', href: '/contacts' }, { label: 'Relationships' }]}
        views={[{ id: 'default', label: 'Default', icon: 'grid' }]}
        activeView="default"
        primaryAction={{ label: 'Add Relationship', onClick: () => setShowAddModal(true) }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

        {error && (
          <Alert variant="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        <Grid cols={4} gap={6} className="mb-8">
          <StatCard
            label="Total Contacts"
            value={contacts.length}
            icon={<span>👥</span>}
          />
          <StatCard
            label="Relationships"
            value={relationships.length}
            icon={<span>🔗</span>}
          />
          <StatCard
            label="Key Stakeholders"
            value={stakeholderMap.stakeholders.filter(s => s.influence === 'high').length}
            icon={<span>⭐</span>}
          />
          <StatCard
            label="Champions"
            value={stakeholderMap.stakeholders.filter(s => s.sentiment === 'positive').length}
            icon={<span>💚</span>}
          />
        </Grid>

        <Tabs>
          <TabsList>
            <Tab active={activeTab === 'map'} onClick={() => setActiveTab('map')}>
              Stakeholder Map
            </Tab>
            <Tab active={activeTab === 'org'} onClick={() => setActiveTab('org')}>
              Org Chart
            </Tab>
            <Tab active={activeTab === 'relationships'} onClick={() => setActiveTab('relationships')}>
              All Relationships
            </Tab>
          </TabsList>
        </Tabs>

        {activeTab === 'map' && (
          <Stack gap={6} className="mt-6">
            <Card className="p-6 border-2 border-black">
              <Stack gap={4}>
                <H2>{stakeholderMap.organization_name}</H2>
                <Body className="text-ink-600">Stakeholder influence and sentiment mapping</Body>
              </Stack>
            </Card>

            <Grid cols={3} gap={6}>
              {['high', 'medium', 'low'].map(influence => (
                <Stack key={influence} gap={4}>
                  <H3 className="text-center capitalize">{influence} Influence</H3>
                  {stakeholderMap.stakeholders
                    .filter(s => s.influence === influence)
                    .map(stakeholder => (
                      <Card
                        key={stakeholder.contact.id}
                        className={`p-4 border-2 cursor-pointer hover:shadow-lg ${
                          stakeholder.sentiment === 'positive' ? 'border-success-300 bg-success-50' :
                          stakeholder.sentiment === 'negative' ? 'border-error-300 bg-error-50' :
                          'border-ink-300'
                        }`}
                        onClick={() => setSelectedContact(stakeholder.contact)}
                      >
                        <Stack gap={2}>
                          <Body className="font-bold">{stakeholder.contact.name}</Body>
                          <Label className="text-ink-500">{stakeholder.contact.title}</Label>
                          <Badge variant="outline">{stakeholder.role}</Badge>
                          <Stack direction="horizontal" gap={2}>
                            {getInfluenceBadge(stakeholder.influence)}
                            {getSentimentBadge(stakeholder.sentiment)}
                          </Stack>
                        </Stack>
                      </Card>
                    ))}
                </Stack>
              ))}
            </Grid>
          </Stack>
        )}

        {activeTab === 'org' && (
          <Stack gap={6} className="mt-6">
            <Card className="p-8 border-2 border-black">
              <Stack gap={8}>
                {/* CEO Level */}
                <Stack className="items-center">
                  <Card className="p-4 border-2 border-black bg-ink-100 w-64">
                    <Stack gap={1} className="text-center">
                      <Body className="font-bold">{mockContacts[3].name}</Body>
                      <Label className="text-ink-500">{mockContacts[3].title}</Label>
                      {getRelationshipBadge('decision_maker')}
                    </Stack>
                  </Card>
                </Stack>

                {/* Direct Reports */}
                <Stack direction="horizontal" className="justify-center gap-8">
                  {[mockContacts[0], mockContacts[2]].map(contact => (
                    <Stack key={contact.id} className="items-center" gap={4}>
                      <Card className="w-1 h-8 bg-black" />
                      <Card className="p-4 border-2 border-black w-56">
                        <Stack gap={1} className="text-center">
                          <Body className="font-bold">{contact.name}</Body>
                          <Label className="text-ink-500">{contact.title}</Label>
                        </Stack>
                      </Card>
                    </Stack>
                  ))}
                </Stack>

                {/* Team Members */}
                <Stack direction="horizontal" className="justify-center gap-8">
                  <Stack className="items-center" gap={4}>
                    <Card className="w-1 h-8 bg-black" />
                    <Card className="p-4 border border-ink-300 w-48">
                      <Stack gap={1} className="text-center">
                        <Body className="font-bold">{mockContacts[1].name}</Body>
                        <Label className="text-ink-500">{mockContacts[1].title}</Label>
                      </Stack>
                    </Card>
                  </Stack>
                  <Stack className="items-center" gap={4}>
                    <Card className="w-1 h-8 bg-black" />
                    <Card className="p-4 border border-ink-300 w-48">
                      <Stack gap={1} className="text-center">
                        <Body className="font-bold">{mockContacts[4].name}</Body>
                        <Label className="text-ink-500">{mockContacts[4].title}</Label>
                      </Stack>
                    </Card>
                  </Stack>
                </Stack>
              </Stack>
            </Card>
          </Stack>
        )}

        {activeTab === 'relationships' && (
          <Stack gap={4} className="mt-6">
            {relationships.map(rel => (
              <Card key={rel.id} className="p-4 border">
                <Grid cols={4} gap={4} className="items-center">
                  <Stack gap={1}>
                    <Body className="font-bold">{rel.from_contact.name}</Body>
                    <Label className="text-ink-500">{rel.from_contact.title}</Label>
                  </Stack>
                  <Stack className="items-center">
                    {getRelationshipBadge(rel.relationship_type)}
                    <Body className="text-ink-600">→</Body>
                  </Stack>
                  <Stack gap={1}>
                    <Body className="font-bold">{rel.to_contact.name}</Body>
                    <Label className="text-ink-500">{rel.to_contact.title}</Label>
                  </Stack>
                  <Stack className="items-end">
                    <Badge variant="outline" className="capitalize">{rel.strength}</Badge>
                  </Stack>
                </Grid>
              </Card>
            ))}
          </Stack>
        )}

        <Modal
          open={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add Relationship"
        >
          <Stack gap={4}>
            <Field label="From Contact">
              <Select
                value={newRelationship.from_contact_id}
                onChange={(e) => setNewRelationship({ ...newRelationship, from_contact_id: e.target.value })}
              >
                <option value="">Select contact...</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.title}</option>
                ))}
              </Select>
            </Field>
            <Field label="Relationship Type">
              <Select
                value={newRelationship.relationship_type}
                onChange={(e) => setNewRelationship({ ...newRelationship, relationship_type: e.target.value })}
              >
                <option value="reports_to">Reports To</option>
                <option value="manages">Manages</option>
                <option value="works_with">Works With</option>
                <option value="referred_by">Referred By</option>
                <option value="decision_maker">Decision Maker</option>
                <option value="influencer">Influencer</option>
                <option value="champion">Champion</option>
                <option value="blocker">Blocker</option>
              </Select>
            </Field>
            <Field label="To Contact">
              <Select
                value={newRelationship.to_contact_id}
                onChange={(e) => setNewRelationship({ ...newRelationship, to_contact_id: e.target.value })}
              >
                <option value="">Select contact...</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>{c.name} - {c.title}</option>
                ))}
              </Select>
            </Field>
            <Field label="Strength">
              <Select
                value={newRelationship.strength}
                onChange={(e) => setNewRelationship({ ...newRelationship, strength: e.target.value })}
              >
                <option value="strong">Strong</option>
                <option value="moderate">Moderate</option>
                <option value="weak">Weak</option>
              </Select>
            </Field>
            <Field label="Notes">
              <Input
                value={newRelationship.notes}
                onChange={(e) => setNewRelationship({ ...newRelationship, notes: e.target.value })}
                placeholder="Optional notes..."
              />
            </Field>
            <Stack direction="horizontal" gap={4}>
              <Button variant="solid" onClick={handleAddRelationship}>
                Add Relationship
              </Button>
              <Button variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Modal>

        <Modal
          open={!!selectedContact}
          onClose={() => setSelectedContact(null)}
          title="Contact Details"
        >
          {selectedContact && (
            <Stack gap={4}>
              <H2>{selectedContact.name}</H2>
              <Body className="text-ink-600">{selectedContact.title}</Body>
              <Body>{selectedContact.company}</Body>
              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Label className="text-ink-500">Email</Label>
                  <Body>{selectedContact.email}</Body>
                </Stack>
                {selectedContact.phone && (
                  <Stack gap={1}>
                    <Label className="text-ink-500">Phone</Label>
                    <Body>{selectedContact.phone}</Body>
                  </Stack>
                )}
              </Grid>
              <Stack gap={2}>
                <Label className="text-ink-500">Relationships</Label>
                {getContactRelationships(selectedContact.id).map(rel => (
                  <Card key={rel.id} className="p-3 border">
                    <Stack direction="horizontal" gap={2} className="items-center">
                      {getRelationshipBadge(rel.relationship_type)}
                      <Body>
                        {rel.from_contact_id === selectedContact.id
                          ? rel.to_contact.name
                          : rel.from_contact.name}
                      </Body>
                    </Stack>
                  </Card>
                ))}
              </Stack>
              <Button variant="outline" onClick={() => setSelectedContact(null)}>
                Close
              </Button>
            </Stack>
          )}
        </Modal>
          </Stack>
        </Container>
      </MainContent>
    </AtlvsAppLayout>
  );
}
