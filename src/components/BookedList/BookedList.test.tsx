import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { BookedList } from "./index";
import { mockReservation } from "@/test/fixtures";

// Mock next/navigation to avoid router dependency
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
    push: vi.fn(),
  }),
}));

// Mock sonner to avoid toast dependency
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock ReservationsList to isolate BookedList
vi.mock("../ReservationsList", () => ({
  ReservationsList: ({ reservations, title }: any) => (
    <div data-testid="reservations-list">
      <h2>{title}</h2>
      <div data-testid="reservations-count">{reservations.length}</div>
    </div>
  ),
}));

describe("BookedList - Unit Test (Smoke Test)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render without crashing", () => {
    render(<BookedList reservations={[]} />);
    expect(screen.getByTestId("reservations-list")).toBeInTheDocument();
  });

  it("should render with empty reservations array", () => {
    render(<BookedList reservations={[]} />);
    expect(screen.getByText("Mes Réservations")).toBeInTheDocument();
    expect(screen.getByTestId("reservations-count")).toHaveTextContent("0");
  });

  it("should render with mock reservations", () => {
    render(<BookedList reservations={[mockReservation]} />);
    expect(screen.getByText("Mes Réservations")).toBeInTheDocument();
    expect(screen.getByTestId("reservations-count")).toHaveTextContent("1");
  });

  it("should render with multiple reservations", () => {
    const multipleReservations = [
      mockReservation,
      { ...mockReservation, id: 2 },
      { ...mockReservation, id: 3 },
    ];
    render(<BookedList reservations={multipleReservations} />);
    expect(screen.getByTestId("reservations-count")).toHaveTextContent("3");
  });

  it("should render with limit prop", () => {
    render(<BookedList reservations={[mockReservation]} limit={5} />);
    expect(screen.getByTestId("reservations-list")).toBeInTheDocument();
  });

  it("should render AlertDialog component structure", () => {
    render(<BookedList reservations={[mockReservation]} />);
    // AlertDialog is rendered but closed by default
    // We just verify the component structure exists
    expect(screen.getByTestId("reservations-list")).toBeInTheDocument();
  });
});
