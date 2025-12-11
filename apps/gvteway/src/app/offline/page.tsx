'use client';

import {
  SectionHeader,
  Card,
  CardBody,
  Stack,
  Button,
  Body,
  H3,
} from '@ghxstship/ui';
import { WifiOff, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { GvtewayAppLayout } from '../../components/app-layout';

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <GvtewayAppLayout>
      <Stack gap={8} className="min-h-[60vh] items-center justify-center">
        <Card variant="elevated" inverted className="max-w-md text-center">
          <CardBody>
            <Stack gap={6} className="items-center">
              <div className="p-4 rounded-full bg-grey-800">
                <WifiOff size={48} className="text-grey-400" />
              </div>
              
              <Stack gap={2}>
                <H3 className="text-white">You're Offline</H3>
                <Body className="text-grey-400">
                  It looks like you've lost your internet connection. Some features may be unavailable until you're back online.
                </Body>
              </Stack>

              <Stack gap={3} className="w-full">
                <Button variant="solid" onClick={handleRetry} className="w-full">
                  <RefreshCw size={16} className="mr-2" />
                  Try Again
                </Button>
                <Link href="/" className="w-full">
                  <Button variant="outline" className="w-full">
                    <Home size={16} className="mr-2" />
                    Go Home
                  </Button>
                </Link>
              </Stack>

              <Body className="text-grey-500 text-sm">
                Your saved tickets and recent activity are still available offline.
              </Body>
            </Stack>
          </CardBody>
        </Card>
      </Stack>
    </GvtewayAppLayout>
  );
}
