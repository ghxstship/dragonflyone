'use client';

import { useState } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, H2, Body, Stack, Button, Checkbox, Label } from '@ghxstship/ui';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  availability: string;
}

interface CrewAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  availableCrew: CrewMember[];
  onAssign: (crewIds: string[]) => Promise<void>;
}

export function CrewAssignmentModal({
  isOpen,
  onClose,
  projectId,
  availableCrew,
  onAssign,
}: CrewAssignmentModalProps) {
  const [selectedCrew, setSelectedCrew] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleToggleCrew = (crewId: string) => {
    setSelectedCrew(prev =>
      prev.includes(crewId)
        ? prev.filter(id => id !== crewId)
        : [...prev, crewId]
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onAssign(selectedCrew);
      onClose();
      setSelectedCrew([]);
    } catch (error) {
      console.error('Failed to assign crew:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose}>
      <ModalHeader>
        <H2 className="uppercase">Assign Crew to Project</H2>
        <Body className="text-sm text-grey-600">Project ID: {projectId}</Body>
      </ModalHeader>

      <ModalBody>
        <Stack gap={2} className="max-h-96 overflow-y-auto">
          {availableCrew.map(crew => (
            <Label
              key={crew.id}
              className="flex cursor-pointer items-center justify-between border-2 border-grey-300 p-4 hover:border-black transition-colors"
            >
              <Stack gap={1}>
                <Body className="font-bold">{crew.name}</Body>
                <Body className="text-sm text-grey-600">{crew.role}</Body>
              </Stack>
              <Checkbox
                checked={selectedCrew.includes(crew.id)}
                onChange={() => handleToggleCrew(crew.id)}
              />
            </Label>
          ))}
        </Stack>
      </ModalBody>

      <ModalFooter>
        <Stack direction="horizontal" gap={4}>
          <Button
            variant="solid"
            onClick={handleSubmit}
            disabled={selectedCrew.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Assigning...' : `Assign ${selectedCrew.length} Crew Member${selectedCrew.length !== 1 ? 's' : ''}`}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </Stack>
      </ModalFooter>
    </Modal>
  );
}
