import { Suspense } from 'react';
import { Section, LoadingSpinner } from '@ghxstship/ui';
import TicketTransferContent from './transfer-content';

function TransferLoadingFallback() {
  return (
    <Section className="min-h-screen bg-white flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </Section>
  );
}

export default function TicketTransferPage() {
  return (
    <Suspense fallback={<TransferLoadingFallback />}>
      <TicketTransferContent />
    </Suspense>
  );
}
