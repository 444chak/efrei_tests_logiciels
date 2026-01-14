import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import RoomsList from "./index";
import { createMockRoom, mockRoomWithoutName } from "@/test/fixtures";

// Mock fetch to return immediately with mock data (no network call)
// This allows the component to render in its "loaded" state
vi.stubGlobal("fetch", vi.fn());

describe("RoomsList - Unit Test (Smoke Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock fetch to resolve immediately with empty array
    // This simulates the component in a "loaded" state without network delay
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });
  });

  it("should render without crashing", async () => {
    render(<RoomsList />);
    // Component will show loading state initially, then empty state
    // We just verify it renders
    expect(screen.getByText("Rooms")).toBeInTheDocument();
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText("Aucune room disponible.")).toBeInTheDocument();
    });
  });

  it("should render loading state initially", () => {
    // Mock fetch to never resolve (simulating loading)
    (global.fetch as any).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    render(<RoomsList />);
    expect(screen.getByText("Chargement des rooms…")).toBeInTheDocument();
  });

  it("should render empty state when no rooms", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<RoomsList />);

    // Wait for loading to finish and empty state to appear
    const emptyMessage = await screen.findByText("Aucune room disponible.");
    expect(emptyMessage).toBeInTheDocument();
  });

  it("should render rooms when data is provided", async () => {
    const mockRooms = [
      createMockRoom({
        id: 1,
        name: "Room A",
        description: "Description A",
        capacite: 10,
      }),
      createMockRoom({
        id: 2,
        name: "Room B",
        description: "Description B",
        capacite: 20,
      }),
    ];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockRooms,
    });

    render(<RoomsList />);

    // Wait for rooms to render
    const roomA = await screen.findByText("Room A");
    const roomB = await screen.findByText("Room B");

    expect(roomA).toBeInTheDocument();
    expect(roomB).toBeInTheDocument();
    expect(screen.getByText("Description A")).toBeInTheDocument();
    expect(screen.getByText("Description B")).toBeInTheDocument();
  });

  it("should render error state when fetch fails", async () => {
    (global.fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });

    render(<RoomsList />);

    const errorMessage = await screen.findByText(/Erreur:/);
    expect(errorMessage).toBeInTheDocument();
  });

  it("should render room with fallback name when name is missing", async () => {
    const mockRooms = [mockRoomWithoutName];

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockRooms,
    });

    render(<RoomsList />);

    const fallbackName = await screen.findByText("Room 123");
    expect(fallbackName).toBeInTheDocument();
  });
});
