package com.example.aarogyaflow.feature.appointments

import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime

data class Appointment(
    val id: String,
    val patientName: String,
    val doctorName: String,
    val doctorSpecialty: String,
    val hospitalName: String,
    val consultationType: ConsultationType,
    val dateTime: Instant,
    val tokenNumber: String,
    val queueStatus: QueueStatus,
    val currentToken: String? = null,
    val estimatedWaitMinutes: String? = null,
    val notes: String? = null
)

enum class ConsultationType(val displayName: String, val iconType: String) {
    MODERN_MEDICINE("Modern Medicine", "allopathy"),
    AYUSH("AYUSH / Ayurveda", "ayush")
}

enum class QueueStatus(val displayName: String, val colorRes: String) {
    UPCOMING("Upcoming", "blue"),
    IN_PROGRESS("In Progress", "teal"),
    COMPLETED("Completed", "gray"),
    CANCELLED("Cancelled", "red")
}

data class QueueInfo(
    val appointmentId: String,
    val tokenNumber: String,
    val currentServingToken: String,
    val totalAhead: Int,
    val estimatedWaitMinutes: Int,
    val status: QueueStatus = QueueStatus.IN_PROGRESS
)

data class Doctor(
    val id: String,
    val name: String,
    val specialty: String,
    val hospitalName: String,
    val consultationType: ConsultationType,
    val availableSlots: List<TimeSlot> = emptyList()
)

data class TimeSlot(
    val id: String,
    val date: LocalDate,
    val time: LocalTime,
    val isAvailable: Boolean = true
)
