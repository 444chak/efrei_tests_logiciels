import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "@/app/api/reservations/[id]/route";
import { NextRequest } from "next/server";

// Re-using the mock setup principle (in a real project, put this in a helper)
const mockGetUser = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: mockSingle,
        }),
      }),
    }),
  })),
}));

describe("Security: DELETE /api/reservations/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 401 Unauthorized if user is not logged in", async () => {
    // Mock no user
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const req = new NextRequest("http://localhost/api/reservations/123");
    const params = Promise.resolve({ id: "123" });
    const response = await DELETE(req, { params });

    expect(response.status).toBe(401);
  });

  it("should return 403 Forbidden if user tries to delete someone else's reservation (IDOR)", async () => {
    // Mock user A
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-A" } } });

    // Mock reservation belongs to user B
    mockSingle.mockResolvedValue({
      data: { id_user: "user-B" },
      error: null,
    });

    const req = new NextRequest("http://localhost/api/reservations/123");
    const params = Promise.resolve({ id: "123" });
    const response = await DELETE(req, { params });

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("Forbidden");
  });
});
