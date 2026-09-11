package com.example.aarogyaflow.feature.aboutyou

import java.time.Instant

data class VitalsData(
    val systolicBp: Int = 120,
    val diastolicBp: Int = 80,
    val heartRateBpm: Int = 74,
    val spO2Percent: Int = 98,
    val temperatureCelsius: Double = 36.8,
    val painScore: Int = 0,
    val timestamp: Instant = Instant.now()
) {
    val bloodPressureString: String
        get() = "$systolicBp/$diastolicBp mmHg"

    val isHypertensive: Boolean
        get() = systolicBp >= 140 || diastolicBp >= 90

    val isTachycardic: Boolean
        get() = heartRateBpm > 100

    val isHypoxic: Boolean
        get() = spO2Percent < 95

    val hasFever: Boolean
        get() = temperatureCelsius >= 38.0

    val hasSignificantPain: Boolean
        get() = painScore >= 4
}

data class VitalsRecord(
    val id: String,
    val vitals: VitalsData,
    val source: VitalsSource = VitalsSource.MANUAL,
    val notes: String = ""
)

enum class VitalsSource {
    MANUAL, DEVICE, ABDM, CONSULTATION
}