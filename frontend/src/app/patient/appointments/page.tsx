"use client";

import React, { useEffect, useState } from "react";
import { MobileContainer } from "@/components/patient/MobileContainer";
import { PatientTopBar } from "@/components/patient/PatientTopBar";
import {
  TokenCounterCard,
  UpcomingAppointmentCard,
} from "@/components/patient/AppointmentCards";
import { usePatient } from "@/context/PatientContext";

export default function AppointmentsPage() {
  const { assignedToken, estimatedWaitMinutes, setEstimatedWaitMinutes } = usePatient();
  const [liveWait, setLiveWait] = useState<number>(estimatedWaitMinutes || 15);

  // Live Queue Simulation / WebSocket listener
  useEffect(() => {
    // Check if WebSocket is available
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000/hospital/mock-hospital/queue/ws";
    let ws: WebSocket | null = null;

    try {
      ws = new WebSocket(wsUrl);
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.estimated_wait !== undefined) {
            setLiveWait(data.estimated_wait);
            setEstimatedWaitMinutes(data.estimated_wait);
          }
        } catch {
          // ignore
        }
      };
    } catch {
      // Offline fallback
    }

    return () => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [setEstimatedWaitMinutes]);

  return (
    <MobileContainer bgClassName="bg-[#F7F9FA]">
      {/* Top Header */}
      <PatientTopBar
        title="Appointments"
        showBrand={false}
        showBack={true}
        backHref="/patient"
        textToRead={`Appointments. Today at City Hospital with Dr. Sharma at 10:30 AM. Your token number is ${assignedToken || "42"}, estimated wait time is ${liveWait} minutes.`}
      />

      {/* Main Screen Content */}
      <main className="flex-1 px-5 py-5 flex flex-col gap-6 overflow-y-auto">
        {/* TODAY Section */}
        <section aria-labelledby="heading-today" className="flex flex-col gap-2.5">
          <h2
            id="heading-today"
            className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-0.5"
          >
            TODAY
          </h2>

          {/* Active Appointment Live Token Card */}
          <TokenCounterCard
            department="GENERAL MEDICINE"
            hospitalName="City Hospital"
            doctorName="Dr. Sharma"
            appointmentTime="10:30 AM"
            tokenNumber={assignedToken || "42"}
            estimatedWaitMin={liveWait}
          />
        </section>

        {/* TOMORROW Section */}
        <section
          aria-labelledby="heading-tomorrow"
          className="flex flex-col gap-2.5"
        >
          <h2
            id="heading-tomorrow"
            className="text-[11px] font-bold tracking-wider text-slate-400 uppercase px-0.5"
          >
            TOMORROW
          </h2>

          {/* Upcoming Appointment Card */}
          <UpcomingAppointmentCard
            appointment={{
              id: "apt-tomorrow-1",
              department: "General Medicine",
              hospitalName: "City Hospital",
              doctorName: "Dr. Sharma",
              appointmentTime: "10:30 AM",
              tokenNumber: "17",
              estimatedWaitMin: 0,
              dayCategory: "TOMORROW",
              dateNumeric: "17",
              status: "waiting",
            }}
            onViewDetails={() => {
              alert("Appointment Details: General Medicine OPD consultation at City Hospital, Cabin 4B.");
            }}
          />
        </section>
      </main>
    </MobileContainer>
  );
}
