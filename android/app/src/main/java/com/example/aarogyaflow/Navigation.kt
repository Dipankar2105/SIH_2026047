package com.example.aarogyaflow

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation3.runtime.NavKey
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import com.example.aarogyaflow.data.remote.ApiService
import com.example.aarogyaflow.feature.aboutyou.AboutYouScreen
import com.example.aarogyaflow.feature.aboutyou.EditHealthDetailsScreen
import com.example.aarogyaflow.feature.aboutyou.HealthData
import com.example.aarogyaflow.feature.auth.AbhaIdScreen
import com.example.aarogyaflow.feature.auth.ConsentScreen
import com.example.aarogyaflow.feature.auth.VerifyMobileScreen
import com.example.aarogyaflow.feature.consultation.AllopathicWelcomeScreen
import com.example.aarogyaflow.feature.consultation.ChooseConsultationScreen
import com.example.aarogyaflow.feature.consultation.ConsultationSuccessScreen
import com.example.aarogyaflow.feature.consultation.RedFlagTriageScreen
import com.example.aarogyaflow.feature.consultation.UploadReportsScreen
import com.example.aarogyaflow.feature.family.AddFamilyMemberScreen
import com.example.aarogyaflow.feature.family.FamilyMemberDisclaimerScreen
import com.example.aarogyaflow.feature.family.FamilyMember
import com.example.aarogyaflow.feature.family.FamilyMemberOtpScreen
import com.example.aarogyaflow.feature.family.FamilyMemberSummaryScreen
import com.example.aarogyaflow.feature.family.FamilyMembersScreen
import com.example.aarogyaflow.feature.home.HomeScreen
import com.example.aarogyaflow.feature.notifications.NotificationsScreen
import com.example.aarogyaflow.feature.profile.EditProfileScreen
import com.example.aarogyaflow.feature.profile.ProfileData
import com.example.aarogyaflow.feature.profile.ProfileScreen
import kotlinx.coroutines.launch
import kotlinx.serialization.Contextual
import kotlinx.serialization.Serializable

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
data object AddFamilyMember : NavKey

@Serializable
data class FamilyMemberAbhaId(val abhaId: String, val relationship: String) : NavKey

@Serializable
data class FamilyMemberOtp(val abhaId: String, val relationship: String) : NavKey

@Serializable
data class FamilyMemberSummary(@Contextual val member: FamilyMember) : NavKey

@Serializable
data object AboutYou : NavKey

@Serializable
data object EditHealthDetails : NavKey

@Serializable
data object Notifications : NavKey

@Serializable
data object Profile : NavKey

@Serializable
data object EditProfile : NavKey

@Composable
fun MainNavigation(apiService: ApiService) {
  val backStack = rememberNavBackStack(AbhaId)
  val scope = rememberCoroutineScope()
  val snackbarHostState = remember { SnackbarHostState() }

  // In-memory demo state for Profile & Health Details
  var profileState by remember { mutableStateOf(ProfileData()) }
  var healthState by remember { mutableStateOf(HealthData()) }

  // Family members demo state
  var familyState by remember { mutableStateOf(
    listOf(
      FamilyMember(
        id = "1",
        name = "Sunita Sharma",
        relationship = "Mother",
        age = 58,
        abhaNumber = "91-8842-1920-4102",
        avatarColor = "#FDF2F8",
        avatarInitials = "SS",
        healthSnapshot = "Hypertension (Managed) • Next BP Check in 4 days",
        activeRxCount = 2,
        statusBadge = "2 Active Rx",
        statusBadgeColor = "#0F766E",
        hasAlert = false
      ),
      FamilyMember(
        id = "2",
        name = "Rajesh Sharma",
        relationship = "Father",
        age = 62,
        abhaNumber = "91-3310-9281-7721",
        avatarColor = "#FFFBEB",
        avatarInitials = "RS",
        healthSnapshot = "Type 2 Diabetes • HbA1c: 6.8 (Normal)",
        activeRxCount = 0,
        statusBadge = "OPD Due",
        statusBadgeColor = "#64748B",
        hasAlert = false
      ),
      FamilyMember(
        id = "3",
        name = "Priya Sharma",
        relationship = "Spouse",
        age = 30,
        abhaNumber = "91-5541-6209-1148",
        avatarColor = "#F0FDF9",
        avatarInitials = "PS",
        healthSnapshot = "Allergies: Dust & Pollen • Flu Vaccine Done",
        activeRxCount = 0,
        statusBadge = "Vaccinated",
        statusBadgeColor = "#059669",
        hasAlert = false
      )
    )
  )}

  NavDisplay(
    backStack = backStack,
    onBack = { 
      if (backStack.size > 1) {
        backStack.removeLastOrNull()
      }
    },
    entryProvider =
      entryProvider {
        entry<AbhaId> {
          AbhaIdScreen(
            onContinueClick = { mobileOrAbha -> 
                backStack.add(VerifyMobile("demo-txn", mobileOrAbha))
            },
            onCreateAbhaClick = { /* Handle create ABHA */ },
            onLoginClick = { /* Handle login */ }
          )
        }
        entry<VerifyMobile> { key ->
            VerifyMobileScreen(
                mobileNumber = if (key.mobile.isNotBlank()) "+91 ••••••${key.mobile.takeLast(4)}" else "+91 ••••••8901",
                onBackClick = { backStack.removeLastOrNull() },
                onVerifyClick = { otp -> 
                    backStack.add(Consent)
                },
                onResendClick = { /* Resend API call */ }
            )
        }
        entry<Consent> {
            ConsentScreen(
                onConsentClick = { backStack.add(Home) },
                onCancelClick = { backStack.removeLastOrNull() }
            )
        }
        entry<Home> {
            HomeScreen(
                onNotificationsClick = { backStack.add(Notifications) },
                onAboutYouClick = { backStack.add(AboutYou) },
                onStartConsultationClick = { backStack.add(ChooseConsultation) },
                onHealthRecordsClick = { backStack.add(HealthRecords) },
                onAppointmentsClick = { backStack.add(Appointments) },
                onFamilyMembersClick = { backStack.add(FamilyMembers) }
            )
        }
        entry<Notifications> {
            NotificationsScreen(
                onBackClick = { backStack.removeLastOrNull() }
            )
        }
        entry<AboutYou> {
            AboutYouScreen(
                profileData = profileState,
                healthData = healthState,
                familyMembers = familyState,
                onBackClick = { backStack.removeLastOrNull() },
                onEditProfileClick = { backStack.add(EditProfile) },
                onEditHealthDetailsClick = { backStack.add(EditHealthDetails) },
                onFamilyMembersClick = { backStack.add(FamilyMembers) }
            )
        }
        entry<EditHealthDetails> {
            EditHealthDetailsScreen(
                currentHealthData = healthState,
                onBackClick = { backStack.removeLastOrNull() },
                onSaveHealthData = { updated ->
                    healthState = updated
                    backStack.removeLastOrNull()
                }
            )
        }
        entry<Profile> {
            ProfileScreen(
                profileData = profileState,
                onBackClick = { backStack.removeLastOrNull() },
                onEditProfileClick = { backStack.add(EditProfile) },
                onAboutYouClick = { backStack.add(AboutYou) },
                onFamilyMembersClick = { backStack.add(FamilyMembers) }
            )
        }
        entry<EditProfile> {
            EditProfileScreen(
                currentProfile = profileState,
                onBackClick = { backStack.removeLastOrNull() },
                onSaveProfile = { updated ->
                    profileState = updated
                    backStack.removeLastOrNull()
                }
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
                onBackClick = { backStack.removeLastOrNull() },
                onProceedToUpload = { backStack.add(UploadReports) },
                onRedFlagDetected = { reason -> backStack.add(RedFlagTriage(reason)) }
            )
        }
        entry<RedFlagTriage> { key ->
            RedFlagTriageScreen(
                triggerMessage = key.triggerMessage,
                onBackClick = { backStack.removeLastOrNull() },
                onBypassToUpload = { backStack.add(UploadReports) }
            )
        }
        entry<UploadReports> {
            UploadReportsScreen(
                apiService = apiService,
                onBackClick = { backStack.removeLastOrNull() },
                onContinueClick = { backStack.add(ConsultationSuccess("42", "15")) }
            )
        }
        entry<ConsultationSuccess> { key ->
            ConsultationSuccessScreen(
                appointmentNumber = key.appointmentNumber,
                estimatedWaitMinutes = key.waitMinutes,
                onViewRecordsClick = { backStack.add(HealthRecords) },
                onBackToHomeClick = { 
                    while (backStack.size > 1) {
                        backStack.removeLastOrNull()
                    }
                    if (backStack.isEmpty() || backStack.last() != Home) {
                        backStack.clear()
                        backStack.add(Home)
                    }
                }
            )
        }
        entry<HealthRecords> { PlaceholderScreen("My Health Records") { backStack.removeLastOrNull() } }
        entry<Appointments> { PlaceholderScreen("Appointments / Queue") { backStack.removeLastOrNull() } }
        entry<FamilyMembers> {
            FamilyMembersScreen(
                snackbarHostState = snackbarHostState,
                onBackClick = { backStack.removeLastOrNull() },
                onAddFamilyMemberClick = { backStack.add(AddFamilyMember) },
                onMemberClick = { member -> backStack.add(FamilyMemberSummary(member)) }
            )
        }
        entry<AddFamilyMember> {
            AddFamilyMemberScreen(
                onBackClick = { backStack.removeLastOrNull() },
                onContinueClick = { relationship, abhaId ->
                    backStack.add(FamilyMemberAbhaId(abhaId = abhaId, relationship = relationship))
                },
                onCancelClick = { backStack.removeLastOrNull() }
            )
        }
        entry<FamilyMemberAbhaId> { key ->
            FamilyMemberDisclaimerScreen(
                relationship = key.relationship,
                abhaId = key.abhaId,
                onBackClick = { backStack.removeLastOrNull() },
                onSendOtpClick = { backStack.add(FamilyMemberOtp(abhaId = key.abhaId, relationship = key.relationship)) },
                onCancelClick = {
                    while (backStack.lastOrNull() is FamilyMemberAbhaId ||
                        backStack.lastOrNull() is AddFamilyMember
                    ) {
                        backStack.removeLastOrNull()
                    }
                }
            )
        }
        entry<FamilyMemberOtp> { key ->
            FamilyMemberOtpScreen(
                abhaId = key.abhaId,
                relationship = key.relationship,
                onBackClick = { backStack.removeLastOrNull() },
                onVerifyClick = {
                    val newMember = FamilyMember(
                        id = "${familyState.size + 1}",
                        name = key.relationship.replaceFirstChar { it.uppercase() },
                        relationship = key.relationship,
                        age = 0,
                        abhaNumber = key.abhaId,
                        avatarColor = "#F0FDF9",
                        avatarInitials = key.relationship.take(2).uppercase(),
                        healthSnapshot = "Health records synced via ABDM",
                        activeRxCount = 0,
                        statusBadge = "Newly Linked",
                        statusBadgeColor = "#059669"
                    )
                    familyState = familyState + newMember
                    // Pop OTP and Disclaimer, return to Family Members
                    while (backStack.lastOrNull() is FamilyMemberOtp ||
                        backStack.lastOrNull() is FamilyMemberAbhaId ||
                        backStack.lastOrNull() is AddFamilyMember
                    ) {
                        backStack.removeLastOrNull()
                    }
                    backStack.add(FamilyMembers)
                    scope.launch {
                        snackbarHostState.showSnackbar("Family member added successfully")
                    }
                },
                onResendClick = { /* Resend OTP API call */ }
            )
        }
        entry<FamilyMemberSummary> { key ->
            FamilyMemberSummaryScreen(
                member = key.member,
                onBackClick = { backStack.removeLastOrNull() },
                onEditClick = { /* Edit member details */ },
                onViewRecordsClick = { backStack.add(HealthRecords) },
                onStartConsultationClick = { backStack.add(ChooseConsultation) },
                onCallDoctorClick = { /* Call doctor action */ },
                onEmergencyClick = { /* Emergency action */ }
            )
        }
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