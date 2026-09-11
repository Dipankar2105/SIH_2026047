package com.example.aarogyaflow.feature.consultation

data class AyushAssessmentState(
    val concern: String = "",
    val bodyConstitution: String = "",
    val routineEnergy: String = "",
    val foodDigestion: String = "",
    val sleepRoutine: String = ""
) {
    fun copy(
        concern: String = this.concern,
        bodyConstitution: String = this.bodyConstitution,
        routineEnergy: String = this.routineEnergy,
        foodDigestion: String = this.foodDigestion,
        sleepRoutine: String = this.sleepRoutine
    ) = AyushAssessmentState(
        concern = concern,
        bodyConstitution = bodyConstitution,
        routineEnergy = routineEnergy,
        foodDigestion = foodDigestion,
        sleepRoutine = sleepRoutine
    )

    val isComplete: Boolean
        get() = concern.isNotBlank() &&
                bodyConstitution.isNotBlank() &&
                routineEnergy.isNotBlank() &&
                foodDigestion.isNotBlank() &&
                sleepRoutine.isNotBlank()
}