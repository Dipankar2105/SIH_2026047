package com.example.aarogyaflow.data.remote.models

import kotlinx.serialization.Serializable

@Serializable
data class MobileOtpRequest(val mobile: String)

@Serializable
data class MobileOtpResponse(val txnId: String, val message: String)

@Serializable
data class MobileOtpVerify(val txn_id: String, val otp: String, val patient_id: String? = null)

@Serializable
data class PatientResponse(val id: String, val abha_id: String?)

@Serializable
data class VerifyOtpResponse(
    val status: String? = null,
    val message: String? = null,
    val verified: Boolean? = null,
    val txnId: String? = null,
    val token: String? = null,
    val patient: PatientResponse? = null
)
