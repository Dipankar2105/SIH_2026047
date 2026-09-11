/** Hospital discovery types (patient-facing) */

export interface HospitalListItem {
  hospitalId: string;
  name: string;
  address: string;
  city: string;
  type: string;
  distance?: number;
  latitude?: number;
  longitude?: number;
  specialties?: string[];
  rating?: number;
}

export interface HospitalAvailability {
  hospitalId: string;
  date: string;
  availableSlots: number;
  specialties: Array<{
    specialtyId: string;
    name: string;
    availableSlots: number;
  }>;
}
