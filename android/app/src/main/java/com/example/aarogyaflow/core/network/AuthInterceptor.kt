package com.example.aarogyaflow.core.network

import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthInterceptor @Inject constructor() : Interceptor {
    var token: String? = null
    var patientId: String? = null

    override fun intercept(chain: Interceptor.Chain): Response {
        val request = chain.request()
        val builder = request.newBuilder()
        if (!token.isNullOrBlank()) {
            builder.addHeader("Authorization", "Bearer $token")
        } else {
            // Fallback header for development / kiosk operator authentication
            builder.addHeader("X-User-Role", "kiosk_operator")
        }
        if (!patientId.isNullOrBlank()) {
            builder.addHeader("X-User-Id", patientId!!)
        }
        return chain.proceed(builder.build())
    }
}
