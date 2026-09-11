package com.example.aarogyaflow.feature.consultation

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun AyushBodyConstitutionScreen(
    assessmentState: AyushAssessmentState,
    onBackClick: () -> Unit,
    onContinueClick: (constitution: String) -> Unit
) {
    val ayushPrimary = Color(0xFF8D6E63)
    val ayushLight = Color(0xFFFBE9E7)
    val ayushDark = Color(0xFF5D4037)
    val textHeading = Color(0xFF1E293B)
    val textBody = Color(0xFF475569)
    val textMuted = Color(0xFF94A3B8)
    val borderLight = Color(0xFFE2E8F0)

    var selectedConstitution by remember { mutableStateOf(assessmentState.bodyConstitution) }
    val isValid = selectedConstitution.isNotBlank()

    val constitutions = listOf(
        ConstitutionOption(
            id = "vata",
            name = "Vata (Air & Space)",
            description = "Light, dry, cold, mobile. Creative, energetic, prone to anxiety and digestive irregularity.",
            iconRes = R.drawable.ic_wind
        ),
        ConstitutionOption(
            id = "pitta",
            name = "Pitta (Fire & Water)",
            description = "Hot, sharp, light, oily. Intelligent, driven, prone to inflammation and acidity.",
            iconRes = R.drawable.ic_fire
        ),
        ConstitutionOption(
            id = "kapha",
            name = "Kapha (Earth & Water)",
            description = "Heavy, slow, cool, stable. Calm, nurturing, prone to congestion and weight gain.",
            iconRes = R.drawable.ic_water_drop
        ),
        ConstitutionOption(
            id = "vata_pitta",
            name = "Vata-Pitta",
            description = "Mixed: Creative and driven. Variable digestion, prone to stress and burnout.",
            iconRes = R.drawable.ic_wind
        ),
        ConstitutionOption(
            id = "pitta_kapha",
            name = "Pitta-Kapha",
            description = "Mixed: Strong and steady. Good endurance, prone to metabolic issues.",
            iconRes = R.drawable.ic_fire
        ),
        ConstitutionOption(
            id = "kapha_vata",
            name = "Kapha-Vata",
            description = "Mixed: Stable yet variable. Prone to respiratory and joint issues.",
            iconRes = R.drawable.ic_water_drop
        ),
        ConstitutionOption(
            id = "tridosha",
            name = "Tridoshic (Balanced)",
            description = "Relatively balanced Vata, Pitta, Kapha. Good health when maintaining balance.",
            iconRes = R.drawable.ic_balance
        ),
        ConstitutionOption(
            id = "unsure",
            name = "I'm not sure",
            description = "I don't know my constitution. The Vaidya will help assess it.",
            iconRes = R.drawable.ic_help_circle
        )
    )

    Scaffold(
        containerColor = Color(0xFFF8FAFC),
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Box(
                    modifier = Modifier
                        .clickable(onClick = onBackClick)
                        .padding(4.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_chevron_left),
                        contentDescription = "Go back",
                        tint = Color(0xFF334155),
                        modifier = Modifier.size(22.dp)
                    )
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(ayushDark),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_aarogyaflow_logo),
                            contentDescription = "AarogyaFlow logo",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                    Text(
                        text = "AarogyaFlow",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0F172A)
                    )
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF8FAFC))
                .padding(paddingValues)
                .padding(horizontal = 20.dp, vertical = 16.dp)
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Progress indicator
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                ProgressStep(1, 5, false, ayushDark)
                ProgressStep(2, 5, true, ayushDark)
                ProgressStep(3, 5, false, ayushDark)
                ProgressStep(4, 5, false, ayushDark)
                ProgressStep(5, 5, false, ayushDark)
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Icon Badge
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .background(ayushDark, RoundedCornerShape(18.dp))
                    .shadow(2.dp, RoundedCornerShape(18.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_user_avatar),
                    contentDescription = null,
                    tint = Color(0xFFFBE9E7),
                    modifier = Modifier.size(28.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Title
            Text(
                text = "Body Constitution (Prakriti)",
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF0F2438),
                letterSpacing = (-0.3).sp,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Select the constitution type that best describes your natural tendencies. If unsure, choose \"I'm not sure.\"",
                fontSize = 13.5.sp,
                color = textBody,
                textAlign = TextAlign.Center,
                lineHeight = 18.sp,
                modifier = Modifier.padding(horizontal = 8.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Constitution Options
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                constitutions.forEach { option ->
                    val isSelected = selectedConstitution == option.id
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.White, RoundedCornerShape(16.dp))
                            .border(
                                width = if (isSelected) 2.dp else 1.dp,
                                color = if (isSelected) ayushDark else borderLight,
                                shape = RoundedCornerShape(16.dp)
                            )
                            .shadow(if (isSelected) 2.dp else 1.dp, RoundedCornerShape(16.dp))
                            .clickable { selectedConstitution = option.id }
                            .padding(16.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(48.dp)
                                    .background(if (isSelected) ayushLight else Color(0xFFF5F5F5), RoundedCornerShape(12.dp))
                                    .border(1.dp, if (isSelected) ayushDark else Color(0xFFE0E0E0), RoundedCornerShape(12.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    painter = painterResource(id = option.iconRes),
                                    contentDescription = null,
                                    tint = if (isSelected) ayushDark else textMuted,
                                    modifier = Modifier.size(24.dp)
                                )
                            }

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = option.name,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isSelected) ayushDark else textHeading
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = option.description,
                                    fontSize = 12.sp,
                                    color = textBody,
                                    lineHeight = 16.sp
                                )
                            }

                            if (isSelected) {
                                Box(
                                    modifier = Modifier
                                        .size(24.dp)
                                        .background(ayushDark, CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        painter = painterResource(id = R.drawable.ic_check_mark),
                                        contentDescription = "Selected",
                                        tint = Color.White,
                                        modifier = Modifier.size(14.dp)
                                    )
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Action Button
            Button(
                onClick = { if (isValid) onContinueClick(selectedConstitution) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isValid) ayushDark else Color(0xFF94A3B8),
                    contentColor = Color.White
                ),
                elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp),
                enabled = isValid
            ) {
                Text(
                    text = "Continue",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 0.5.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Step 2 of 5: Body Constitution",
                fontSize = 11.sp,
                color = textMuted,
                textAlign = TextAlign.Center
            )
        }
    }
}

data class ConstitutionOption(
    val id: String,
    val name: String,
    val description: String,
    val iconRes: Int
)

@Composable
private fun ProgressStep(step: Int, total: Int, isActive: Boolean, activeColor: Color) {
    val inactiveColor = Color(0xFFE2E8F0)
    val completedColor = activeColor
    val isCompleted = false // Would need to track completion

    Row(
        modifier = Modifier.weight(1f, true),
        horizontalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(24.dp)
                .background(if (isActive) activeColor else inactiveColor, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "$step",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = if (isActive) Color.White else Color(0xFF94A3B8)
            )
        }
    }
}