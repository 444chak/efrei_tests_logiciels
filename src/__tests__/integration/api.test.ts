import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET as getRooms } from "@/app/api/rooms/route";
import { DELETE as deleteReservation } from "@/app/api/reservations/[id]/route";
import { POST as createReservation } from "@/app/api/rooms/reservations/[id]/route";
import { NextRequest, NextResponse } from "next/server";

// Mock Supabase
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};

// Mock createClient
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

// Mock NextRequest and NextResponse
// We don't need to mock NextResponse if we return it directly, but we might want to inspect it.
// Actually, the handlers return NextResponse objects, which we can inspect.

describe("API Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/rooms", () => {
    it("should return a list of rooms (200)", async () => {
      const mockRooms = [{ id: 1, name: "Room A", capacite: 10 }];
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockResolvedValue({ data: mockRooms, error: null }),
      });

      const req = new NextRequest("http://localhost/api/rooms");
      const res = await getRooms(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual(mockRooms);
    });
  });

  describe("DELETE /api/reservations/[id]", () => {
    it("should successfully delete a reservation (200)", async () => {
      // Mock user
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });

      // Mock reservation fetch (ownership check)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: { id_user: "user-123" }, error: null })
          })
        })
      })
        // Mock delete
        .mockReturnValueOnce({
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          })
        });

      const req = new NextRequest("http://localhost/api/reservations/1", { method: "DELETE" });
      const params = Promise.resolve({ id: "1" });
      const res = await deleteReservation(req, { params });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json).toEqual({ success: true });
    });

    it("should fail if reservation not found (404)", async () => {
      // Mock user
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });

      // Mock reservation fetch (not found)
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: null }) // Not found
          })
        })
      });

      const req = new NextRequest("http://localhost/api/reservations/999", { method: "DELETE" });
      const params = Promise.resolve({ id: "999" });
      const res = await deleteReservation(req, { params });

      expect(res.status).toBe(404);
    });
  });

  describe("POST /api/rooms/reservations/[id]", () => {
    it("should create a reservation successfully (201)", async () => {
      // Mock user
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });

      // Mock overlap check (empty)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              gt: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          })
        })
      })
        // Mock insert
        .mockReturnValueOnce({
          insert: vi.fn().mockResolvedValue({ error: null })
        });

      const body = {
        date: "2026-01-20",
        time: "10:00",
        duration: 60
      };

      const req = new NextRequest("http://localhost/api/rooms/reservations/1", {
        method: "POST",
        body: JSON.stringify(body)
      });
      const params = Promise.resolve({ id: "1" });
      const res = await createReservation(req, { params });

      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json).toEqual({ success: true });
    });

    it("should reject if room is occupied (409)", async () => {
      // Mock user
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: "user-123" } } });

      // Mock overlap check (found existing)
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            lt: vi.fn().mockReturnValue({
              gt: vi.fn().mockResolvedValue({ data: [{ id: 9 }], error: null })
            })
          })
        })
      });

      const body = {
        date: "2026-01-20",
        time: "10:00",
        duration: 60
      };

      const req = new NextRequest("http://localhost/api/rooms/reservations/1", {
        method: "POST",
        body: JSON.stringify(body)
      });
      const params = Promise.resolve({ id: "1" });
      const res = await createReservation(req, { params });

      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.error).toBeDefined();
    });
  });
});
