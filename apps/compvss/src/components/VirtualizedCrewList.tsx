import React from 'react';
import { FixedSizeList as List } from 'react-window';
import { Card, Body, Badge, Stack, Button } from '@ghxstship/ui';
import { Eye, Pencil, ClipboardList, Trash2 } from 'lucide-react';
import type { CrewMember } from '@/hooks/useCrew';

interface VirtualizedCrewListProps {
  crew: CrewMember[];
  onView: (member: CrewMember) => void;
  onEdit: (member: CrewMember) => void;
  onAssign: (member: CrewMember) => void;
  onDelete: (member: CrewMember) => void;
  canManage: boolean;
}

const CrewListItem: React.FC<{
  member: CrewMember;
  style: React.CSSProperties;
  onView: (member: CrewMember) => void;
  onEdit: (member: CrewMember) => void;
  onAssign: (member: CrewMember) => void;
  onDelete: (member: CrewMember) => void;
  canManage: boolean;
}> = ({ member, style, onView, onEdit, onAssign, onDelete, canManage }) => (
  <div style={style} className="px-2">
    <Card className="p-4 hover:bg-surface-elevated transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-semibold">
            {member.first_name?.[0]}{member.last_name?.[0]}
          </div>
          <div>
            <Body className="font-semibold">{member.display_name}</Body>
            <Body size="sm" className="text-text-muted">{member.title} • {member.department}</Body>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={member.status === 'active' ? 'success' : 'secondary'}>
                {member.status}
              </Badge>
              <Badge variant={member.availability === 'available' ? 'success' : 'warning'}>
                {member.availability}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onView(member)}>
            <Eye className="size-4" />
          </Button>
          {canManage && (
            <>
              <Button variant="ghost" size="sm" onClick={() => onEdit(member)}>
                <Pencil className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onAssign(member)}>
                <ClipboardList className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onDelete(member)}>
                <Trash2 className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  </div>
);

export const VirtualizedCrewList: React.FC<VirtualizedCrewListProps> = ({
  crew,
  onView,
  onEdit,
  onAssign,
  onDelete,
  canManage,
}) => {
  const itemHeight = 100; // Height of each crew item card
  const containerHeight = Math.min(crew.length * itemHeight, 600); // Max height of 600px

  if (crew.length === 0) {
    return (
      <div className="text-center py-8">
        <Body className="text-text-muted">No crew members found</Body>
      </div>
    );
  }

  return (
    <List
      height={containerHeight}
      itemCount={crew.length}
      itemSize={itemHeight}
      width="100%"
    >
      {({ index, style }) => (
        <CrewListItem
          member={crew[index]}
          style={style}
          onView={onView}
          onEdit={onEdit}
          onAssign={onAssign}
          onDelete={onDelete}
          canManage={canManage}
        />
      )}
    </List>
  );
};
