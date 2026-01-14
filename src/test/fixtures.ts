import { Room, Reservation } from "@/types";

// ============================================================================
// User Fixtures
// ============================================================================

export interface MockUser {
  id: string;
  email: string;
  user_metadata?: {
    username?: string;
  };
}

export const mockUser: MockUser = {
  id: "user-123",
  email: "test@example.com",
  user_metadata: { username: "Tester" },
};

// ============================================================================
// Room Fixtures
// ============================================================================

export const mockRoom: Room = {
  id: 101,
  name: "Salle de Réunion A",
  description: "Salle moderne équipée d'un vidéoprojecteur",
  capacite: 10,
};

export const mockRoomWithoutName: Room = {
  id: 123,
  name: undefined,
  description: "Salle sans nom",
  capacite: 5,
};

export const mockRooms: Room[] = [
  mockRoom,
  {
    id: 102,
    name: "Salle de Réunion B",
    description: "Salle spacieuse",
    capacite: 20,
  },
  mockRoomWithoutName,
];

// ============================================================================
// Reservation Fixtures
// ============================================================================

export const mockReservation: Reservation = {
  id: 1,
  id_room: 101,
  id_user: "user-1",
  start_time: "2023-01-01T10:00:00",
  end_time: "2023-01-01T11:00:00",
  rooms: { id: 101, name: "Salle Test", description: "Desc", capacite: 10 },
  is_own_reservation: true,
};

export const mockReservationPast: Reservation = {
  ...mockReservation,
  id: 2,
  start_time: "2020-01-01T10:00:00",
  end_time: "2020-01-01T11:00:00",
};

export const mockReservationWithoutRoom: Reservation = {
  ...mockReservation,
  id: 3,
  rooms: undefined,
};

// ============================================================================
// Helper Functions for Creating Variants
// ============================================================================

/**
 * Creates a mock reservation with optional overrides
 * @param overrides - Partial reservation object to override default values
 * @returns A new Reservation object
 */
export const createMockReservation = (
  overrides?: Partial<Reservation>
): Reservation => ({
  ...mockReservation,
  ...overrides,
});

/**
 * Creates a mock room with optional overrides
 * @param overrides - Partial room object to override default values
 * @returns A new Room object
 */
export const createMockRoom = (overrides?: Partial<Room>): Room => ({
  ...mockRoom,
  ...overrides,
});
