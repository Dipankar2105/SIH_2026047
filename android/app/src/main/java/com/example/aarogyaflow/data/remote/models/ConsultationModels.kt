package com.example.aarogyaflow.data.remote.models

import kotlinx.serialization.Serializable

@Serializable
data class IntakeMessageRequest(
    val message: String,
    val language: String? = "en",
    val step: Int = 0,
    val session_id: String? = null
)

@Serializable
data class IntakeMessageResponse(
    val reply: String,
    val is_urgent: Boolean = false,
    val triage_priority: String = "normal",
    val next_step: Int = 0,
    val next_question: String? = null,
    val recommended_specialty: String? = null
)

@Serializable
data class IntakeQuestionItem(
    val id: String,
    val key: String,
    val text: String,
    val field: String,
    val type: String = "text"
)

@Serializable
data class IntakeQuestionsResponse(
    val language: String,
    val questions: List<IntakeQuestionItem> = emptyList()
)

@Serializable
data class DocumentUploadJsonRequest(
    val patient_id: String = "f5bf0bdc-900f-4e26-9dcb-365bfdb99ba6",
    val document_type: String = "lab_report",
    val file_name: String? = null,
    val session_id: String? = null
)

@Serializable
data class DocumentUploadResponse(
    val id: String,
    val patient_id: String? = null,
    val document_type: String? = null,
    val file_name: String? = null,
    val status: String? = null
)
