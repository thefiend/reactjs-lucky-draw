/**
 * @jest-environment node
 */

jest.mock('@/lib/supabase-admin', () => ({
  supabaseAdmin: {
    from: jest.fn().mockReturnValue({
      upsert: jest.fn().mockResolvedValue({ error: null }),
    }),
  },
}));

// Mock svix header verification
jest.mock('svix', () => ({
  Webhook: jest.fn().mockImplementation(() => ({
    verify: jest.fn().mockReturnValue({
      type: 'user.created',
      data: {
        id: 'user_abc123',
        email_addresses: [{ email_address: 'test@example.com' }],
      },
    }),
  })),
}));

jest.mock('next/headers', () => ({
  headers: jest.fn().mockResolvedValue({ get: jest.fn().mockReturnValue(null) }),
}));

import { POST } from '@/app/api/webhooks/clerk/route';

describe('POST /api/webhooks/clerk', () => {
  beforeAll(() => {
    process.env.CLERK_WEBHOOK_SECRET = 'test_secret';
  });

  it('returns 400 when svix headers missing', async () => {
    const req = new Request('http://localhost/api/webhooks/clerk', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});
