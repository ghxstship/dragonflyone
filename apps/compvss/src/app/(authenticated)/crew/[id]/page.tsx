'use client';

/**
 * Crew Member Detail Page
 * View and manage individual crew member information
 */

import { useParams, useRouter } from 'next/navigation';
import { 
  User, Mail, Phone, MapPin, Calendar, Briefcase, Star, Edit, Clock, CheckCircle} from 'lucide-react';
import {
  DetailPage, Badge, Body, Box, Button, Card, Grid, Stack, Text, Spinner, EmptyState} from '@ghxstship/ui';
import { useQuery } from '@tanstack/react-query';

interface CrewMember {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'on_leave';
  hire_date: string;
  location?: string;
  skills: string[];
  certifications: string[];
  avatar_url?: string;
  bio?: string;
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  assignments: {
    id: string;
    project_name: string;
    role: string;
    start_date: string;
    end_date?: string;
    status: 'active' | 'completed' | 'upcoming';
  }[];
}

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'info' | 'outline'> = {
  active: 'success',
  inactive: 'outline',
  on_leave: 'warning',
  completed: 'info',
  upcoming: 'warning',
};

const DEMO_CREW_MEMBER: CrewMember = {
  id: '1',
  full_name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  phone: '+1 (555) 123-4567',
  role: 'Stage Manager',
  department: 'Production',
  status: 'active',
  hire_date: '2022-03-15',
  location: 'Los Angeles, CA',
  skills: ['Stage Management', 'Lighting', 'Sound', 'Rigging'],
  certifications: ['OSHA 30', 'First Aid', 'Rigging Certified'],
  bio: 'Experienced stage manager with over 10 years in live event production.',
  emergency_contact: {
    name: 'Sarah Johnson',
    phone: '+1 (555) 987-6543',
    relationship: 'Spouse',
  },
  assignments: [
    { id: 'a1', project_name: 'Summer Festival 2024', role: 'Stage Manager', start_date: '2024-07-10', end_date: '2024-07-15', status: 'upcoming' },
    { id: 'a2', project_name: 'Concert Series', role: 'Assistant SM', start_date: '2024-06-01', end_date: '2024-06-30', status: 'active' },
    { id: 'a3', project_name: 'Corporate Gala', role: 'Stage Manager', start_date: '2024-05-01', end_date: '2024-05-03', status: 'completed' },
  ],
};

export default function CrewMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const crewId = params.id as string;

  const { data: crewMember, isLoading, error } = useQuery({
    queryKey: ['crew', crewId],
    queryFn: async () => {
      const response = await fetch(`/api/crew/${crewId}`);
      if (!response.ok) {
        return DEMO_CREW_MEMBER;
      }
      const data = await response.json();
      return data.crew_member || DEMO_CREW_MEMBER;
    },
    enabled: !!crewId,
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <DetailPage
        header={{ title: 'Crew Member', description: 'Loading...' }}
        backButton={{ label: 'Back to Crew', href: '/crew' }}
      >
        <Stack gap={6} className="items-center justify-center py-16">
          <Spinner size="lg" />
          <Body>Loading crew member...</Body>
        </Stack>
      </DetailPage>
    );
  }

  if (error || !crewMember) {
    return (
      <DetailPage
        header={{ title: 'Crew Member Not Found' }}
        backButton={{ label: 'Back to Crew', href: '/crew' }}
      >
        <EmptyState
          icon={<User className="h-12 w-12" />}
          title="Crew Member Not Found"
          description="The crew member you are looking for does not exist."
          action={{ label: 'Back to Crew', onClick: () => router.push('/crew') }}
        />
      </DetailPage>
    );
  }

  const profileContent = (
    <Stack gap={6}>
      {/* Profile Header */}
      <Card className="p-6">
        <Stack direction="horizontal" gap={6} className="items-start">
          <Box className="w-24 h-24 rounded-avatar bg-primary/10 flex items-center justify-center">
            <User className="h-12 w-12 text-primary" />
          </Box>
          <Stack gap={3} className="flex-1">
            <Stack direction="horizontal" gap={3} className="items-center">
              <Text className="text-h3-desktop font-weight-bold">{crewMember.full_name}</Text>
              <Badge variant={STATUS_COLORS[crewMember.status] || 'outline'}>
                {crewMember.status.replace('_', ' ')}
              </Badge>
            </Stack>
            <Stack direction="horizontal" gap={6} className="flex-wrap">
              <Stack direction="horizontal" gap={2} className="items-center">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <Body size="sm">{crewMember.role}</Body>
              </Stack>
              <Stack direction="horizontal" gap={2} className="items-center">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Body size="sm">{crewMember.email}</Body>
              </Stack>
              {crewMember.phone && (
                <Stack direction="horizontal" gap={2} className="items-center">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Body size="sm">{crewMember.phone}</Body>
                </Stack>
              )}
              {crewMember.location && (
                <Stack direction="horizontal" gap={2} className="items-center">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <Body size="sm">{crewMember.location}</Body>
                </Stack>
              )}
            </Stack>
            {crewMember.bio && (
              <Body className="text-muted-foreground">{crewMember.bio}</Body>
            )}
          </Stack>
        </Stack>
      </Card>

      <Grid columns={2} gap={6}>
        {/* Skills & Certifications */}
        <Card className="p-6">
          <Stack gap={4}>
            <Stack direction="horizontal" gap={2} className="items-center">
              <Star className="h-5 w-5 text-primary" />
              <Text className="text-h4-desktop font-weight-semibold">Skills & Certifications</Text>
            </Stack>
            
            <Stack gap={3}>
              <Stack gap={2}>
                <Body size="sm" className="text-muted-foreground font-weight-medium">Skills</Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {crewMember.skills.map((skill: string) => (
                    <Badge key={skill} variant="outline">{skill}</Badge>
                  ))}
                </Stack>
              </Stack>
              
              <Stack gap={2}>
                <Body size="sm" className="text-muted-foreground font-weight-medium">Certifications</Body>
                <Stack direction="horizontal" gap={2} className="flex-wrap">
                  {crewMember.certifications.map((cert: string) => (
                    <Badge key={cert} variant="success">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {cert}
                    </Badge>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Card>

        {/* Employment Info */}
        <Card className="p-6">
          <Stack gap={4}>
            <Stack direction="horizontal" gap={2} className="items-center">
              <Calendar className="h-5 w-5 text-primary" />
              <Text className="text-h4-desktop font-weight-semibold">Employment Info</Text>
            </Stack>
            
            <Stack gap={3}>
              <Stack gap={1}>
                <Body size="sm" className="text-muted-foreground">Hire Date</Body>
                <Text className="font-weight-medium">{formatDate(crewMember.hire_date)}</Text>
              </Stack>
              <Stack gap={1}>
                <Body size="sm" className="text-muted-foreground">Department</Body>
                <Text className="font-weight-medium">{crewMember.department}</Text>
              </Stack>
              {crewMember.emergency_contact && (
                <Stack gap={1}>
                  <Body size="sm" className="text-muted-foreground">Emergency Contact</Body>
                  <Text className="font-weight-medium">{crewMember.emergency_contact.name}</Text>
                  <Body size="sm">{crewMember.emergency_contact.phone} ({crewMember.emergency_contact.relationship})</Body>
                </Stack>
              )}
            </Stack>
          </Stack>
        </Card>
      </Grid>

      {/* Assignments */}
      <Card className="p-6">
        <Stack gap={4}>
          <Stack direction="horizontal" gap={2} className="items-center">
            <Clock className="h-5 w-5 text-primary" />
            <Text className="text-h4-desktop font-weight-semibold">Assignments</Text>
          </Stack>
          
          {crewMember.assignments.length === 0 ? (
            <Body className="text-muted-foreground">No assignments yet</Body>
          ) : (
            <Stack gap={3}>
              {crewMember.assignments.map((assignment: CrewMember['assignments'][0]) => (
                <Stack 
                  key={assignment.id} 
                  direction="horizontal" 
                  className="items-center justify-between p-4 bg-muted rounded-card"
                >
                  <Stack gap={1}>
                    <Text className="font-weight-medium">{assignment.project_name}</Text>
                    <Body size="sm" className="text-muted-foreground">
                      {assignment.role} • {formatDate(assignment.start_date)}
                      {assignment.end_date && ` - ${formatDate(assignment.end_date)}`}
                    </Body>
                  </Stack>
                  <Badge variant={STATUS_COLORS[assignment.status] || 'outline'}>
                    {assignment.status}
                  </Badge>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Card>
    </Stack>
  );

  return (
    <DetailPage
      header={{
        kicker: crewMember.department,
        title: crewMember.full_name,
        description: crewMember.role,
      }}
      backButton={{ label: 'Back to Crew', href: '/crew' }}
      actions={
        <Button onClick={() => router.push(`/crew/${crewId}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      }
    >
      {profileContent}
    </DetailPage>
  );
}
