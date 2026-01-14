import { Reservation } from "@/types";

export const mockReservation: Reservation = {
  id: 1,
  id_room: 101,
  id_user: "user-1",
  start_time: "2023-01-01T10:00:00",
  end_time: "2023-01-01T11:00:00",
  rooms: { id: 101, name: "Salle Test", description: "Desc", capacite: 10 },
  is_own_reservation: true,
};

export const mockUser: any = {
  id: "123",
  email: "test@example.com",
  user_metadata: { username: "Tester" },
};
