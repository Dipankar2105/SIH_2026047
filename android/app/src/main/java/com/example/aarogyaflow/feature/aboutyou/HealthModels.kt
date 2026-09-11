package com.example.aarogyaflow.feature.aboutyou

import java.time.Instant

data class AllergyItem(
    val name: String,
    val type: String,
    val reaction: String
)

data class ConditionItemData(
    val title: String,
    val subtitle: String,
    val status: String
)

data class MedicationItemData(
    val name: String,
    val instruction: String,
    val badge: String,
    val isAllopathy: Boolean
)

data class HealthData(
    val bloodGroup: String = "O +ve",
    val heightCm: Int = 174,
    val weightKg: Int = 71,
    val bloodPressure: String = "120/78 mmHg",
    val pulseBpm: Int = 74,
    val spO2Percent: Int = 98,
    val temperatureCelsius: Double = 36.8,
    val painScore: Int = 0,
    val allergies: List<AllergyItem> = listOf(
        AllergyItem("Penicillin", "DRUG", "Causes severe skin hives & swelling."),
        AllergyItem("Peanuts", "FOOD", "Mild gastrointestinal distress.")
    ),
    val conditions: List<ConditionItemData> = listOf(
        ConditionItemData("Mild Gastritis (Acid Reflux)", "Diagnosed Feb 2024 • Managed by diet & antacids", "Active"),
        ConditionItemData("Seasonal Allergic Rhinitis", "Diagnosed 2022 • Occasional onset in autumn", "Intermittent")
    ),
    val medications: List<MedicationItemData> = listOf(
        MedicationItemData("Pantoprazole 40mg", "1 tablet • Once daily before breakfast", "Prescribed", true),
        MedicationItemData("Avipattikar Churna", "Ayurvedic • 1 tsp at bedtime with warm water", "AYUSH", false)
    )
) {
    val bmi: Double
        get() {
            val hM = heightCm / 100.0
            return if (hM > 0) Math.round((weightKg / (hM * hM)) * 10.0) / 10.0 else 0.0
        }
    val bmiStatus: String
        get() = when {
            bmi < 18.5 -> "Underweight"
            bmi < 25.0 -> "Normal"
            bmi < 30.0 -> "Overweight"
            else -> "Obese"
        }

    val vitals: VitalsData
        get() = VitalsData(
            systolicBp = 120,
            diastolicBp = 80,
            heartRateBpm = pulseBpm,
            spO2Percent = spO2Percent,
            temperatureCelsius = temperatureCelsius,
            painScore = painScore
        )
}
