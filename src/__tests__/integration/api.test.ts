import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "@/app/api/reservations/[id]/route";
import { NextRequest } from "next/server";

// Mock Supabase
const mockDelete = vi.fn();
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockFrom = vi.fn();
const mockAuthGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: mockAuthGetUser,
    },
    from: mockFrom,
  })),
}));

describe("Integration: DELETE /api/reservations/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Chain setup
    mockFrom.mockReturnValue({
      select: mockSelect,
      delete: () => ({ eq: mockDelete }), // simplified for the delete call
    });

    // Select chain for ownership check
    mockSelect.mockReturnValue({
      eq: mockEq,
    });

    mockEq.mockReturnValue({
      single: vi.fn(),
    });
  });

  it("should successfully delete a reservation when user is owner", async () => {
    // 1. Setup Mock User
    mockAuthGetUser.mockResolvedValue({
      data: { user: { id: "user-123" } },
      error: null,
    });

    // 2. Setup Mock Reservation (Ownership check)
    const mockSingle = vi.fn().mockResolvedValue({
      data: { id_user: "user-123" },
      error: null,
    });
    mockEq.mockReturnValue({ single: mockSingle });

    // 3. Setup Delete Success
    mockDelete.mockResolvedValue({ error: null });

    // 4. Call API
    const req = new NextRequest("http://localhost/api/reservations/res-999");
    const params = Promise.resolve({ id: "res-999" });
    const response = await DELETE(req, { params });

    // 5. Assertions
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);

    // Verify flow
    expect(mockFrom).toHaveBeenCalledWith("reservations");
    expect(mockDelete).toHaveBeenCalledWith("id", "res-999");
  });
});
