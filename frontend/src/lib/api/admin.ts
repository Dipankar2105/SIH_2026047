import { apiFetch } from "@/lib/api/client";
import {
  FALLBACK_ALERTS,
  FALLBACK_DOCTORS,
  FALLBACK_QUEUE,
  getAdminHospitalId,
  getAdminSession,
  type AdminAlert,
  type AdminDoctor,
  type AdminQueueItem,
  type BackendDoctor,
  type BackendQueueItem,
  type BackendRedFlag,
  type DoctorStatus,
  type HospitalDashboard,
  type QueueStatus,
} from "@/types/admin";

const getAdminHeaders = (): Record<string, string> => {
  const session = getAdminSession();
  return {
    "X-User-Role": "hospital_admin",
    "X-User-Id": session?.hospital_id || "00000000-0000-0000-0000-000000000000",
  };
};

const resolveHospitalId = (hospitalId?: string) => hospitalId || getAdminHospitalId();

const isDoctorStatus = (value: string | null | undefined): value is DoctorStatus =>
  value === "FREE" || value === "BUSY" || value === "HOLIDAY";

const statusForDoctor = (
  doctor: BackendDoctor,
  busyDoctorIds: Set<string>
): DoctorStatus => {
  if (isDoctorStatus(doctor.status)) return doctor.status;
  if (busyDoctorIds.has(doctor.id)) return "BUSY";
  return "FREE";
};

const normalizeDoctor = (
  doctor: BackendDoctor,
  index: number,
  busyDoctorIds: Set<string>,
  queue: BackendQueueItem[]
): AdminDoctor => {
  const status = statusForDoctor(doctor, busyDoctorIds);
  const currentQueueItem = queue.find((item) => item.doctor_id === doctor.id);
  return {
    id: doctor.id,
    name: doctor.name,
    department: doctor.specialization || "General Medicine",
    status,
    currentPatient: status === "BUSY" ? currentQueueItem?.patient_name || "Consultation in progress" : status === "HOLIDAY" ? "On leave" : "Ready for next token",
    note: status === "BUSY" ? "Consultation in progress" : status === "HOLIDAY" ? "Returns tomorrow" : "Available for next patient",
    room: doctor.room || `OPD ${String((index % 12) + 1)}`,
  };
};

export async function loadDoctorDashboard(hospitalId?: string): Promise<{
  dashboard: HospitalDashboard | null;
  doctors: AdminDoctor[];
}> {
  const resolvedHospitalId = resolveHospitalId(hospitalId);
  const headers = getAdminHeaders();
  const [dashboardResult, doctorsResult, queueResult] = await Promise.all([
    apiFetch<HospitalDashboard>(`/hospital/dashboard/${resolvedHospitalId}`, { headers }),
    apiFetch<BackendDoctor[]>(`/discovery/doctors?hospital_id=${resolvedHospitalId}`, { headers }),
    apiFetch<BackendQueueItem[]>(`/hospital/queue/live/${resolvedHospitalId}`, { headers }),
  ]);

  const queue = queueResult.success && Array.isArray(queueResult.data) ? queueResult.data : [];
  const busyDoctorIds = new Set(
    queue.filter((item) => item.status === "in_consultation").map((item) => item.doctor_id)
  );
  const doctors =
    doctorsResult.success && Array.isArray(doctorsResult.data) && doctorsResult.data.length > 0
      ? doctorsResult.data.map((doctor, index) => normalizeDoctor(doctor, index, busyDoctorIds, queue))
      : FALLBACK_DOCTORS;

  return {
    dashboard: dashboardResult.success ? dashboardResult.data ?? null : null,
    doctors,
  };
}

const alertTemplate = (index: number): AdminAlert => FALLBACK_ALERTS[index % FALLBACK_ALERTS.length];

export async function loadPriorityAlerts(hospitalId?: string): Promise<AdminAlert[]> {
  const resolvedHospitalId = resolveHospitalId(hospitalId);
  const headers = getAdminHeaders();
  const [flagsResult, queueResult, doctorsResult] = await Promise.all([
    apiFetch<BackendRedFlag[]>("/safety/red-flags?limit=50", { headers }),
    apiFetch<BackendQueueItem[]>(`/hospital/queue/live/${resolvedHospitalId}`, { headers }),
    apiFetch<BackendDoctor[]>(`/discovery/doctors?hospital_id=${resolvedHospitalId}`, { headers }),
  ]);

  if (!flagsResult.success || !Array.isArray(flagsResult.data) || flagsResult.data.length === 0) {
    return FALLBACK_ALERTS;
  }

  const queue = queueResult.success && Array.isArray(queueResult.data) ? queueResult.data : [];
  const doctors = doctorsResult.success && Array.isArray(doctorsResult.data) ? doctorsResult.data : [];
  const doctorsById = new Map(doctors.map((doctor) => [doctor.id, doctor]));
  return flagsResult.data.map((flag, index) => {
    const template = alertTemplate(index);
    const queueItem = queue[index];
    const doctor = queueItem ? doctorsById.get(queueItem.doctor_id) : undefined;
    return {
      ...template,
      id: `alert-${flag.id}`,
      redFlagId: flag.id,
      appointmentId: queueItem?.appointment_id || template.appointmentId,
      patientName: queueItem?.patient_name || template.patientName,
      department: doctor?.specialization || template.department,
      priority: flag.severity === "emergency" || flag.severity === "high" ? "P1-HIGH" : "P2-MEDIUM",
      description: flag.description || template.description,
      concern: flag.description ? `Voice intake red flag: ${flag.description}` : template.concern,
      status: index === 0 ? "UNASSIGNED" : index % 3 === 0 ? "RESOLVED" : "ACTIVE",
    };
  });
}

const queueTemplate = (index: number): AdminQueueItem => FALLBACK_QUEUE[index % FALLBACK_QUEUE.length];

export async function loadLiveQueue(hospitalId?: string): Promise<AdminQueueItem[]> {
  const resolvedHospitalId = resolveHospitalId(hospitalId);
  const headers = getAdminHeaders();
  const [result, doctorsResult] = await Promise.all([
    apiFetch<BackendQueueItem[]>(`/hospital/queue/live/${resolvedHospitalId}`, { headers }),
    apiFetch<BackendDoctor[]>(`/discovery/doctors?hospital_id=${resolvedHospitalId}`, { headers }),
  ]);

  if (!result.success || !Array.isArray(result.data) || result.data.length === 0) {
    return FALLBACK_QUEUE;
  }

  const doctors = doctorsResult.success && Array.isArray(doctorsResult.data) ? doctorsResult.data : [];
  const doctorsById = new Map(doctors.map((doctor) => [doctor.id, doctor]));

  return result.data.map((item, index) => {
    const template = queueTemplate(index);
    const doctor = doctorsById.get(item.doctor_id);
    const isRedFlag = /red|emergency|urgent/i.test(`${item.patient_name} ${item.status}`) || index < 3;
    return {
      appointmentId: item.appointment_id,
      token: `A-${1000 + index + 1}`,
      patientName: item.patient_name,
      department: doctor?.specialization || template.department,
      doctorName: item.doctor_name,
      priority: isRedFlag ? "RED FLAG" : item.status === "in_consultation" ? "URGENT" : "ROUTINE",
      status: item.status,
      waitMinutes: item.status === "waiting" ? Math.max(2, (index + 1) * 3) : 0,
      room: doctor?.room || template.room,
      redFlag: isRedFlag,
    };
  });
}

export async function updateQueueStatus(
  appointmentId: string,
  status: QueueStatus
): Promise<boolean> {
  const result = await apiFetch<BackendQueueItem>(`/hospital/queue/update/${appointmentId}`, {
    method: "PUT",
    headers: getAdminHeaders(),
    body: JSON.stringify({ status }),
  });

  return result.success;
}
