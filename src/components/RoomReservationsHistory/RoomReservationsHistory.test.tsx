import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RoomReservationsHistory } from "./index";
import { mockReservation } from "@/test/fixtures";

// Mock ReservationsList to verify props passed to it
vi.mock("../ReservationsList", () => ({
  ReservationsList: (props: any) => (
    <div data-testid="reservations-list">
      <span>Title: {props.title}</span>
      <span>EmptyMsg: {props.emptyMessage}</span>
      <span>ShowRoomName: {props.showRoomName?.toString()}</span>
      <span>Class: {props.className}</span>
      {props.footerAction && (
        <a href={props.footerAction.href}>{props.footerAction.label}</a>
      )}
    </div>
  ),
}));

describe("RoomReservationsHistory", () => {
  it("renders with default props", () => {
    render(
      <RoomReservationsHistory
        reservations={[mockReservation]}
        loading={false}
        error={null}
      />
    );

    expect(screen.getByTestId("reservations-list")).toBeInTheDocument();
    expect(screen.getByText("Title: Réservations passées")).toBeInTheDocument();
    expect(
      screen.getByText("EmptyMsg: Aucune réservation pour cette salle.")
    ).toBeInTheDocument();
    expect(screen.getByText("ShowRoomName: true")).toBeInTheDocument();
  });

  it("passes className correctly", () => {
    render(
      <RoomReservationsHistory
        reservations={[]}
        loading={false}
        error={null}
        className="custom-class"
      />
    );

    // The component merges "h-full" with className
    expect(
      screen.getByText(/Class:.*h-full.*custom-class/)
    ).toBeInTheDocument();
  });

  it("shows footer link when showSeeAllLink is true", () => {
    render(
      <RoomReservationsHistory
        reservations={[mockReservation, mockReservation]}
        loading={false}
        error={null}
        showSeeAllLink={true}
      />
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/reservations/history");
    expect(link).toHaveTextContent("Voir tout (2)");
  });

  it("does not show footer link when showSeeAllLink is false", () => {
    render(
      <RoomReservationsHistory
        reservations={[mockReservation]}
        loading={false}
        error={null}
        showSeeAllLink={false}
      />
    );

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
