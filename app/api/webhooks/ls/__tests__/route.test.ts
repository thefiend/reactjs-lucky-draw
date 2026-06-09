/**
 * @jest-environment node
 */

// Use a shared container object so the jest.mock factory can reference it
// without a temporal dead zone (objects are hoisted as references).
const mocks = {
  update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }),
};

jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnValue({ update: (...args: unknown[]) => mocks.update(...args) }),
  },
}));

// Bypass signature verification in tests
jest.mock('crypto', () => ({
  ...jest.requireActual('crypto'),
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('valid-sig'),
  }),
}));

import { POST } from '@/app/api/webhooks/ls/route';

// Alias to match test assertions from the spec
const mockUpdate = mocks.update;

const makeRequest = (body: object, sig = 'valid-sig') =>
  new Request('http://localhost/api/webhooks/ls', {
    method: 'POST',
    headers: { 'x-signature': sig },
    body: JSON.stringify(body),
  });

describe('POST /api/webhooks/ls', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mocks.update.mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) });
  });
  beforeAll(() => {
    process.env.LEMONSQUEEZY_WEBHOOK_SECRET = 'test_secret';
  });

  it('sets plan to pro on subscription_created for Pro product', async () => {
    const req = makeRequest({
      meta: { event_name: 'subscription_created' },
      data: {
        id: 'sub_123',
        attributes: {
          product_name: 'Pro Plan',
          trial_ends_at: '2026-06-16T00:00:00Z',
          custom_data: { clerk_user_id: 'user_abc' },
        },
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'pro' })
    );
  });

  it('sets plan to business on subscription_created for Business product', async () => {
    const req = makeRequest({
      meta: { event_name: 'subscription_created' },
      data: {
        id: 'sub_456',
        attributes: {
          product_name: 'Business Plan',
          trial_ends_at: null,
          custom_data: { clerk_user_id: 'user_xyz' },
        },
      },
    });
    const res = await POST(req);
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ plan: 'business' })
    );
  });

  it('resets plan to free on subscription_cancelled', async () => {
    const req = makeRequest({
      meta: { event_name: 'subscription_cancelled' },
      data: {
        attributes: {
          custom_data: { clerk_user_id: 'user_abc' },
        },
      },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    expect(mockUpdate).toHaveBeenCalledWith({ plan: 'free' });
  });
});
