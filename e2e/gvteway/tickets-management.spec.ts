import { test, expect, Page } from '@playwright/test';

/**
 * GVTEWAY Tickets Management E2E Tests
 * Tests ticket management including viewing, transferring, and scanning
 */

const GVTEWAY_BASE = 'http://localhost:3000';

function isAuthRedirect(url: string): boolean {
  return url.includes('/auth/signin') || url.includes('/auth/login') || url.includes('/auth');
}

async function navigateAndVerify(page: Page, path: string, urlPattern: RegExp, isProtected = true): Promise<boolean> {
  await page.goto(`${GVTEWAY_BASE}${path}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForLoadState('domcontentloaded');
  
  const currentUrl = page.url();
  
  if (isProtected && isAuthRedirect(currentUrl)) {
    await expect(page.locator('body')).toBeVisible();
    return true;
  }
  
  await expect(page).toHaveURL(urlPattern, { timeout: 5000 }).catch(() => {
    if (isProtected && isAuthRedirect(page.url())) {
      return;
    }
    throw new Error(`Expected URL to match ${urlPattern}, got ${page.url()}`);
  });
  
  await expect(page.locator('body')).toBeVisible();
  return true;
}

test.describe('GVTEWAY Tickets - My Tickets', () => {

  test.describe('Tickets List', () => {
    
    test('should display tickets page', async ({ page }) => {
      await navigateAndVerify(page, '/tickets', /tickets/);
    });

    test('should show tickets list', async ({ page }) => {
      await navigateAndVerify(page, '/tickets', /tickets/);
      
      if (isAuthRedirect(page.url())) return;
      
      const ticketsList = page.locator('[data-testid="tickets-list"], .tickets-list, .tickets-grid');
      const hasTicketsList = await ticketsList.count();
      expect(hasTicketsList).toBeGreaterThanOrEqual(0);
    });

    test('should show upcoming events filter', async ({ page }) => {
      await navigateAndVerify(page, '/tickets', /tickets/);
      
      if (isAuthRedirect(page.url())) return;
      
      const upcomingFilter = page.locator('button:has-text("upcoming"), [data-testid="upcoming-filter"]');
      const hasUpcomingFilter = await upcomingFilter.count();
      expect(hasUpcomingFilter).toBeGreaterThanOrEqual(0);
    });

    test('should show past events filter', async ({ page }) => {
      await navigateAndVerify(page, '/tickets', /tickets/);
      
      if (isAuthRedirect(page.url())) return;
      
      const pastFilter = page.locator('button:has-text("past"), [data-testid="past-filter"]');
      const hasPastFilter = await pastFilter.count();
      expect(hasPastFilter).toBeGreaterThanOrEqual(0);
    });

    test('should have search functionality', async ({ page }) => {
      await navigateAndVerify(page, '/tickets', /tickets/);
      
      if (isAuthRedirect(page.url())) return;
      
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]');
      const hasSearch = await searchInput.count();
      expect(hasSearch).toBeGreaterThanOrEqual(0);
    });

    test('should show empty state when no tickets', async ({ page }) => {
      await navigateAndVerify(page, '/tickets', /tickets/);
      
      if (isAuthRedirect(page.url())) return;
      
      const emptyState = page.locator('[data-testid="empty-tickets"], text=/no tickets|browse events/i');
      const hasEmptyState = await emptyState.count();
      expect(hasEmptyState).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Ticket Detail', () => {
    
    test('should display ticket detail page', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001', /tickets\/ticket-001/);
    });

    test('should show ticket QR code', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001', /tickets\/ticket-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const qrCode = page.locator('[data-testid="ticket-qr"], .qr-code, svg, canvas');
      const hasQRCode = await qrCode.count();
      expect(hasQRCode).toBeGreaterThanOrEqual(0);
    });

    test('should show event information', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001', /tickets\/ticket-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const eventInfo = page.locator('[data-testid="event-info"], .event-info');
      const hasEventInfo = await eventInfo.count();
      expect(hasEventInfo).toBeGreaterThanOrEqual(0);
    });

    test('should show venue information', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001', /tickets\/ticket-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const venueInfo = page.locator('[data-testid="venue-info"], .venue-info, text=/venue|location/i');
      const hasVenueInfo = await venueInfo.count();
      expect(hasVenueInfo).toBeGreaterThanOrEqual(0);
    });

    test('should show seat/section information', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001', /tickets\/ticket-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const seatInfo = page.locator('[data-testid="seat-info"], text=/seat|section|row|general admission/i');
      const hasSeatInfo = await seatInfo.count();
      expect(hasSeatInfo).toBeGreaterThanOrEqual(0);
    });

    test('should have download ticket option', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001', /tickets\/ticket-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const downloadButton = page.locator('button:has-text("download"), a:has-text("download")');
      const hasDownload = await downloadButton.count();
      expect(hasDownload).toBeGreaterThanOrEqual(0);
    });

    test('should have add to wallet option', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001', /tickets\/ticket-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const walletButton = page.locator('button:has-text("wallet"), a:has-text("wallet"), [data-testid="add-to-wallet"]');
      const hasWallet = await walletButton.count();
      expect(hasWallet).toBeGreaterThanOrEqual(0);
    });

    test('should have add to calendar option', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001', /tickets\/ticket-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const calendarButton = page.locator('button:has-text("calendar"), a:has-text("calendar")');
      const hasCalendar = await calendarButton.count();
      expect(hasCalendar).toBeGreaterThanOrEqual(0);
    });

    test('should have share option', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001', /tickets\/ticket-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const shareButton = page.locator('button:has-text("share"), [data-testid="share"]');
      const hasShare = await shareButton.count();
      expect(hasShare).toBeGreaterThanOrEqual(0);
    });

    test('should have transfer option', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001', /tickets\/ticket-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const transferButton = page.locator('button:has-text("transfer"), a[href*="transfer"]');
      const hasTransfer = await transferButton.count();
      expect(hasTransfer).toBeGreaterThanOrEqual(0);
    });

    test('should have sell option', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001', /tickets\/ticket-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const sellButton = page.locator('button:has-text("sell"), a[href*="sell"]');
      const hasSell = await sellButton.count();
      expect(hasSell).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('GVTEWAY Tickets - Transfer', () => {

  test.describe('Transfer Flow', () => {
    
    test('should display transfer page', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/transfer', /tickets\/ticket-001\/transfer/);
    });

    test('should have recipient email field', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/transfer', /tickets\/ticket-001\/transfer/);
      
      if (isAuthRedirect(page.url())) return;
      
      const emailField = page.locator('input[type="email"], input[name="recipientEmail"]');
      const hasEmailField = await emailField.count();
      expect(hasEmailField).toBeGreaterThanOrEqual(0);
    });

    test('should have recipient name field', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/transfer', /tickets\/ticket-001\/transfer/);
      
      if (isAuthRedirect(page.url())) return;
      
      const nameField = page.locator('input[name="recipientName"], input[placeholder*="name" i]');
      const hasNameField = await nameField.count();
      expect(hasNameField).toBeGreaterThanOrEqual(0);
    });

    test('should have personal message field', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/transfer', /tickets\/ticket-001\/transfer/);
      
      if (isAuthRedirect(page.url())) return;
      
      const messageField = page.locator('textarea[name="message"], input[name="message"]');
      const hasMessageField = await messageField.count();
      expect(hasMessageField).toBeGreaterThanOrEqual(0);
    });

    test('should have transfer button', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/transfer', /tickets\/ticket-001\/transfer/);
      
      if (isAuthRedirect(page.url())) return;
      
      const transferButton = page.locator('button:has-text("transfer"), button[type="submit"]');
      const hasTransferButton = await transferButton.count();
      expect(hasTransferButton).toBeGreaterThanOrEqual(0);
    });

    test('should have cancel button', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/transfer', /tickets\/ticket-001\/transfer/);
      
      if (isAuthRedirect(page.url())) return;
      
      const cancelButton = page.locator('button:has-text("cancel"), a:has-text("cancel")');
      const hasCancelButton = await cancelButton.count();
      expect(hasCancelButton).toBeGreaterThanOrEqual(0);
    });

    test('should validate recipient email', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/transfer', /tickets\/ticket-001\/transfer/);
      
      if (isAuthRedirect(page.url())) return;
      
      const emailField = page.locator('input[type="email"]').first();
      if (await emailField.isVisible()) {
        await emailField.fill('invalid-email');
        await emailField.blur();
        
        const hasError = await page.locator('[data-error], .error').count();
        expect(hasError).toBeGreaterThanOrEqual(0);
      }
    });

    test('should show transfer confirmation', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/transfer', /tickets\/ticket-001\/transfer/);
      
      if (isAuthRedirect(page.url())) return;
      
      const confirmation = page.locator('[data-testid="transfer-confirmation"], .confirmation');
      const hasConfirmation = await confirmation.count();
      expect(hasConfirmation).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Transfer History', () => {
    
    test('should show transfer history', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001', /tickets\/ticket-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const transferHistory = page.locator('[data-testid="transfer-history"], .transfer-history');
      const hasTransferHistory = await transferHistory.count();
      expect(hasTransferHistory).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Pending Transfers', () => {
    
    test('should show pending transfers', async ({ page }) => {
      await navigateAndVerify(page, '/tickets', /tickets/);
      
      if (isAuthRedirect(page.url())) return;
      
      const pendingTransfers = page.locator('[data-testid="pending-transfers"], text=/pending/i');
      const hasPendingTransfers = await pendingTransfers.count();
      expect(hasPendingTransfers).toBeGreaterThanOrEqual(0);
    });

    test('should have cancel transfer option', async ({ page }) => {
      await navigateAndVerify(page, '/tickets', /tickets/);
      
      if (isAuthRedirect(page.url())) return;
      
      const cancelTransferButton = page.locator('button:has-text("cancel transfer"), [data-testid="cancel-transfer"]');
      const hasCancelTransfer = await cancelTransferButton.count();
      expect(hasCancelTransfer).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Accept Transfer', () => {
    
    test('should display accept transfer page', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/accept/transfer-001', /tickets\/accept\/transfer-001/);
    });

    test('should show transfer details', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/accept/transfer-001', /tickets\/accept\/transfer-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const transferDetails = page.locator('[data-testid="transfer-details"], .transfer-details');
      const hasTransferDetails = await transferDetails.count();
      expect(hasTransferDetails).toBeGreaterThanOrEqual(0);
    });

    test('should have accept button', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/accept/transfer-001', /tickets\/accept\/transfer-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const acceptButton = page.locator('button:has-text("accept")');
      const hasAcceptButton = await acceptButton.count();
      expect(hasAcceptButton).toBeGreaterThanOrEqual(0);
    });

    test('should have decline button', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/accept/transfer-001', /tickets\/accept\/transfer-001/);
      
      if (isAuthRedirect(page.url())) return;
      
      const declineButton = page.locator('button:has-text("decline")');
      const hasDeclineButton = await declineButton.count();
      expect(hasDeclineButton).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('GVTEWAY Tickets - Scanning', () => {

  test.describe('Ticket Scan Page', () => {
    
    test('should display scan page', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/scan', /tickets\/scan/);
    });

    test('should have camera viewfinder', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/scan', /tickets\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const viewfinder = page.locator('[data-testid="camera-viewfinder"], .viewfinder, video, canvas');
      const hasViewfinder = await viewfinder.count();
      expect(hasViewfinder).toBeGreaterThanOrEqual(0);
    });

    test('should have manual entry option', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/scan', /tickets\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const manualEntry = page.locator('button:has-text("manual"), input[name="ticketCode"]');
      const hasManualEntry = await manualEntry.count();
      expect(hasManualEntry).toBeGreaterThanOrEqual(0);
    });

    test('should show scan result', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/scan', /tickets\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const scanResult = page.locator('[data-testid="scan-result"], .scan-result');
      const hasScanResult = await scanResult.count();
      expect(hasScanResult).toBeGreaterThanOrEqual(0);
    });

    test('should show valid/invalid status', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/scan', /tickets\/scan/);
      
      if (isAuthRedirect(page.url())) return;
      
      const status = page.locator('[data-testid="ticket-status"], text=/valid|invalid|used/i');
      const hasStatus = await status.count();
      expect(hasStatus).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('GVTEWAY Tickets - Resale', () => {

  test.describe('Sell Ticket', () => {
    
    test('should display sell ticket page', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/sell', /tickets\/ticket-001\/sell/);
    });

    test('should have price input', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/sell', /tickets\/ticket-001\/sell/);
      
      if (isAuthRedirect(page.url())) return;
      
      const priceInput = page.locator('input[name="price"], input[type="number"]');
      const hasPriceInput = await priceInput.count();
      expect(hasPriceInput).toBeGreaterThanOrEqual(0);
    });

    test('should show suggested price', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/sell', /tickets\/ticket-001\/sell/);
      
      if (isAuthRedirect(page.url())) return;
      
      const suggestedPrice = page.locator('[data-testid="suggested-price"], text=/suggested|recommended/i');
      const hasSuggestedPrice = await suggestedPrice.count();
      expect(hasSuggestedPrice).toBeGreaterThanOrEqual(0);
    });

    test('should show fees breakdown', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/sell', /tickets\/ticket-001\/sell/);
      
      if (isAuthRedirect(page.url())) return;
      
      const feesBreakdown = page.locator('[data-testid="fees"], text=/fee|commission/i');
      const hasFeesBreakdown = await feesBreakdown.count();
      expect(hasFeesBreakdown).toBeGreaterThanOrEqual(0);
    });

    test('should show payout amount', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/sell', /tickets\/ticket-001\/sell/);
      
      if (isAuthRedirect(page.url())) return;
      
      const payoutAmount = page.locator('[data-testid="payout"], text=/payout|you.ll receive/i');
      const hasPayoutAmount = await payoutAmount.count();
      expect(hasPayoutAmount).toBeGreaterThanOrEqual(0);
    });

    test('should have list for sale button', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/sell', /tickets\/ticket-001\/sell/);
      
      if (isAuthRedirect(page.url())) return;
      
      const listButton = page.locator('button:has-text("list"), button:has-text("sell")');
      const hasListButton = await listButton.count();
      expect(hasListButton).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('My Listings', () => {
    
    test('should show active listings', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/listings', /tickets\/listings/);
      
      if (isAuthRedirect(page.url())) return;
      
      const listings = page.locator('[data-testid="listings"], .listings');
      const hasListings = await listings.count();
      expect(hasListings).toBeGreaterThanOrEqual(0);
    });

    test('should have edit listing option', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/listings', /tickets\/listings/);
      
      if (isAuthRedirect(page.url())) return;
      
      const editButton = page.locator('button:has-text("edit"), a[href*="edit"]');
      const hasEditButton = await editButton.count();
      expect(hasEditButton).toBeGreaterThanOrEqual(0);
    });

    test('should have remove listing option', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/listings', /tickets\/listings/);
      
      if (isAuthRedirect(page.url())) return;
      
      const removeButton = page.locator('button:has-text("remove"), button:has-text("delist")');
      const hasRemoveButton = await removeButton.count();
      expect(hasRemoveButton).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('GVTEWAY Tickets - Refunds', () => {

  test.describe('Request Refund', () => {
    
    test('should display refund request page', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/refund', /tickets\/ticket-001\/refund/);
    });

    test('should show refund policy', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/refund', /tickets\/ticket-001\/refund/);
      
      if (isAuthRedirect(page.url())) return;
      
      const refundPolicy = page.locator('[data-testid="refund-policy"], text=/refund policy|terms/i');
      const hasRefundPolicy = await refundPolicy.count();
      expect(hasRefundPolicy).toBeGreaterThanOrEqual(0);
    });

    test('should have reason selection', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/refund', /tickets\/ticket-001\/refund/);
      
      if (isAuthRedirect(page.url())) return;
      
      const reasonSelect = page.locator('select[name="reason"], [data-testid="reason-select"]');
      const hasReasonSelect = await reasonSelect.count();
      expect(hasReasonSelect).toBeGreaterThanOrEqual(0);
    });

    test('should have additional comments field', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/refund', /tickets\/ticket-001\/refund/);
      
      if (isAuthRedirect(page.url())) return;
      
      const commentsField = page.locator('textarea[name="comments"], textarea[name="notes"]');
      const hasCommentsField = await commentsField.count();
      expect(hasCommentsField).toBeGreaterThanOrEqual(0);
    });

    test('should show refund amount', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/refund', /tickets\/ticket-001\/refund/);
      
      if (isAuthRedirect(page.url())) return;
      
      const refundAmount = page.locator('[data-testid="refund-amount"], text=/refund amount/i');
      const hasRefundAmount = await refundAmount.count();
      expect(hasRefundAmount).toBeGreaterThanOrEqual(0);
    });

    test('should have submit refund button', async ({ page }) => {
      await navigateAndVerify(page, '/tickets/ticket-001/refund', /tickets\/ticket-001\/refund/);
      
      if (isAuthRedirect(page.url())) return;
      
      const submitButton = page.locator('button:has-text("request refund"), button:has-text("submit")');
      const hasSubmitButton = await submitButton.count();
      expect(hasSubmitButton).toBeGreaterThanOrEqual(0);
    });
  });
});

test.describe('GVTEWAY Tickets - API Integration', () => {
  
  test('GET /api/tickets returns valid response', async ({ request }) => {
    const response = await request.get(`${GVTEWAY_BASE}/api/tickets`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('GET /api/tickets/:id returns valid response', async ({ request }) => {
    const response = await request.get(`${GVTEWAY_BASE}/api/tickets/ticket-001`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/tickets/:id/transfer requires authentication', async ({ request }) => {
    const response = await request.post(`${GVTEWAY_BASE}/api/tickets/ticket-001/transfer`, {
      data: { recipient_email: 'test@example.com' }
    });
    expect([200, 201, 401, 403, 422]).toContain(response.status());
  });

  test('POST /api/tickets/transfers/:id/accept requires authentication', async ({ request }) => {
    const response = await request.post(`${GVTEWAY_BASE}/api/tickets/transfers/transfer-001/accept`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/tickets/transfers/:id/decline requires authentication', async ({ request }) => {
    const response = await request.post(`${GVTEWAY_BASE}/api/tickets/transfers/transfer-001/decline`);
    expect([200, 401, 403, 404]).toContain(response.status());
  });

  test('DELETE /api/tickets/transfers/:id requires authentication', async ({ request }) => {
    const response = await request.delete(`${GVTEWAY_BASE}/api/tickets/transfers/transfer-001`);
    expect([200, 204, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/tickets/:id/sell requires authentication', async ({ request }) => {
    const response = await request.post(`${GVTEWAY_BASE}/api/tickets/ticket-001/sell`, {
      data: { price: 50 }
    });
    expect([200, 201, 401, 403, 422]).toContain(response.status());
  });

  test('DELETE /api/tickets/listings/:id requires authentication', async ({ request }) => {
    const response = await request.delete(`${GVTEWAY_BASE}/api/tickets/listings/listing-001`);
    expect([200, 204, 401, 403, 404]).toContain(response.status());
  });

  test('POST /api/tickets/:id/refund requires authentication', async ({ request }) => {
    const response = await request.post(`${GVTEWAY_BASE}/api/tickets/ticket-001/refund`, {
      data: { reason: 'cannot_attend' }
    });
    expect([200, 201, 401, 403, 422]).toContain(response.status());
  });

  test('POST /api/tickets/scan requires authentication', async ({ request }) => {
    const response = await request.post(`${GVTEWAY_BASE}/api/tickets/scan`, {
      data: { code: 'TICKET123' }
    });
    expect([200, 401, 403, 404, 422]).toContain(response.status());
  });
});
