package com.example.aarogyaflow.feature.family

data class FamilyMember(
    val id: String,
    val name: String,
    val relationship: String,
    val age: Int,
    val abhaNumber: String,
    val avatarColor: String,
    val avatarInitials: String,
    val healthSnapshot: String,
    val activeRxCount: Int,
    val statusBadge: String,
    val statusBadgeColor: String,
    val hasAlert: Boolean = false,
    val alertTitle: String = "",
    val alertDescription: String = ""
)

data class FamilyMemberDetail(
    val id: String,
    val name: String,
    val relationship: String,
    val age: Int,
    val gender: String,
    val abhaNumber: String,
    val avatarColor: String,
    val avatarInitials: String,
    // Basic Health Information
    val bloodGroup: String,
    val heightCm: Int,
    val weightKg: Int,
    val bloodPressure: String,
    val pulseBpm: Int,
    val spO2Percent: Int,
    // Recent Health Summary
    val recentUpdateTitle: String,
    val recentUpdateDescription: String,
    val recentUpdateTags: List<String>,
    // Medical History
    val conditions: List<ConditionItem>,
    // Allergies
    val allergies: List<AllergyItem>,
    // Current Medications
    val medications: List<MedicationItem>,
    // Care Team & Emergency Contact
    val primaryDoctor: CareTeamMember,
    val emergencyContact: EmergencyContact
)

data class ConditionItem(
    val title: String,
    val subtitle: String,
    val status: String,
    val statusColor: String,
    val statusBg: String
)

data class AllergyItem(
    val name: String,
    val reaction: String,
    val severity: String
)

data class MedicationItem(
    val name: String,
    val instruction: String,
    val type: String, // "Allopathic" or "AYUSH"
    val condition: String
)

data class CareTeamMember(
    val name: String,
    val specialty: String,
    val hospital: String,
    val avatarInitials: String,
    val avatarColor: String,
    val isPrimary: Boolean
)

data class EmergencyContact(
    val name: String,
    val relationship: String,
    val phone: String,
    val isPrimaryHolder: Boolean,
    val avatarInitials: String,
    val avatarColor: String
)