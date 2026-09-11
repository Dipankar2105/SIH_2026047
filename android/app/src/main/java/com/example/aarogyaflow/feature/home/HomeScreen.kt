package com.example.aarogyaflow.feature.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun HomeScreen(
    onNotificationsClick: () -> Unit,
    onAboutYouClick: () -> Unit,
    onStartConsultationClick: () -> Unit,
    onHealthRecordsClick: () -> Unit,
    onAppointmentsClick: () -> Unit,
    onFamilyMembersClick: () -> Unit,
    onPrescriptionsClick: () -> Unit,
    onVitalsClick: () -> Unit
) {
    // Exact Stitch color tokens for Home (home_aarogyaflow)
    val bgLight = Color(0xFFF5F8F9)
    val brandTealDark = Color(0xFF015C49)
    val iconBadgeBg = Color(0xFFEAF5F2)
    val brandTealAccent = Color(0xFF0A735E)
    val textHeading = Color(0xFF111827)
    val textSubtitle = Color(0xFF4B5563)
    val textMuted = Color(0xFF6B7280)
    val borderLight = Color(0xFFE5E7EB)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bgLight)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
        ) {
            // Top Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Brand Logo & Name
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_aarogyaflow_logo),
                        contentDescription = "AarogyaFlow logo",
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                    )
                    Text(
                        text = "AarogyaFlow",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading,
                        letterSpacing = (-0.3).sp
                    )
                }

                // Right Controls: Language Selector, Audio, Notifications Bell
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Language button
                    Row(
                        modifier = Modifier
                            .background(Color.White.copy(alpha = 0.9f), RoundedCornerShape(20.dp))
                            .border(1.dp, Color(0xFFD1D5DB), RoundedCornerShape(20.dp))
                            .padding(horizontal = 10.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_globe),
                            contentDescription = "Language",
                            tint = Color(0xFF6B7280),
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = "EN",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF374151)
                        )
                    }

                    // Audio Text-to-speech button
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) { /* Audio TTS handler */ },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_volume_speaker),
                            contentDescription = "Listen",
                            tint = Color(0xFF4B5563),
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // Notification bell button
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) { onNotificationsClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_bell),
                            contentDescription = "Notifications",
                            tint = Color(0xFF4B5563),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }

            // Main Scrollable Content Area
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 6.dp)
            ) {
                // User Greeting Section
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 4.dp, bottom = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Avatar with gradient border
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .background(
                                brush = Brush.linearGradient(
                                    colors = listOf(Color(0xFF99F6E4), Color(0xFF34D399))
                                ),
                                shape = CircleShape
                            )
                            .padding(2.5.dp)
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) { onAboutYouClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxSize()
                                .background(Color(0xFFECFDF5), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "RS",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = brandTealAccent
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(14.dp))

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "Good morning,",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Normal,
                            color = textMuted
                        )
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Rahul",
                                fontSize = 20.sp,
                                fontWeight = FontWeight.Bold,
                                color = textHeading,
                                letterSpacing = (-0.3).sp
                            )
                            // "About You" pill button
                            Row(
                                modifier = Modifier
                                    .background(iconBadgeBg, RoundedCornerShape(16.dp))
                                    .border(1.dp, Color(0xFFBCE3DA), RoundedCornerShape(16.dp))
                                    .clickable(
                                        interactionSource = remember { MutableInteractionSource() },
                                        indication = null
                                    ) { onAboutYouClick() }
                                    .padding(horizontal = 10.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = "About You",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = brandTealAccent
                                )
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_chevron_right_small),
                                    contentDescription = "Go to About You",
                                    tint = brandTealAccent,
                                    modifier = Modifier.size(12.dp)
                                )
                            }
                        }
                    }
                }

                Text(
                    text = "How can we help you today?",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    color = textSubtitle
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Primary Hero Card ("Start Consultation")
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(6.dp, RoundedCornerShape(20.dp), spotColor = brandTealDark)
                        .background(brandTealDark, RoundedCornerShape(20.dp))
                        .padding(20.dp)
                ) {
                    Row(verticalAlignment = Alignment.Top) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .background(Color.White.copy(alpha = 0.12f), RoundedCornerShape(14.dp))
                                .border(1.dp, Color.White.copy(alpha = 0.15f), RoundedCornerShape(14.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_clipboard_check),
                                contentDescription = "Consultation",
                                tint = Color(0xFFA7F3D0),
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Start Consultation",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Tell us what's wrong and share your health history.",
                                fontSize = 12.sp,
                                color = Color(0xCCE6F4F1),
                                lineHeight = 17.sp
                            )
                            Spacer(modifier = Modifier.height(16.dp))
                            Row(
                                modifier = Modifier
                                    .background(Color.White.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                                    .border(1.dp, Color.White.copy(alpha = 0.12f), RoundedCornerShape(12.dp))
                                    .clickable(
                                        interactionSource = remember { MutableInteractionSource() },
                                        indication = null
                                    ) { onStartConsultationClick() }
                                    .padding(horizontal = 16.dp, vertical = 8.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = "Begin",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color.White
                                )
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_chevron_right_small),
                                    contentDescription = "Begin Consultation",
                                    tint = Color.White,
                                    modifier = Modifier.size(12.dp)
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Secondary Actions List
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    SecondaryActionCard(
                        title = "My Health Records",
                        subtitle = "Reports, prescriptions and previous visits.",
                        iconRes = R.drawable.ic_document_text,
                        onClick = onHealthRecordsClick
                    )
                    SecondaryActionCard(
                        title = "Appointments / Queue",
                        subtitle = "Your appointment or hospital queue status.",
                        iconRes = R.drawable.ic_calendar,
                        onClick = onAppointmentsClick
                    )
                    SecondaryActionCard(
                        title = "Family Members",
                        subtitle = "Manage your linked family members",
                        iconRes = R.drawable.ic_users_family,
                        onClick = onFamilyMembersClick
                    )
                    SecondaryActionCard(
                        title = "Prescriptions & Tests",
                        subtitle = "Medicines and recommended diagnostics",
                        iconRes = R.drawable.ic_pills,
                        onClick = onPrescriptionsClick
                    )
                    SecondaryActionCard(
                        title = "Vitals",
                        subtitle = "Track and record your vital signs",
                        iconRes = R.drawable.ic_heart_capsule,
                        onClick = onVitalsClick
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Recent Activity Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(1.dp, RoundedCornerShape(16.dp))
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .border(1.dp, borderLight, RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Column {
                        Text(
                            text = "RECENT ACTIVITY",
                            fontSize = 10.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF9CA3AF),
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Your health activity will appear here after your first consultation.",
                            fontSize = 12.sp,
                            color = textMuted,
                            lineHeight = 18.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(28.dp))
            }
        }
    }
}

@Composable
private fun SecondaryActionCard(
    title: String,
    subtitle: String,
    iconRes: Int,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(1.dp, RoundedCornerShape(16.dp))
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, Color(0xFFE5E7EB), RoundedCornerShape(16.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.weight(1f)
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(Color(0xFFEAF5F2), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = iconRes),
                    contentDescription = null,
                    tint = Color(0xFF0A735E),
                    modifier = Modifier.size(22.dp)
                )
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column {
                Text(
                    text = title,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF111827)
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = subtitle,
                    fontSize = 11.5.sp,
                    color = Color(0xFF6B7280)
                )
            }
        }
        Icon(
            painter = painterResource(id = R.drawable.ic_chevron_right_small),
            contentDescription = "Navigate",
            tint = Color(0xFF9CA3AF),
            modifier = Modifier.size(16.dp)
        )
    }
}

@Preview(showBackground = true)
@Composable
fun HomeScreenPreview() {
    MaterialTheme {
        HomeScreen(
            onNotificationsClick = {},
            onAboutYouClick = {},
            onStartConsultationClick = {},
            onHealthRecordsClick = {},
            onAppointmentsClick = {},
            onFamilyMembersClick = {},
            onPrescriptionsClick = {},
            onVitalsClick = {}
        )
    }
}
