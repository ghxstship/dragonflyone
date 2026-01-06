'use client';

import { useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Body, Card, CardBody, Stack, Badge, Box, Grid, List, ListItem } from '@ghxstship/ui';
import { Command, Keyboard, Zap, Navigation } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <Modal open={isOpen} onClose={onClose} size="lg">
      <ModalHeader>
        <Box className="flex items-center gap-3">
          <Keyboard className="size-6 text-primary" />
          <Box>
            <Body className="font-weight-bold">Keyboard Shortcuts</Body>
            <Body size="sm" className="text-text-muted">Navigate COMPVSS faster with these shortcuts</Body>
          </Box>
        </Box>
      </ModalHeader>

      <ModalBody>
        <Stack gap={6}>
          {/* Navigation Shortcuts */}
          <Card>
            <CardBody>
              <Box className="flex items-center gap-2 mb-4">
                <Navigation className="size-5 text-primary" />
                <Body className="font-weight-semibold">Navigation</Body>
              </Box>
              <Grid cols={1} className="md:grid-cols-2 gap-3">
                <Box className="flex items-center justify-between py-2">
                  <Body size="sm">Dashboard</Body>
                  <Badge variant="outline" className="font-mono">⌘1</Badge>
                </Box>
                <Box className="flex items-center justify-between py-2">
                  <Body size="sm">Projects</Body>
                  <Badge variant="outline" className="font-mono">⌘2</Badge>
                </Box>
                <Box className="flex items-center justify-between py-2">
                  <Body size="sm">Crew</Body>
                  <Badge variant="outline" className="font-mono">⌘3</Badge>
                </Box>
                <Box className="flex items-center justify-between py-2">
                  <Body size="sm">Equipment</Body>
                  <Badge variant="outline" className="font-mono">⌘4</Badge>
                </Box>
                <Box className="flex items-center justify-between py-2">
                  <Body size="sm">Schedule</Body>
                  <Badge variant="outline" className="font-mono">⌘5</Badge>
                </Box>
              </Grid>
            </CardBody>
          </Card>

          {/* Command Palette */}
          <Card>
            <CardBody>
              <Box className="flex items-center gap-2 mb-4">
                <Command className="size-5 text-primary" />
                <Body className="font-weight-semibold">Command Palette</Body>
              </Box>
              <Box className="flex items-center justify-between py-2">
                <Body size="sm">Open command palette</Body>
                <Badge variant="outline" className="font-mono">⌘K</Badge>
              </Box>
              <Body size="sm" className="text-text-muted mt-2">
                Search and navigate to any page or action quickly
              </Body>
            </CardBody>
          </Card>

          {/* Action Shortcuts */}
          <Card>
            <CardBody>
              <Box className="flex items-center gap-2 mb-4">
                <Zap className="size-5 text-primary" />
                <Body className="font-weight-semibold">Quick Actions</Body>
              </Box>
              <Grid cols={1} className="md:grid-cols-2 gap-3">
                <Box className="flex items-center justify-between py-2">
                  <Body size="sm">New Crew Member</Body>
                  <Badge variant="outline" className="font-mono">C</Badge>
                </Box>
                <Box className="flex items-center justify-between py-2">
                  <Body size="sm">New Schedule</Body>
                  <Badge variant="outline" className="font-mono">S</Badge>
                </Box>
                <Box className="flex items-center justify-between py-2">
                  <Body size="sm">New Equipment</Body>
                  <Badge variant="outline" className="font-mono">E</Badge>
                </Box>
                <Box className="flex items-center justify-between py-2">
                  <Body size="sm">Search</Body>
                  <Badge variant="outline" className="font-mono">/</Badge>
                </Box>
              </Grid>
            </CardBody>
          </Card>

          {/* Tips */}
          <Card>
            <CardBody>
              <Body className="font-weight-semibold mb-2">💡 Pro Tips</Body>
              <List>
                <ListItem>• Use arrow keys to navigate through search results in the command palette</ListItem>
                <ListItem>• Press Enter to select an item from the command palette</ListItem>
                <ListItem>• Quick actions work from any page in the application</ListItem>
                <ListItem>• Keyboard shortcuts work on both Mac and Windows (Ctrl instead of ⌘)</ListItem>
              </List>
            </CardBody>
          </Card>
        </Stack>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
}

export default HelpModal;
