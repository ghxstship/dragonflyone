import { describe, it, expect } from 'vitest';
import {
  eventOpsKeys,
  type SettlementData,
  type TicketTier,
  type CheckInStats,
  type WillCallTicket,
  type RefundRequest,
  type Credential,
  type ScanStats,
} from '../useEventOperations';

describe('useEventOperations', () => {
  describe('eventOpsKeys', () => {
    it('should generate correct settlement query key', () => {
      const key = eventOpsKeys.settlement('event-123');
      expect(key).toEqual(['event-ops', 'settlement', 'event-123']);
    });

    it('should generate correct box-office query key', () => {
      const key = eventOpsKeys.boxOffice('event-456');
      expect(key).toEqual(['event-ops', 'box-office', 'event-456']);
    });

    it('should generate correct check-in query key', () => {
      const key = eventOpsKeys.checkIn('event-789');
      expect(key).toEqual(['event-ops', 'check-in', 'event-789']);
    });

    it('should generate correct will-call query key', () => {
      const key = eventOpsKeys.willCall('event-abc');
      expect(key).toEqual(['event-ops', 'will-call', 'event-abc']);
    });

    it('should generate correct scan query key', () => {
      const key = eventOpsKeys.scan('event-def');
      expect(key).toEqual(['event-ops', 'scan', 'event-def']);
    });

    it('should generate correct refunds query key', () => {
      const key = eventOpsKeys.refunds('event-ghi');
      expect(key).toEqual(['event-ops', 'refunds', 'event-ghi']);
    });

    it('should generate correct credentials query key', () => {
      const key = eventOpsKeys.credentials('event-jkl');
      expect(key).toEqual(['event-ops', 'credentials', 'event-jkl']);
    });
  });

  describe('SettlementData interface', () => {
    it('should have correct structure', () => {
      const settlement: SettlementData = {
        grossRevenue: 100000,
        ticketFees: 5000,
        refunds: 2000,
        netTicketRevenue: 93000,
        venueCost: 20000,
        productionCost: 15000,
        talentCost: 30000,
        marketingCost: 5000,
        staffingCost: 3000,
        miscCost: 2000,
        totalCosts: 75000,
        netProfit: 18000,
        profitMargin: 19.4,
      };

      expect(settlement.grossRevenue).toBe(100000);
      expect(settlement.netProfit).toBe(18000);
      expect(settlement.profitMargin).toBeCloseTo(19.4);
    });

    it('should calculate profit margin correctly', () => {
      const settlement: SettlementData = {
        grossRevenue: 50000,
        ticketFees: 2500,
        refunds: 1000,
        netTicketRevenue: 46500,
        venueCost: 10000,
        productionCost: 8000,
        talentCost: 15000,
        marketingCost: 3000,
        staffingCost: 2000,
        miscCost: 1000,
        totalCosts: 39000,
        netProfit: 7500,
        profitMargin: 16.1,
      };

      const calculatedMargin = (settlement.netProfit / settlement.netTicketRevenue) * 100;
      expect(calculatedMargin).toBeCloseTo(16.1, 0);
    });
  });

  describe('TicketTier interface', () => {
    it('should have correct structure', () => {
      const tier: TicketTier = {
        id: 'tier-1',
        name: 'General Admission',
        price: 75,
        capacity: 500,
        sold: 400,
        available: 100,
        revenue: 30000,
      };

      expect(tier.id).toBe('tier-1');
      expect(tier.name).toBe('General Admission');
      expect(tier.sold + tier.available).toBe(tier.capacity);
      expect(tier.revenue).toBe(tier.sold * tier.price);
    });

    it('should calculate revenue correctly', () => {
      const tier: TicketTier = {
        id: 'tier-2',
        name: 'VIP',
        price: 150,
        capacity: 100,
        sold: 80,
        available: 20,
        revenue: 12000,
      };

      expect(tier.revenue).toBe(tier.sold * tier.price);
    });
  });

  describe('CheckInStats interface', () => {
    it('should have correct structure', () => {
      const stats: CheckInStats = {
        totalCapacity: 1000,
        checkedIn: 750,
        pending: 230,
        denied: 20,
      };

      expect(stats.totalCapacity).toBe(1000);
      expect(stats.checkedIn).toBe(750);
      expect(stats.pending).toBe(230);
      expect(stats.denied).toBe(20);
    });

    it('should track check-in progress', () => {
      const stats: CheckInStats = {
        totalCapacity: 500,
        checkedIn: 300,
        pending: 180,
        denied: 20,
      };

      const checkInPercentage = (stats.checkedIn / stats.totalCapacity) * 100;
      expect(checkInPercentage).toBe(60);
    });
  });

  describe('WillCallTicket interface', () => {
    it('should have correct structure', () => {
      const ticket: WillCallTicket = {
        id: 'wc-1',
        orderId: 'order-123',
        name: 'John Doe',
        email: 'john@example.com',
        ticketCount: 2,
        ticketType: 'GA',
        status: 'pending',
      };

      expect(ticket.id).toBe('wc-1');
      expect(ticket.status).toBe('pending');
      expect(ticket.ticketCount).toBe(2);
      expect(ticket.ticketType).toBe('GA');
    });

    it('should support different statuses', () => {
      const pendingTicket: WillCallTicket = {
        id: 'wc-2',
        orderId: 'order-456',
        name: 'Jane Smith',
        email: 'jane@example.com',
        ticketCount: 1,
        ticketType: 'VIP',
        status: 'pending',
      };

      const pickedUpTicket: WillCallTicket = {
        id: 'wc-3',
        orderId: 'order-789',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        ticketCount: 4,
        ticketType: 'Premium',
        status: 'picked-up',
        pickupTime: '18:30',
      };

      expect(pendingTicket.status).toBe('pending');
      expect(pickedUpTicket.status).toBe('picked-up');
      expect(pickedUpTicket.pickupTime).toBe('18:30');
    });
  });

  describe('RefundRequest interface', () => {
    it('should have correct structure', () => {
      const refund: RefundRequest = {
        id: 'ref-1',
        orderId: 'order-123',
        customerName: 'John Doe',
        amount: 150,
        reason: 'Event cancelled',
        status: 'pending',
        requestedAt: '2024-12-10T10:00:00Z',
      };

      expect(refund.id).toBe('ref-1');
      expect(refund.amount).toBe(150);
      expect(refund.status).toBe('pending');
    });

    it('should support different statuses', () => {
      const statuses: RefundRequest['status'][] = ['pending', 'approved', 'rejected', 'processed'];
      
      statuses.forEach(status => {
        const refund: RefundRequest = {
          id: `ref-${status}`,
          orderId: 'order-123',
          customerName: 'Test User',
          amount: 100,
          reason: 'Test reason',
          status,
          requestedAt: '2024-12-10T10:00:00Z',
        };
        expect(refund.status).toBe(status);
      });
    });
  });

  describe('Credential interface', () => {
    it('should have correct structure', () => {
      const credential: Credential = {
        id: 'cred-1',
        name: 'John Doe',
        role: 'Production Manager',
        type: 'staff',
        status: 'active',
        issuedAt: '2024-11-15',
      };

      expect(credential.id).toBe('cred-1');
      expect(credential.type).toBe('staff');
      expect(credential.role).toBe('Production Manager');
    });

    it('should support different types', () => {
      const types: Credential['type'][] = ['all-access', 'backstage', 'vip', 'media', 'staff'];
      
      types.forEach(type => {
        const credential: Credential = {
          id: `cred-${type}`,
          name: 'Test Person',
          role: 'Test Role',
          type,
          status: 'active',
          issuedAt: '2024-11-15',
        };
        expect(credential.type).toBe(type);
      });
    });

    it('should support different statuses', () => {
      const statuses: Credential['status'][] = ['active', 'checked-in', 'expired'];
      
      statuses.forEach(status => {
        const credential: Credential = {
          id: `cred-${status}`,
          name: 'Test Person',
          role: 'Test Role',
          type: 'staff',
          status,
          issuedAt: '2024-11-15',
        };
        expect(credential.status).toBe(status);
      });
    });

    it('should support optional lastScan field', () => {
      const credentialWithScan: Credential = {
        id: 'cred-scan',
        name: 'John Doe',
        role: 'Security',
        type: 'staff',
        status: 'checked-in',
        issuedAt: '2024-11-15',
        lastScan: '18:30',
      };

      expect(credentialWithScan.lastScan).toBe('18:30');
    });
  });

  describe('ScanStats interface', () => {
    it('should have correct structure', () => {
      const stats: ScanStats = {
        valid: 480,
        invalid: 15,
        total: 495,
      };

      expect(stats.valid).toBe(480);
      expect(stats.invalid).toBe(15);
      expect(stats.total).toBe(495);
    });

    it('should track scan accuracy', () => {
      const stats: ScanStats = {
        valid: 950,
        invalid: 50,
        total: 1000,
      };

      const validRate = (stats.valid / stats.total) * 100;
      expect(validRate).toBe(95);
    });

    it('should sum valid and invalid to total', () => {
      const stats: ScanStats = {
        valid: 423,
        invalid: 12,
        total: 435,
      };

      expect(stats.valid + stats.invalid).toBe(stats.total);
    });
  });
});
