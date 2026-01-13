export interface Room {
  id: number;
  name?: string;
  description?: string;
  capacite?: number;
}

export interface Reservation {
  id: number;
  user_id: string; // Used in RoomReservationsHistory/List
  id_user?: string; // Sometimes used in API responses? Keeping for safety if needed, though user_id seems standard in components.
  room_id?: number; // Used in History
  id_room?: number; // Used in List
  start_time: string;
  end_time: string;
  created_at?: string;
  status?: string;
  is_own_reservation?: boolean;

  // Expanded relation
  rooms?: Room;
}
