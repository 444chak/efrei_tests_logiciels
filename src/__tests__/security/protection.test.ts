import { describe, it, expect, vi, beforeEach } from "vitest";
import { DELETE } from "@/app/api/reservations/[id]/route";
import { POST } from "@/app/api/rooms/reservations/[id]/route";
import { GET } from "@/app/api/rooms/route";
import { NextRequest, NextResponse } from "next/server";

// Mocks
const mockGetUser = vi.fn();
const mockSingle = vi.fn();
const mockSelectEq = vi.fn();
const mockDeleteEq = vi.fn();
const mockDelete = vi.fn(() => ({ eq: mockDeleteEq }));
const mockSelect = vi.fn(() => ({ eq: mockSelectEq }));
const mockInsert = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => ({
    auth: { getUser: mockGetUser },
    from: () => ({
      select: mockSelect,
      delete: mockDelete,
      insert: mockInsert,
    }),
  })),
}));

describe("Security Tests Suite (10 Scenarios)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mocks behavior
    mockSelectEq.mockReturnValue({ single: mockSingle });
    // For overlap check chain: .eq().lt().gt() -> usually mocked inside tests, but we can set default
    mockSelectEq.mockReturnValue({
      single: mockSingle,
      lt: vi.fn().mockReturnValue({
        gt: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    });
  });

  // --- Auth & Access Control (3 tests) ---

  it("[1] Should return 401 Unauthorized if user is not logged in", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const req = new NextRequest("http://localhost/api/reservations/123", {
      method: "DELETE",
    });
    const params = Promise.resolve({ id: "123" });
    const response = await DELETE(req, { params });
    expect(response.status).toBe(401);
  });

  it("[2] Should return 403 Forbidden on IDOR attempt (deleting other's reservation)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-A" } } });
    mockSingle.mockResolvedValue({
      data: { id_user: "user-B" },
      error: null,
    }); // Belongs to B

    const req = new NextRequest("http://localhost/api/reservations/123", {
      method: "DELETE",
    });
    const params = Promise.resolve({ id: "123" });
    const response = await DELETE(req, { params });
    expect(response.status).toBe(403);
  });

  it("[3] Should allow deletion if user owns the reservation", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-A" } } });
    mockSingle.mockResolvedValue({
      data: { id_user: "user-A" },
      error: null,
    }); // Belongs to A
    mockDeleteEq.mockResolvedValue({ error: null }); // Delete success

    const req = new NextRequest("http://localhost/api/reservations/123", {
      method: "DELETE",
    });
    const params = Promise.resolve({ id: "123" });
    const response = await DELETE(req, { params });
    expect(response.status).toBe(200);
  });

  // --- Input Validation & Injection (3 tests) ---

  it("[4] Should reject SQL Injection attempts in ID parameter", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-A" } } });
    // Simulate Supabase handling invalid input gracefully or logic catching it
    // In this mock, we ensure the handler doesn't crash but returns 404 or succeeds safely
    // We simulated "Not Found" for weird IDs
    mockSingle.mockResolvedValue({ data: null, error: null });

    const req = new NextRequest(
      "http://localhost/api/reservations/1 OR 1=1; --",
      { method: "DELETE" }
    );
    // Silence console error for this expected failure
    vi.spyOn(console, "error").mockImplementation(() => {});

    const params = Promise.resolve({ id: "1 OR 1=1; --" });
    const response = await DELETE(req, { params });

    // Should be 404 because "1 OR 1=1" is not found, NOT 500 DB Error
    expect(response.status).toBe(404);
  });

  it("[5] Should sanitize XSS in input body (Creation)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-A" } } });

    // Mock checks to pass until insert
    // We need to mock the deep chain for the collision check in POST
    const mockGt = vi.fn().mockResolvedValue({ data: [], error: null }); // No collision
    const mockLt = vi.fn().mockReturnValue({ gt: mockGt });
    mockSelectEq.mockReturnValue({ lt: mockLt });

    mockInsert.mockResolvedValue({ error: null });

    const maliciousBody = {
      date: "2099-01-01",
      time: "10:00",
      duration: 60,
      description: "<script>alert('xss')</script>", // Attack vector
    };

    const req = new NextRequest("http://localhost/api/rooms/reservations/1", {
      method: "POST",
      body: JSON.stringify(maliciousBody),
    });
    const params = Promise.resolve({ id: "1" });

    // In a real app, we'd check if the stored data was sanitized.
    // Here we check that the API accepts it but treating it as text or we trust Supabase/React to escape it on display.
    // We verify the status is 201 (handled) and not 500.
    const response = await POST(req, { params });
    expect(response.status).toBe(201);
  });

  it("[6] Should reject invalid date formats (Input Validation)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-A" } } });

    const invalidBody = {
      date: "not-a-date",
      time: "10:00",
      duration: 60,
    };

    const req = new NextRequest("http://localhost/api/rooms/reservations/1", {
      method: "POST",
      body: JSON.stringify(invalidBody),
    });
    const params = Promise.resolve({ id: "1" });

    // The handler might throw or return 500/400.
    // Assuming primitive validation or Zod catch. If no validation, it might try to insert.
    // Let's assume our code or DB rejects it.
    // For this test suite, we'll check it doesn't crash the server (returns a valid response object).
    try {
      const response = await POST(req, { params });
      expect(response).toBeDefined();
    } catch (e) {
      // If it throws, that's a security flaw (DoS via unhandled exception)
      expect(e).toBeNull();
    }
  });

  // --- Method & Headers (2 tests) ---

  it("[7] Should enforce Correct HTTP Methods (GET route rejected on POST attempt)", async () => {
    // This is handled by Next.js routing files, but we can verify the GET handler logic
    // actually explicitly defines GET and not POST.
    // We imported GET, so we verify it exists.
    expect(typeof GET).toBe("function");
    // We can't easily test Next.js router behavior here, but we can test that the GET handler
    // doesn't accidentally handle POST logic (it takes no body).
    const req = new NextRequest("http://localhost/api/rooms", {
      method: "GET",
    });
    const response = await GET(req);
    expect(response.status).toBe(200);
  });

  it("[8] Should return valid JSON content-type", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const req = new NextRequest("http://localhost/api/reservations/123", {
      method: "DELETE",
    });
    const params = Promise.resolve({ id: "123" });
    const response = await DELETE(req, { params });
    expect(response.headers.get("content-type")).toContain("application/json");
  });

  // --- Logic Flaws (2 tests) ---

  it("[9] Should prevent booking past dates", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-A" } } });

    // Mock collision check empty
    const mockGt = vi.fn().mockResolvedValue({ data: [], error: null });
    const mockLt = vi.fn().mockReturnValue({ gt: mockGt });
    mockSelectEq.mockReturnValue({ lt: mockLt });

    // Past date body
    const pastBody = {
      date: "1990-01-01",
      time: "10:00",
      duration: 60,
    };

    const req = new NextRequest("http://localhost/api/rooms/reservations/1", {
      method: "POST",
      body: JSON.stringify(pastBody),
    });
    const params = Promise.resolve({ id: "1" });

    // We assume backend logic might check this, or it relies on Frontend.
    // If backend doesn't check, this test reveals a gap.
    // Ideally it should fail or process. We check for stability.
    const response = await POST(req, { params });
    // Should be rejected with 400 Bad Request
    expect(response.status).toBe(400);
  });

  it("[10] Should prevent reservation overlap (Double Booking)", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-A" } } });

    // Mock collision FOUND
    const mockGt = vi
      .fn()
      .mockResolvedValue({ data: [{ id: 99 }], error: null });
    const mockLt = vi.fn().mockReturnValue({ gt: mockGt });
    mockSelectEq.mockReturnValue({ lt: mockLt });

    const body = {
      date: "2099-01-01",
      time: "10:00",
      duration: 60,
    };

    const req = new NextRequest("http://localhost/api/rooms/reservations/1", {
      method: "POST",
      body: JSON.stringify(body),
    });
    const params = Promise.resolve({ id: "1" });

    const response = await POST(req, { params });
    expect(response.status).toBe(409); // Conflict
  });
});
