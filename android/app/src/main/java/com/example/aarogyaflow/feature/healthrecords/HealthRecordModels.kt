package com.example.aarogyaflow.feature.healthrecords

import java.time.Instant

data class HealthRecord(
    val id: String,
    val name: String,
    val type: RecordType,
    val date: Instant = Instant.now(),
    val fileName: String? = null,
    val status: RecordStatus = RecordStatus.SAVED
)

enum class RecordType {
    LAB_REPORT("Lab Report"),
    PRESCRIPTION("Prescription"),
    DISCHARGE_SUMMARY("Discharge Summary"),
    IMAGING("Imaging"),
    VACCINATION("Vaccination"),
    OTHER("Other");

    val displayName: String = this.name
}

enum class RecordStatus {
    SAVED, UPLOADING, UPLOADED
}