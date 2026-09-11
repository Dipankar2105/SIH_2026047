/** Doctor and specialty types used by the Discovery API */

export interface TimeSlot {
  slotId: string;
  startTime: string;   // ISO
  endTime: string;     // ISO
  available: boolean;
}

export interface Specialty {
  specialtyId: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Doctor {
  doctorId: string;
  name: string;
  qualifications: string;
  specialty: string;
  specialtyId: string;
  hospitalId: string;
  hospitalName: string;
  experience?: number;    // years
  languages?: string[];
  rating?: number;
  availableToday: boolean;
  nextAvailable?: string; // ISO
  opdRoom?: string;
  profileImage?: string;
}

export interface Hospital {
  hospitalId: string;
  name: string;
  address: string;
  city: string;
  type: string;
  distance?: number;  // km
  latitude?: number;
  longitude?: number;
}
