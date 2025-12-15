'use client';

import { useState} from 'react';
import { useRouter } from 'next/navigation';
import { useTabState } from '@ghxstship/config/hooks';
import { logger } from '@ghxstship/config';
import { CompvssAppLayout } from '../../components/app-layout';
import { Camera, Heart } from 'lucide-react';
import {
  Container,
  H3,
  Body,
  Button,
  Card,
  Input,
  Textarea,
  Select,
  Grid,
  Stack,
  Badge,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  StatCard,
  Tabs,
  TabsList,
  Tab,
  EnterprisePageHeader,
  MainContent,
} from '@ghxstship/ui';

import {
  useSocialCrewMembers,
  useCrewPhotos,
  useLikePhoto,
  type SocialCrewMember as CrewMember,
} from '../../hooks/useCrewSocial';

export default function CrewSocialPage() {
  const router = useRouter();
  const { data: crewMembers = [] } = useSocialCrewMembers();
  const { data: photos = [] } = useCrewPhotos();
  const likePhotoMutation = useLikePhoto();
  
  // URL-synced tab state for deep-linking support
  const { setActiveTab, isActive } = useTabState({
    defaultTab: 'roster',
    validTabs: ['roster', 'photos', 'connections'],
  });
  const [selectedMember, setSelectedMember] = useState<CrewMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleConnect = (memberId: string) => {
    // In a real app, this would send a connection request to the API
    logger.info(`Sending connection request to member: ${memberId}`);
    setSuccess('Connection request sent!');
    setShowConnectModal(false);
  };

  const handleLikePhoto = (photoId: string) => {
    likePhotoMutation.mutate({ photoId, userId: 'CREW-001' });
  };

  const filteredMembers = crewMembers.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDepartment = departmentFilter === 'All' || m.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });

  const onlineCount = crewMembers.filter(m => m.is_online).length;
  const totalConnections = crewMembers.reduce((sum, m) => sum + m.connections.length, 0) / 2;

  return (
    <CompvssAppLayout>
      <EnterprisePageHeader
        title="Crew Social"
        subtitle="Connect with your crew, share photos, build your network"


        primaryAction={{ label: 'Full Directory', onClick: () => router.push('/crew') }}
        showFavorite
        showSettings
      />
      <MainContent padding="lg">
        <Container>
          <Stack gap={10}>

          {error && (
            <Alert variant="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert variant="success" onClose={() => setSuccess(null)}>
              {success}
            </Alert>
          )}

            <Grid cols={4} gap={6}>
              <StatCard label="Crew Members" value={crewMembers.length.toString()} />
              <StatCard label="Online Now" value={onlineCount.toString()} />
              <StatCard label="Connections" value={totalConnections.toString()} />
              <StatCard label="Photos Shared" value={photos.length.toString()} />
            </Grid>

            <Tabs>
              <TabsList>
                <Tab active={isActive('roster')} onClick={() => setActiveTab('roster')}>
                  Crew Roster
                </Tab>
                <Tab active={isActive('photos')} onClick={() => setActiveTab('photos')}>
                  Photos
                </Tab>
                <Tab active={isActive('connections')} onClick={() => setActiveTab('connections')}>
                  My Connections
                </Tab>
              </TabsList>
            </Tabs>

            {isActive('roster') && (
              <Stack gap={6}>
                <Grid cols={3} gap={4}>
                  <Input
                    type="search"
                    placeholder="Search crew..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    <option value="All">All Departments</option>
                    <option value="Audio">Audio</option>
                    <option value="Lighting">Lighting</option>
                    <option value="Video">Video</option>
                    <option value="Stage">Stage</option>
                    <option value="Rigging">Rigging</option>
                  </Select>
                  <Button variant="outline">
                    Find Connections
                  </Button>
                </Grid>

                <Grid cols={3} gap={6}>
                  {filteredMembers.map(member => (
                    <Card
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                    >
                      <Stack gap={4}>
                        <Stack direction="horizontal" className="justify-between items-start">
                          <Stack gap={1}>
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <Body className="font-display">{member.name}</Body>
                              {member.is_online && (
                                <Badge variant="solid">Online</Badge>
                              )}
                            </Stack>
                            <Body size="sm" className="">{member.role}</Body>
                          </Stack>
                          <Badge variant="outline">{member.department}</Badge>
                        </Stack>

                        {member.bio && (
                          <Body size="sm" className="">{member.bio}</Body>
                        )}

                        <Stack direction="horizontal" gap={2} className="flex-wrap">
                          {member.skills.slice(0, 3).map(skill => (
                            <Badge key={skill} variant="outline">{skill}</Badge>
                          ))}
                        </Stack>

                        <Stack direction="horizontal" className="justify-between items-center">
                          <Body size="sm" className="">
                            {member.projects_count} projects • {member.connections.length} connections
                          </Body>
                          <Button variant="ghost" size="sm" onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMember(member);
                            setShowConnectModal(true);
                          }}>
                            Connect
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            )}

            {isActive('photos') && (
              <Stack gap={6}>
                <Stack direction="horizontal" className="justify-between items-center">
                  <H3>Recent Photos</H3>
                  <Button variant="outline">
                    Upload Photo
                  </Button>
                </Stack>

                <Grid cols={3} gap={6}>
                  {photos.map(photo => (
                    <Card key={photo.id}>
                      <Card className="h-48 flex items-center justify-center">
                        <Camera className="size-8" />
                      </Card>
                      <Stack gap={3}>
                        {photo.caption && (
                          <Body>{photo.caption}</Body>
                        )}
                        <Stack direction="horizontal" className="justify-between items-center">
                          <Stack gap={1}>
                            <Body size="sm" className="">{photo.uploaded_by}</Body>
                            <Body size="sm" className="">{photo.project_name}</Body>
                          </Stack>
                          <Stack direction="horizontal" gap={2} className="items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikePhoto(photo.id)}
                            >
                              <Heart className="size-4 mr-1" /> {photo.likes}
                            </Button>
                          </Stack>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            )}

            {isActive('connections') && (
              <Stack gap={6}>
                <H3>My Connections</H3>
                <Grid cols={2} gap={6}>
                  {crewMembers.filter(m => m.connections.includes('CREW-001')).map(member => (
                    <Card key={member.id}>
                      <Stack direction="horizontal" className="justify-between items-center">
                        <Stack direction="horizontal" gap={4} className="items-center">
                          <Card className="w-12 h-12 rounded-avatar flex items-center justify-center">
                            <Body>{member.name.charAt(0)}</Body>
                          </Card>
                          <Stack gap={1}>
                            <Stack direction="horizontal" gap={2} className="items-center">
                              <Body className="font-display">{member.name}</Body>
                              {member.is_online && (
                                <Badge variant="solid">Online</Badge>
                              )}
                            </Stack>
                            <Body size="sm" className="">{member.role}</Body>
                            <Body size="sm" className="">{member.location}</Body>
                          </Stack>
                        </Stack>
                        <Stack direction="horizontal" gap={2}>
                          <Button variant="ghost" size="sm">Message</Button>
                          <Button variant="outline" size="sm" onClick={() => setSelectedMember(member)}>
                            Profile
                          </Button>
                        </Stack>
                      </Stack>
                    </Card>
                  ))}
                </Grid>
              </Stack>
            )}

            <Grid cols={4} gap={4}>
              <Button variant="solid" onClick={() => router.push('/crew')}>Full Directory</Button>
              <Button variant="outline" onClick={() => router.push('/channels')}>Channels</Button>
              <Button variant="outline">My Profile</Button>
              <Button variant="outline">Settings</Button>
            </Grid>
          </Stack>
        </Container>
      </MainContent>

      <Modal open={!!selectedMember && !showConnectModal} onClose={() => setSelectedMember(null)}>
        <ModalHeader><H3>Crew Profile</H3></ModalHeader>
        <ModalBody>
          {selectedMember && (
            <Stack gap={4}>
              <Stack direction="horizontal" gap={4} className="items-center">
                <Card className="w-16 h-16 rounded-avatar flex items-center justify-center">
                  <Body>{selectedMember.name.charAt(0)}</Body>
                </Card>
                <Stack gap={1}>
                  <Stack direction="horizontal" gap={2} className="items-center">
                    <Body className="font-display">{selectedMember.name}</Body>
                    {selectedMember.is_online && (
                      <Badge variant="solid">Online</Badge>
                    )}
                  </Stack>
                  <Body size="sm" className="">{selectedMember.role}</Body>
                  <Badge variant="outline">{selectedMember.department}</Badge>
                </Stack>
              </Stack>

              {selectedMember.bio && (
                <Body>{selectedMember.bio}</Body>
              )}

              <Grid cols={2} gap={4}>
                <Stack gap={1}>
                  <Body size="sm" className="">Location</Body>
                  <Body>{selectedMember.location || 'Not specified'}</Body>
                </Stack>
                <Stack gap={1}>
                  <Body size="sm" className="">Member Since</Body>
                  <Body>{new Date(selectedMember.joined_date).toLocaleDateString()}</Body>
                </Stack>
              </Grid>

              <Stack gap={2}>
                <Body size="sm" className="">Skills</Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {selectedMember.skills.map(skill => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </Stack>
              </Stack>

              <Grid cols={2} gap={4}>
                <Card className="text-center">
                  <Body className="font-display">{selectedMember.projects_count}</Body>
                  <Body size="sm" className="">Projects</Body>
                </Card>
                <Card className="text-center">
                  <Body className="font-display">{selectedMember.connections.length}</Body>
                  <Body size="sm" className="">Connections</Body>
                </Card>
              </Grid>
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setSelectedMember(null)}>Close</Button>
          <Button variant="solid" onClick={() => setShowConnectModal(true)}>Connect</Button>
        </ModalFooter>
      </Modal>

      <Modal open={showConnectModal} onClose={() => setShowConnectModal(false)}>
        <ModalHeader><H3>Send Connection Request</H3></ModalHeader>
        <ModalBody>
          {selectedMember && (
            <Stack gap={4}>
              <Body>
                Send a connection request to <span className="font-display">{selectedMember.name}</span>?
              </Body>
              <Textarea
                placeholder="Add a personal message (optional)..."
                rows={3}
              />
            </Stack>
          )}
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowConnectModal(false)}>Cancel</Button>
          <Button variant="solid" onClick={() => handleConnect(selectedMember?.id || '')}>
            Send Request
          </Button>
        </ModalFooter>
      </Modal>
    </CompvssAppLayout>
  );
}
