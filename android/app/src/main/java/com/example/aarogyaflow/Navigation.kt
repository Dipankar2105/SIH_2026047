package com.example.aarogyaflow

import com.example.aarogyaflow.feature.consultation.ChooseConsultationScreen
import com.example.aarogyaflow.feature.consultation.AllopathicWelcomeScreen
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.safeDrawingPadding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import com.example.aarogyaflow.feature.auth.AbhaIdScreen
import kotlinx.serialization.Serializable
import androidx.navigation3.runtime.NavKey
import com.example.aarogyaflow.data.remote.ApiService
import com.example.aarogyaflow.data.remote.models.MobileOtpRequest
import com.example.aarogyaflow.data.remote.models.MobileOtpVerify
import kotlinx.coroutines.launch
import android.util.Log

@Serializable
data object AbhaId : NavKey

@Serializable
data class VerifyMobile(val txnId: String, val mobile: String) : NavKey

@Serializable
data object Consent : NavKey

@Serializable
data object Home : NavKey

@Serializable
data object ChooseConsultation : NavKey

@Serializable
data object AllopathicWelcome : NavKey

@Serializable
data object AllopathicChat : NavKey

@Serializable
data class RedFlagTriage(val triggerMessage: String) : NavKey

@Serializable
data object UploadReports : NavKey

@Serializable
data class ConsultationSuccess(val appointmentNumber: String = "42", val waitMinutes: String = "15") : NavKey

@Serializable
data object HealthRecords : NavKey

@Serializable
data object Appointments : NavKey

@Serializable
data object FamilyMembers : NavKey

@Serializable
data object AboutYou : NavKey

@Serializable
data object Notifications : NavKey

@Composable
fun MainNavigation(apiService: ApiService) {
  val backStack = rememberNavBackStack(AbhaId)
  val scope = rememberCoroutineScope()

  NavDisplay(
    backStack = backStack,
    onBack = { backStack.removeLastOrNull() },
    entryProvider =
      entryProvider {
        entry<AbhaId> {
          AbhaIdScreen(
            onContinueClick = { mobileOrAbha -> 
                scope.launch {
                    try {
                        val res = apiService.requestMobileOtp(MobileOtpRequest(mobileOrAbha))
                        if(res.isSuccessful) {
                            backStack.add(VerifyMobile(res.body()?.txnId ?: "", mobileOrAbha))
                        }
                    } catch(e: Exception) { Log.e("API", "Error: $e") }
                }
            },
            onCreateAbhaClick = { /* Handle create ABHA */ },
            onLoginClick = { /* Handle login */ }
          )
        }
        entry<VerifyMobile> { key ->
            com.example.aarogyaflow.feature.auth.VerifyMobileScreen(
                onBackClick = { backStack.removeLastOrNull() },
                onVerifyClick = { otp -> 
                    scope.launch {
                        try {
                            val res = apiService.verifyMobileOtp(MobileOtpVerify(key.txnId, otp))
                            if(res.isSuccessful) {
                                backStack.add(Consent)
                            }
                        } catch(e: Exception) { Log.e("API", "Error: $e") }
                    }
                },
                onResendClick = { /* Resend API call */ }
            )
        }
        entry<Consent> {
            com.example.aarogyaflow.feature.auth.ConsentScreen(
                onConsentClick = { backStack.add(Home) },
                onCancelClick = { backStack.removeLastOrNull() }
            )
        }
        entry<Home> {
            com.example.aarogyaflow.feature.home.HomeScreen(
                onNotificationsClick = { backStack.add(Notifications) },
                onAboutYouClick = { backStack.add(AboutYou) },
                onStartConsultationClick = { backStack.add(ChooseConsultation) },
                onHealthRecordsClick = { backStack.add(HealthRecords) },
                onAppointmentsClick = { backStack.add(Appointments) },
                onFamilyMembersClick = { backStack.add(FamilyMembers) }
            )
        }
        entry<ChooseConsultation> {
            ChooseConsultationScreen(
                onBackClick = { backStack.removeLastOrNull() },
                onAllopathyClick = { backStack.add(AllopathicWelcome) },
                onAyushClick = { /* AYUSH flow */ }
            )
        }
        entry<AllopathicWelcome> {
            AllopathicWelcomeScreen(
                onBackClick = { backStack.removeLastOrNull() },
                onStartChatClick = { backStack.add(AllopathicChat) }
            )
        }
        entry<AllopathicChat> {
            com.example.aarogyaflow.feature.consultation.AllopathicChatScreen(
                apiService = apiService,
                onBackClick = { backStack.removeLastOrNull() },
                onProceedToUpload = { backStack.add(UploadReports) },
                onRedFlagDetected = { reason -> backStack.add(RedFlagTriage(reason)) }
            )
        }
        entry<RedFlagTriage> { key ->
            com.example.aarogyaflow.feature.consultation.RedFlagTriageScreen(
                triggerMessage = key.triggerMessage,
                onBackClick = { backStack.removeLastOrNull() },
                onBypassToUpload = { backStack.add(UploadReports) }
            )
        }
        entry<UploadReports> {
            com.example.aarogyaflow.feature.consultation.UploadReportsScreen(
                apiService = apiService,
                onBackClick = { backStack.removeLastOrNull() },
                onContinueClick = { backStack.add(ConsultationSuccess("42", "15")) }
            )
        }
        entry<ConsultationSuccess> { key ->
            com.example.aarogyaflow.feature.consultation.ConsultationSuccessScreen(
                appointmentNumber = key.appointmentNumber,
                estimatedWaitMinutes = key.waitMinutes,
                onViewRecordsClick = { backStack.add(HealthRecords) },
                onBackToHomeClick = { backStack.add(Home) }
            )
        }
        entry<HealthRecords> { PlaceholderScreen("My Health Records") { backStack.removeLastOrNull() } }
        entry<Appointments> { PlaceholderScreen("Appointments / Queue") { backStack.removeLastOrNull() } }
        entry<FamilyMembers> { PlaceholderScreen("Family Members") { backStack.removeLastOrNull() } }
        entry<AboutYou> { PlaceholderScreen("About You") { backStack.removeLastOrNull() } }
        entry<Notifications> { PlaceholderScreen("Notifications") { backStack.removeLastOrNull() } }
      },
  )
}

@Composable
fun PlaceholderScreen(title: String, onBack: () -> Unit) {
    androidx.compose.foundation.layout.Column(
        modifier = androidx.compose.ui.Modifier.fillMaxSize().padding(16.dp)
    ) {
        androidx.compose.material3.Text(title, style = androidx.compose.material3.MaterialTheme.typography.headlineMedium)
        androidx.compose.foundation.layout.Spacer(modifier = androidx.compose.ui.Modifier.height(16.dp))
        androidx.compose.material3.Button(onClick = onBack) {
            androidx.compose.material3.Text("Go Back")
        }
    }
}
