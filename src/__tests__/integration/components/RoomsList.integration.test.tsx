import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import RoomsList from "@/components/RoomsList";
import { createMockRoom, mockRoomWithoutName } from "@/test/fixtures";

global.fetch = vi.fn();

describe("RoomsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading initially", () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      () => new Promise(() => {})
    );
    render(<RoomsList />);
    expect(screen.getByText("Chargement des rooms…")).toBeInTheDocument();
  });

  it("renders rooms after successful fetch", async () => {
    const mockRooms = [
      createMockRoom({
        id: 1,
        name: "Room 1",
        description: "Desc 1",
        capacite: 5,
      }),
    ];

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockRooms,
    });

    render(<RoomsList />);

    await waitFor(() => {
      expect(screen.getByText("Room 1")).toBeInTheDocument();
      expect(screen.getByText("Desc 1")).toBeInTheDocument();
    });
  });

  it("renders error state on fetch failure", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => "Internal Server Error",
    });

    render(<RoomsList />);

    await waitFor(() => {
      expect(
        screen.getByText("Erreur: Internal Server Error")
      ).toBeInTheDocument();
    });
  });
  it("renders empty state when no rooms found", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<RoomsList />);

    await waitFor(() => {
      expect(screen.getByText("Aucune room disponible.")).toBeInTheDocument();
    });
  });

  it("renders error state on fetch failure with no text", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => "",
    });

    render(<RoomsList />);

    await waitFor(() => {
      expect(screen.getByText("Erreur: HTTP 404")).toBeInTheDocument();
    });
  });

  it("renders room fallback title when name is missing", async () => {
    const mockRooms = [mockRoomWithoutName];

    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      json: async () => mockRooms,
    });

    render(<RoomsList />);

    await waitFor(() => {
      expect(screen.getByText("Room 123")).toBeInTheDocument();
    });
  });
  it("does not update state if unmounted during fetch", async () => {
    let resolveFetch: ((value: unknown) => void) | undefined;
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((resolve) => {
        resolveFetch = resolve;
      })
    );

    const { unmount } = render(<RoomsList />);

    unmount();

    if (resolveFetch) {
      resolveFetch({
        ok: true,
        json: async () => [{ id: 1, name: "Leaked Room" }],
      });
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it("does not update error state if unmounted during fetch error", async () => {
    let rejectFetch: ((reason?: unknown) => void) | undefined;
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((_, reject) => {
        rejectFetch = reject;
      })
    );

    const { unmount } = render(<RoomsList />);

    unmount();

    if (rejectFetch) {
      rejectFetch(new Error("Unmounted Failure"));
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  it("renders error state when fetch rejects with a string (non-Error object)", async () => {
    (global.fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(
      "Simple String Error"
    );

    render(<RoomsList />);

    await waitFor(() => {
      expect(
        screen.getByText("Erreur: Simple String Error")
      ).toBeInTheDocument();
    });
  });
});
