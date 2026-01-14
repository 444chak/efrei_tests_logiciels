import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ReservationsList } from "./index";
import { mockReservation } from "@/test/fixtures";
import { Reservation } from "@/types";

describe("ReservationsList", () => {
  it("displays loading state", () => {
    render(<ReservationsList reservations={[]} loading={true} />);
    expect(screen.getByText("Chargement...")).toBeInTheDocument();
  });

  it("displays error message", () => {
    render(<ReservationsList reservations={[]} error="Failed to fetch" />);
    expect(screen.getByText("Erreur: Failed to fetch")).toBeInTheDocument();
  });

  it("displays empty message when no reservations", () => {
    render(<ReservationsList reservations={[]} />);
    expect(screen.getByText("Aucune réservation trouvée.")).toBeInTheDocument();
  });

  it("renders a list of reservations", () => {
    render(
      <ReservationsList reservations={[mockReservation]} showRoomName={true} />
    );
    expect(screen.getByText("Salle Test")).toBeInTheDocument();

    expect(screen.getByText(/2023/)).toBeInTheDocument();
  });

  it("calls onCancel when trash button is clicked", () => {
    const handleCancel = vi.fn();
    render(
      <ReservationsList
        reservations={[mockReservation]}
        onCancel={handleCancel}
      />
    );

    const button = screen.getByRole("button");
    fireEvent.click(button);

    expect(handleCancel).toHaveBeenCalledWith(1);
  });

  it("wraps item in a link when linkToRoom is true and not interactive", () => {
    render(
      <ReservationsList
        reservations={[mockReservation]}
        linkToRoom={true}
        showRoomName={true}
      />
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/room/detail/101");
    expect(link).toHaveTextContent("Salle Test");
  });

  it("respects the limit prop and renders footer action", () => {
    const manyReservations = [
      { ...mockReservation, id: 1 },
      { ...mockReservation, id: 2 },
    ];
    render(
      <ReservationsList
        reservations={manyReservations}
        limit={1}
        footerAction={{ label: "Voir plus", href: "/all" }}
        showRoomName={true}
      />
    );

    expect(screen.getAllByText("Salle Test")).toHaveLength(1);

    expect(screen.getByText("Voir plus")).toBeInTheDocument();
  });

  it("renders interactive room link when linkToRoom is true AND onCancel is present", () => {
    render(
      <ReservationsList
        reservations={[mockReservation]}
        linkToRoom={true}
        showRoomName={true}
        onCancel={() => {}}
      />
    );

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent("Salle Test");
    expect(links[0]).toHaveAttribute("href", "/room/detail/101");
  });

  it("renders ownership status and applies correct styling", () => {
    const ownReservation = { ...mockReservation, is_own_reservation: true };
    render(
      <ReservationsList
        reservations={[ownReservation]}
        showStatus={true}
        showRoomName={true}
      />
    );

    expect(screen.getByText("✨ Votre réservation")).toBeInTheDocument();

    const cardContent = screen
      .getByText("Salle Test")
      .closest("div.bg-primary\\/5");
    expect(cardContent).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<ReservationsList reservations={[]} title="Mon Titre" />);
    expect(screen.getByText("Mon Titre")).toBeInTheDocument();
  });

  it("renders non-owned status and correct styling", () => {
    const otherReservation = { ...mockReservation, is_own_reservation: false };
    render(
      <ReservationsList
        reservations={[otherReservation]}
        showStatus={true}
        showRoomName={true}
      />
    );

    expect(
      screen.getByText("Réservé par un autre utilisateur")
    ).toBeInTheDocument();

    const cardContent = screen.getByText("Salle Test").closest("div");
    expect(cardContent).not.toHaveClass("bg-primary/5");
  });

  it("renders room name fallback when details are missing", () => {
    const fallbackReservation: Reservation = {
      ...mockReservation,
      rooms: undefined,
      id_room: 999,
    };
    render(
      <ReservationsList
        reservations={[fallbackReservation]}
        showRoomName={true}
      />
    );

    expect(screen.getByText("Salle 999")).toBeInTheDocument();
  });

  it("renders room description when showDescription is true", () => {
    render(
      <ReservationsList
        reservations={[mockReservation]}
        showDescription={true}
      />
    );
    expect(screen.getByText("Desc")).toBeInTheDocument();
  });

  it("renders room name fallback INSIDE interactive link", () => {
    const fallbackInLinkRes: Reservation = {
      ...mockReservation,
      rooms: mockReservation.rooms
        ? { ...mockReservation.rooms, name: undefined }
        : undefined,
      id_room: 777,
    };
    render(
      <ReservationsList
        reservations={[fallbackInLinkRes]}
        linkToRoom={true}
        showRoomName={true}
        onCancel={() => {}}
      />
    );

    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/room/detail/101");
    expect(link).toHaveTextContent("Salle 777");
  });
});
