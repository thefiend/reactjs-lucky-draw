/**
 * @jest-environment node
 */

jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn().mockResolvedValue({ userId: 'user_abc' }),
}));

// Mocks are defined inside the factory and exposed on the mock module
// so tests can access and override them via the imported mock object.
jest.mock('@/lib/supabase-admin', () => {
  const mockSingle = jest.fn().mockResolvedValue({ data: { plan: 'pro' } });
  const mockLimit = jest.fn().mockResolvedValue({
    data: [{ title: 'Test Draw', winners: ['Alice'], entries: ['Alice', 'Bob'], drawn_at: '2026-06-09T10:00:00Z' }],
  });

  return {
    supabaseAdmin: {
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: mockSingle,
            order: jest.fn().mockReturnValue({ limit: mockLimit }),
          }),
        }),
      }),
    },
    __mockSingle: mockSingle,
    __mockLimit: mockLimit,
  };
});

import { GET } from '@/app/api/export/route';
import { __mockSingle as mockSingle } from '@/lib/supabase-admin';

describe('GET /api/export', () => {
  it('returns 403 for free plan users', async () => {
    (mockSingle as jest.Mock).mockResolvedValueOnce({ data: { plan: 'free' } });
    const req = new Request('http://localhost/api/export?format=csv');
    const res = await GET(req);
    expect(res.status).toBe(403);
  });

  it('returns CSV with correct content-type for pro user', async () => {
    const req = new Request('http://localhost/api/export?format=csv');
    const res = await GET(req);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/csv');
  });
});
