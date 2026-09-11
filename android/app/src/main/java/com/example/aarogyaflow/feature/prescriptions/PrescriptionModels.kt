package com.example.aarogyaflow.feature.prescriptions

import java.time.Instant

data class Prescription(
    val id: String,
    val medicineName: String,
    val dose: String,
    val frequency: String,
    val duration: String,
    val instructions: String,
    val doctorName: String,
    val prescriptionDate: Instant
)

data class RecommendedTest(
    val id: String,
    val testName: String,
    val recommendedBy: String,
    val dateRecommended: Instant,
    val status: TestStatus
)

enum class TestStatus(val displayName: String, val colorHex: String) {
    RECOMMENDED("Recommended", "#F59E0B"),
    TEST_DONE("Test Done", "#059669"),
    REPORT_UPLOADED("Report Uploaded", "#2563EB"),
    REPORT_READY("Report Ready", "#7C3AED")
}

val demoPrescriptions = listOf(
    Prescription(
        id = "p1",
        medicineName = "Pantoprazole 40mg",
        dose = "40mg",
        frequency = "Once daily",
        duration = "7 days",
        instructions = "Take before breakfast with a full glass of water",
        doctorName = "Dr. Sharma, MD",
        prescriptionDate = Instant.parse("2026-09-01T10:30:00Z")
    ),
    Prescription(
        id = "p2",
        medicineName = "Avipattikar Churna",
        dose = "1 tsp",
        frequency = "At bedtime",
        duration = "14 days",
        instructions = "Take with warm water, avoid solid food for 30 min after",
        doctorName = "Dr. V. K. Shastri, Vaidya",
        prescriptionDate = Instant.parse("2026-08-28T14:00:00Z")
    ),
    Prescription(
        id = "p3",
        medicineName = "Metformin 500mg",
        dose = "500mg",
        frequency = "Twice daily",
        duration = "30 days",
        instructions = "Take with meals to reduce gastrointestinal side effects",
        doctorName = "Dr. Patel, MD",
        prescriptionDate = Instant.parse("2026-08-20T09:15:00Z")
    )
)

val demoRecommendedTests = listOf(
    RecommendedTest(
        id = "t1",
        testName = "Complete Blood Count (CBC)",
        recommendedBy = "Dr. Sharma, MD",
        dateRecommended = Instant.parse("2026-09-05T11:00:00Z"),
        status = TestStatus.REPORT_READY
    ),
    RecommendedTest(
        id = "t2",
        testName = "HbA1c",
        recommendedBy = "Dr. Patel, MD",
        dateRecommended = Instant.parse("2026-09-03T15:30:00Z"),
        status = TestStatus.TEST_DONE
    ),
    RecommendedTest(
        id = "t3",
        testName = "Lipid Profile",
        recommendedBy = "Dr. Sharma, MD",
        dateRecommended = Instant.parse("2026-09-01T10:00:00Z"),
        status = TestStatus.RECOMMENDED
    ),
    RecommendedTest(
        id = "t4",
        testName = "Thyroid Function Test (TSH)",
        recommendedBy = "Dr. V. K. Shastri, Vaidya",
        dateRecommended = Instant.parse("2026-08-25T16:45:00Z"),
        status = TestStatus.REPORT_UPLOADED
    )
)
