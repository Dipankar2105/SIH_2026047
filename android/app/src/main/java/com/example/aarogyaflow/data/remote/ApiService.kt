package com.example.aarogyaflow.data.remote

import com.example.aarogyaflow.data.remote.models.*
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface ApiService {
    @POST("identity/mobile/request-otp")
    suspend fun requestMobileOtp(@Body request: MobileOtpRequest): Response<MobileOtpResponse>

    @POST("identity/mobile/verify-otp")
    suspend fun verifyMobileOtp(@Body request: MobileOtpVerify): Response<VerifyOtpResponse>

    @POST("intake/message")
    suspend fun processIntakeMessage(@Body request: IntakeMessageRequest): Response<IntakeMessageResponse>

    @GET("intake/questions")
    suspend fun getIntakeQuestions(@Query("language") language: String = "en"): Response<IntakeQuestionsResponse>

    @POST("documents/upload")
    suspend fun uploadDocument(@Body request: DocumentUploadJsonRequest): Response<DocumentUploadResponse>
}

