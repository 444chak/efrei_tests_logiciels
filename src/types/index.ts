export interface Room {
  id: number;
  name?: string;
  description?: string;
  capacite?: number;
}

export interface Reservation {
  id: number;
  id_user?: string;
  id_room?: number;
  start_time: string;
  end_time: string;
  created_at?: string;
  status?: string;
  is_own_reservation?: boolean;

  // Expanded relation
  rooms?: Room;
}
