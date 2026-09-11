package com.example.aarogyaflow.feature.aboutyou

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
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R
import com.example.aarogyaflow.feature.family.FamilyMember
import com.example.aarogyaflow.feature.profile.ProfileData
import java.time.format.DateTimeFormatter

@Composable
fun AboutYouScreen(
    profileData: ProfileData = ProfileData(),
    healthData: HealthData = HealthData(),
    familyMembers: List<FamilyMember> = emptyList(),
    onBackClick: () -> Unit,
    onEditProfileClick: () -> Unit,
    onEditHealthDetailsClick: () -> Unit,
    onFamilyMembersClick: () -> Unit = {}
) {
    // Exact Stitch color tokens for About You (about_you_health_summary)
    val bgLight = Color(0xFFF8FAFC)
    val brandTeal = Color(0xFF00594C)
    val brandTealDark = Color(0xFF044238)
    val textHeading = Color(0xFF1E293B)
    val textMuted = Color(0xFF64748B)
    val borderLight = Color(0xFFE2E8F0)

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
            // Header Navigation Bar (Stitch: Back, Logo + Title, Listen action ONLY - No Profile button)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.95f))
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Back Button
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(Color(0xFFF1F5F9), CircleShape)
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) { onBackClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_chevron_left),
                            contentDescription = "Back",
                            tint = Color(0xFF475569),
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    // Logo + Title
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_aarogyaflow_logo),
                            contentDescription = "AarogyaFlow Logo",
                            modifier = Modifier
                                .size(26.dp)
                                .clip(RoundedCornerShape(6.dp))
                        )
                        Column {
                            Text(
                                text = "About You",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = textHeading
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .background(Color(0xFF10B981), CircleShape)
                                )
                                Text(
                                    text = "Health Summary",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF047857)
                                )
                            }
                        }
                    }
                }

                // Right Action: Listen action pill ONLY (matching Stitch design)
                Row(
                    modifier = Modifier
                        .background(Color.White, RoundedCornerShape(20.dp))
                        .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(20.dp))
                        .padding(horizontal = 10.dp, vertical = 5.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_volume_speaker),
                        contentDescription = "Listen",
                        tint = Color(0xFF64748B),
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = "Listen",
                        fontSize = 11.5.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF475569)
                    )
                }
            }

            HorizontalDivider(color = borderLight)

            // Scrollable Main Content
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Patient Summary Hero Card (Contains Edit Profile Action)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(4.dp, RoundedCornerShape(20.dp))
                        .background(
                            brush = Brush.linearGradient(
                                colors = listOf(brandTeal, brandTealDark)
                            ),
                            shape = RoundedCornerShape(20.dp)
                        )
                        .padding(16.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                // Avatar circle
                                Box(
                                    modifier = Modifier
                                        .size(48.dp)
                                        .background(Color(0xFF064E3B), CircleShape)
                                        .border(2.dp, Color(0xFF6EE7B7).copy(alpha = 0.4f), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = profileData.avatarInitials,
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFD1FAE5)
                                    )
                                }

                                Column {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(
                                            text = profileData.fullName,
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color.White
                                        )
                                        Box(
                                            modifier = Modifier
                                                .background(Color(0x3334D399), RoundedCornerShape(4.dp))
                                                .padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Text(
                                                text = "${profileData.gender.uppercase()}, ${profileData.age}",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = Color(0xFFA7F3D0)
                                            )
                                        }
                                    }
                                    Text(
                                        text = "ABHA: ${profileData.abhaNumber}",
                                        fontSize = 12.sp,
                                        color = Color(0xFFA7F3D0).copy(alpha = 0.9f),
                                        modifier = Modifier.padding(top = 2.dp)
                                    )
                                    Row(
                                        modifier = Modifier
                                            .padding(top = 4.dp)
                                            .background(Color.White.copy(alpha = 0.15f), RoundedCornerShape(12.dp))
                                            .padding(horizontal = 8.dp, vertical = 2.dp),
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Icon(
                                            painter = painterResource(id = R.drawable.ic_shield_check),
                                            contentDescription = null,
                                            tint = Color(0xFF6EE7B7),
                                            modifier = Modifier.size(12.dp)
                                        )
                                        Text(
                                            text = "Verified Patient Summary",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = Color.White
                                        )
                                    }
                                }
                            }

                            // Personal Profile Edit Button (opens EditProfileScreen)
                            Row(
                                modifier = Modifier
                                    .background(Color.White.copy(alpha = 0.12f), RoundedCornerShape(8.dp))
                                    .clickable(
                                        interactionSource = remember { MutableInteractionSource() },
                                        indication = null
                                    ) { onEditProfileClick() }
                                    .padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = "Edit",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFFCCFBF1)
                                )
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_edit_pencil),
                                    contentDescription = "Edit Profile",
                                    tint = Color(0xFFCCFBF1),
                                    modifier = Modifier.size(12.dp)
                                )
                            }
                        }

                        // Doctor Notice
                        Spacer(modifier = Modifier.height(12.dp))
                        HorizontalDivider(color = Color.White.copy(alpha = 0.15f))
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Available to your consulting physician during in-person and tele-OPD visits.",
                            fontSize = 11.sp,
                            color = Color(0xFFD1FAE5).copy(alpha = 0.9f),
                            lineHeight = 15.sp
                        )
                    }
                }

                // Linked Family Members Section
                CardSection(
                    title = "LINKED FAMILY MEMBERS",
                    headerTag = if (familyMembers.isEmpty()) null else "${familyMembers.size} Linked"
                ) {
                    if (familyMembers.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
                                .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
                                .padding(14.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .background(Color(0xFFE6F7F4), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        painter = painterResource(id = R.drawable.ic_users_family),
                                        contentDescription = null,
                                        tint = Color(0xFF0F766E),
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.height(8.dp))
                                Text(
                                    text = "No linked family members",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF334155)
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = "Tap Family Members from Home to link dependents.",
                                    fontSize = 10.5.sp,
                                    color = Color(0xFF64748B),
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                    lineHeight = 15.sp
                                )
                            }
                        }
                    } else {
                        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            familyMembers.forEach { member ->
                                LinkedFamilyMemberRow(
                                    member = member,
                                    onClick = onFamilyMembersClick
                                )
                            }
                        }
                    }
                }

                // 1. Basic Health Information Section
                CardSection(
                    title = "BASIC HEALTH INFORMATION",
                    headerTag = "Updated 2d ago"
                ) {
                    // 3 columns: Blood Group, Height & Wt, BMI
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        InfoMetricBox(
                            label = "BLOOD GROUP",
                            value = healthData.bloodGroup,
                            modifier = Modifier.weight(1f)
                        )
                        InfoMetricBox(
                            label = "HEIGHT & WT",
                            value = "${healthData.heightCm} cm • ${healthData.weightKg} kg",
                            modifier = Modifier.weight(1.2f)
                        )
                        val bmiColor = when (healthData.bmiStatus) {
                            "Normal" -> Color(0xFF047857)
                            "Underweight" -> Color(0xFF2563EB)
                            "Overweight" -> Color(0xFFD97706)
                            else -> Color(0xFFDC2626)
                        }
                        InfoMetricBox(
                            label = "BMI / STATUS",
                            value = "${healthData.bmi} (${healthData.bmiStatus})",
                            valueColor = bmiColor,
                            modifier = Modifier.weight(1.2f)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    // 2 columns: Blood Pressure, Pulse / SpO2
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .weight(1f)
                                .background(Color(0xFFF8FAFC), RoundedCornerShape(10.dp))
                                .border(1.dp, Color(0xFFF1F5F9), RoundedCornerShape(10.dp))
                                .padding(horizontal = 10.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Blood Pressure", fontSize = 11.sp, color = textMuted)
                            Text(healthData.bloodPressure, fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = textHeading)
                        }

                        Row(
                            modifier = Modifier
                                .weight(1f)
                                .background(Color(0xFFF8FAFC), RoundedCornerShape(10.dp))
                                .border(1.dp, Color(0xFFF1F5F9), RoundedCornerShape(10.dp))
                                .padding(horizontal = 10.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Pulse / SpO2", fontSize = 11.sp, color = textMuted)
                            Text("${healthData.pulseBpm} bpm • ${healthData.spO2Percent}%", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = textHeading)
                        }
                    }
                }

                // Vitals Section
                CardSection(
                    title = "VITALS",
                    headerTag = "Now",
                    headerTagBg = Color(0xFFF0FDFA),
                    headerTagColor = Color(0xFF0F766E)
                ) {
                    VitalsCard(vitals = healthData.vitals)
                }

                // 2. Recent Health Summary Section
                CardSection(
                    title = "RECENT HEALTH SUMMARY",
                    headerTag = "Today",
                    headerTagBg = Color(0xFFF0FDFA),
                    headerTagColor = Color(0xFF0F766E)
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFECFDF5).copy(alpha = 0.8f), RoundedCornerShape(12.dp))
                            .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Column {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(7.dp)
                                        .background(Color(0xFF10B981), CircleShape)
                                )
                                Text(
                                    text = "Symptom check: Upper Abdomen Cramping",
                                    fontSize = 12.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = textHeading
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Reported mild stomach cramping starting yesterday, accompanied by nausea. Flagged as moderate priority for upcoming OPD triage.",
                                fontSize = 11.5.sp,
                                color = Color(0xFF475569),
                                lineHeight = 16.sp
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                TagBadge("Upper Abdomen")
                                TagBadge("Started Yesterday")
                                TagBadge("Token #42")
                            }
                        }
                    }
                }

                // 3. Conditions & Medical History Section
                CardSection(
                    title = "CONDITIONS & MEDICAL HISTORY",
                    headerTag = "+ Add",
                    headerTagBg = Color(0xFFF0FDFA),
                    headerTagColor = Color(0xFF0F766E)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        healthData.conditions.forEach { condition ->
                            val statusBg = if (condition.status == "Active") Color(0xFFFEF3C7) else Color(0xFFF1F5F9)
                            val statusColor = if (condition.status == "Active") Color(0xFFB45309) else Color(0xFF475569)
                            ConditionItem(
                                title = condition.title,
                                subtitle = condition.subtitle,
                                statusTag = condition.status,
                                statusColor = statusColor,
                                statusBg = statusBg
                            )
                        }
                    }
                }

                // 4. Allergies Section
                CardSection(
                    title = "ALLERGIES",
                    headerTag = "${healthData.allergies.size} Known",
                    headerTagBg = Color(0xFFFFF1F2),
                    headerTagColor = Color(0xFFBE123C)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        healthData.allergies.forEach { allergy ->
                            val isDrug = allergy.type.equals("DRUG", ignoreCase = true)
                            val cardBg = if (isDrug) Color(0xFFFFF1F2).copy(alpha = 0.6f) else Color(0xFFFFFBEB).copy(alpha = 0.6f)
                            val cardBorder = if (isDrug) Color(0xFFFFE4E6) else Color(0xFFFEF3C7)
                            val titleColor = if (isDrug) Color(0xFF881337) else Color(0xFF78350F)
                            val tagBg = if (isDrug) Color(0xFFFFE4E6) else Color(0xFFFEF3C7)
                            val tagColor = if (isDrug) Color(0xFFBE123C) else Color(0xFFB45309)

                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .background(cardBg, RoundedCornerShape(10.dp))
                                    .border(1.dp, cardBorder, RoundedCornerShape(10.dp))
                                    .padding(10.dp)
                            ) {
                                Column {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(allergy.name, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = titleColor)
                                        Box(
                                            modifier = Modifier
                                                .background(tagBg, RoundedCornerShape(4.dp))
                                                .padding(horizontal = 4.dp, vertical = 1.dp)
                                        ) {
                                            Text(allergy.type.uppercase(), fontSize = 8.5.sp, fontWeight = FontWeight.Bold, color = tagColor)
                                        }
                                    }
                                    Spacer(modifier = Modifier.height(3.dp))
                                    Text(allergy.reaction, fontSize = 10.sp, color = textMuted)
                                }
                            }
                        }
                    }
                }

                // 5. Current Medications Section
                CardSection(
                    title = "CURRENT MEDICATIONS",
                    headerTag = "${healthData.medications.size} Ongoing"
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        healthData.medications.forEach { med ->
                            val iconRes = if (med.isAllopathy) R.drawable.ic_pills else R.drawable.ic_herbs
                            val badgeBg = if (med.isAllopathy) Color.White else Color(0xFFECFDF5)
                            val badgeColor = if (med.isAllopathy) Color(0xFF475569) else Color(0xFF047857)
                            MedicationItem(
                                name = med.name,
                                instruction = med.instruction,
                                badge = med.badge,
                                badgeBg = badgeBg,
                                badgeColor = badgeColor,
                                iconRes = iconRes
                            )
                        }
                    }
                }

                // 6. Important Health Information Section
                CardSection(title = "IMPORTANT HEALTH INFORMATION") {
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        HealthBullet("Emergency Contact:", " ${profileData.emergencyContactName} (${profileData.emergencyContactRelation}) • ${profileData.emergencyContactPhone}")
                        HealthBullet("Surgical History:", " Appendectomy (Laproscopic) in 2018 at City Hospital. No complications.")
                        HealthBullet("Vaccination Status:", " COVID-19 (3 doses completed), Tetanus Toxoid (Valid till 2028).")
                    }
                }

                // 7. Previous Consultations Section
                CardSection(title = "PREVIOUS CONSULTATIONS") {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        ConsultationHistoryItem(
                            doctor = "Dr. Sharma",
                            specialty = "General Medicine",
                            date = "City Hospital • 28 Aug 2026",
                            notes = "Diagnosis: Acute Dyspepsia • Prescription linked"
                        )
                        ConsultationHistoryItem(
                            doctor = "Dr. V. K. Shastri",
                            specialty = "Ayurveda OPD",
                            date = "Ayush Health Centre • 14 Aug 2026",
                            notes = "Pitta imbalance assessment • Diet plan linked"
                        )
                    }
                }

                // 8. Account & Profile Settings Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFF1F5F9).copy(alpha = 0.8f), RoundedCornerShape(16.dp))
                        .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(16.dp))
                        .padding(14.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Need to update contact details, address or ABHA login?",
                            fontSize = 11.5.sp,
                            color = Color(0xFF475569),
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = onEditProfileClick,
                            modifier = Modifier.fillMaxWidth(),
                            colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                            border = ButtonDefaults.outlinedButtonBorder,
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_user_avatar),
                                contentDescription = null,
                                tint = Color(0xFF475569),
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "Open Account & Profile Settings",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF334155)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))
            }

            // Bottom Actions Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.95f))
                    .border(width = 1.dp, color = borderLight)
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Share Button
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(Color.White, RoundedCornerShape(12.dp))
                        .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) { /* Share handler */ },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_share_nodes),
                        contentDescription = "Share",
                        tint = Color(0xFF475569),
                        modifier = Modifier.size(18.dp)
                    )
                }

                // Edit Health Details Button (opens EditHealthDetailsScreen)
                Button(
                    onClick = onEditHealthDetailsClick,
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = brandTeal,
                        contentColor = Color.White
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_edit_pencil),
                        contentDescription = null,
                        tint = Color(0xFFA7F3D0),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Edit Health Details",
                        fontSize = 12.5.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Done Button
                Box(
                    modifier = Modifier
                        .height(44.dp)
                        .background(Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) { onBackClick() }
                        .padding(horizontal = 16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Done",
                        fontSize = 12.5.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF334155)
                    )
                }
            }
        }
    }
}

@Composable
private fun CardSection(
    title: String,
    headerTag: String? = null,
    headerTagBg: Color = Color(0xFFF1F5F9),
    headerTagColor: Color = Color(0xFF64748B),
    content: @Composable ColumnScope.() -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(1.dp, RoundedCornerShape(16.dp))
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(16.dp))
            .padding(14.dp)
    ) {
        Column {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 10.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF64748B),
                    letterSpacing = 0.8.sp
                )
                if (headerTag != null) {
                    Box(
                        modifier = Modifier
                            .background(headerTagBg, RoundedCornerShape(6.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = headerTag,
                            fontSize = 10.5.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = headerTagColor
                        )
                    }
                }
            }
            content()
        }
    }
}

@Composable
private fun InfoMetricBox(
    label: String,
    value: String,
    valueColor: Color = Color(0xFF1E293B),
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .background(Color(0xFFF8FAFC), RoundedCornerShape(10.dp))
            .border(1.dp, Color(0xFFF1F5F9), RoundedCornerShape(10.dp))
            .padding(8.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(label, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8))
            Spacer(modifier = Modifier.height(2.dp))
            Text(value, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = valueColor)
        }
    }
}

@Composable
private fun TagBadge(text: String) {
    Box(
        modifier = Modifier
            .background(Color.White, RoundedCornerShape(6.dp))
            .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(6.dp))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    ) {
        Text(text, fontSize = 9.5.sp, fontWeight = FontWeight.Medium, color = Color(0xFF065F46))
    }
}

@Composable
private fun ConditionItem(
    title: String,
    subtitle: String,
    statusTag: String,
    statusColor: Color,
    statusBg: Color
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFF8FAFC), RoundedCornerShape(10.dp))
            .border(1.dp, Color(0xFFF1F5F9), RoundedCornerShape(10.dp))
            .padding(10.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
            Text(subtitle, fontSize = 10.5.sp, color = Color(0xFF64748B), modifier = Modifier.padding(top = 1.dp))
        }
        Box(
            modifier = Modifier
                .background(statusBg, RoundedCornerShape(12.dp))
                .padding(horizontal = 8.dp, vertical = 2.dp)
        ) {
            Text(statusTag, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = statusColor)
        }
    }
}

@Composable
private fun MedicationItem(
    name: String,
    instruction: String,
    badge: String,
    badgeBg: Color,
    badgeColor: Color,
    iconRes: Int
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFF8FAFC), RoundedCornerShape(10.dp))
            .border(1.dp, Color(0xFFF1F5F9), RoundedCornerShape(10.dp))
            .padding(10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.weight(1f)
        ) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(Color.White, RoundedCornerShape(8.dp))
                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = iconRes),
                    contentDescription = null,
                    tint = Color(0xFF0F766E),
                    modifier = Modifier.size(16.dp)
                )
            }
            Column {
                Text(name, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                Text(instruction, fontSize = 10.sp, color = Color(0xFF64748B))
            }
        }
        Box(
            modifier = Modifier
                .background(badgeBg, RoundedCornerShape(6.dp))
                .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(6.dp))
                .padding(horizontal = 6.dp, vertical = 2.dp)
        ) {
            Text(badge, fontSize = 9.5.sp, fontWeight = FontWeight.SemiBold, color = badgeColor)
        }
    }
}

@Composable
private fun HealthBullet(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFF8FAFC), RoundedCornerShape(8.dp))
            .border(1.dp, Color(0xFFF1F5F9), RoundedCornerShape(8.dp))
            .padding(8.dp),
        verticalAlignment = Alignment.Top
    ) {
        Box(
            modifier = Modifier
                .padding(top = 4.dp)
                .size(5.dp)
                .background(Color(0xFF0F766E), CircleShape)
        )
        Spacer(modifier = Modifier.width(6.dp))
        Text(
            text = buildAnnotatedString {
                withStyle(SpanStyle(fontWeight = FontWeight.Bold, color = Color(0xFF334155))) {
                    append(label)
                }
                withStyle(SpanStyle(color = Color(0xFF475569))) {
                    append(value)
                }
            },
            fontSize = 11.sp,
            lineHeight = 15.sp
        )
    }
}

@Composable
private fun ConsultationHistoryItem(
    doctor: String,
    specialty: String,
    date: String,
    notes: String
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFF8FAFC), RoundedCornerShape(10.dp))
            .border(1.dp, Color(0xFFF1F5F9), RoundedCornerShape(10.dp))
            .padding(10.dp)
    ) {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(doctor, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                Text("• $specialty", fontSize = 10.5.sp, color = Color(0xFF0F766E), fontWeight = FontWeight.Medium)
            }
            Text(date, fontSize = 10.sp, color = Color(0xFF64748B), modifier = Modifier.padding(top = 1.dp))
            Text(notes, fontSize = 10.5.sp, color = Color(0xFF0F766E), fontWeight = FontWeight.Medium, modifier = Modifier.padding(top = 2.dp))
        }
    }
}

@Composable
private fun LinkedFamilyMemberRow(
    member: FamilyMember,
    onClick: () -> Unit
) {
    val avatarBgColor = androidx.compose.ui.graphics.Color(android.graphics.Color.parseColor(member.avatarColor))
    val statusColor = androidx.compose.ui.graphics.Color(android.graphics.Color.parseColor(member.statusBadgeColor))

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFF8FAFC), RoundedCornerShape(12.dp))
            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onClick() }
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.weight(1f)
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(avatarBgColor, RoundedCornerShape(12.dp))
                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = member.avatarInitials,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF334155)
                )
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = member.name,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF1E293B),
                    maxLines = 1,
                    overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = "${member.relationship} • ${member.age} yrs",
                    fontSize = 10.sp,
                    color = Color(0xFF64748B)
                )
                Spacer(modifier = Modifier.height(2.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(5.dp)
                            .background(Color(0xFF10B981), CircleShape)
                    )
                    Text(
                        text = member.healthSnapshot,
                        fontSize = 9.5.sp,
                        color = Color(0xFF475569),
                        maxLines = 1,
                        overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                    )
                }
            }
        }
        Box(
            modifier = Modifier
                .background(Color(0xFFF0FDF9), RoundedCornerShape(6.dp))
                .border(1.dp, Color(0xFFCCFBF1), RoundedCornerShape(6.dp))
                .padding(horizontal = 6.dp, vertical = 2.dp)
        ) {
            Text(
                text = member.statusBadge,
                fontSize = 9.sp,
                fontWeight = FontWeight.SemiBold,
                color = statusColor,
                maxLines = 1,
                overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
            )
        }
    }
}

@Composable
private fun VitalsCard(vitals: VitalsData) {
    val brandTeal = Color(0xFF0F766E)
    val brandTealLight = Color(0xFFCCFBF1)
    val textHeading = Color(0xFF1E293B)
    val textMuted = Color(0xFF64748B)
    val borderLight = Color(0xFFE2E8F0)
    val warningOrange = Color(0xFFD97706)
    val errorRed = Color(0xFFDC2626)
    val successGreen = Color(0xFF047857)

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        // Row 1: BP and Heart Rate
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            VitalMetricBox(
                label = "BLOOD PRESSURE",
                value = vitals.bloodPressureString,
                unit = "",
                iconRes = R.drawable.ic_heart_capsule,
                iconColor = if (vitals.isHypertensive) errorRed else brandTeal,
                valueColor = if (vitals.isHypertensive) errorRed else textHeading,
                modifier = Modifier.weight(1f)
            )
            VitalMetricBox(
                label = "HEART RATE",
                value = vitals.heartRateBpm.toString(),
                unit = "bpm",
                iconRes = R.drawable.ic_heart_capsule,
                iconColor = if (vitals.isTachycardic) warningOrange else brandTeal,
                valueColor = if (vitals.isTachycardic) warningOrange else textHeading,
                modifier = Modifier.weight(1f)
            )
        }

        // Row 2: SpO2 and Temperature
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            VitalMetricBox(
                label = "SpO₂",
                value = vitals.spO2Percent.toString(),
                unit = "%",
                iconRes = R.drawable.ic_medical_cross,
                iconColor = if (vitals.isHypoxic) errorRed else brandTeal,
                valueColor = if (vitals.isHypoxic) errorRed else textHeading,
                modifier = Modifier.weight(1f)
            )
            VitalMetricBox(
                label = "TEMPERATURE",
                value = String.format("%.1f", vitals.temperatureCelsius),
                unit = "°C",
                iconRes = R.drawable.ic_calendar,
                iconColor = if (vitals.hasFever) errorRed else brandTeal,
                valueColor = if (vitals.hasFever) errorRed else textHeading,
                modifier = Modifier.weight(1f)
            )
        }

        // Row 3: Pain Score (full width)
        VitalMetricBox(
            label = "PAIN SCORE",
            value = vitals.painScore.toString(),
            unit = "/10",
            iconRes = R.drawable.ic_warning_triangle,
            iconColor = if (vitals.hasSignificantPain) errorRed else brandTeal,
            valueColor = if (vitals.hasSignificantPain) errorRed else textHeading,
            modifier = Modifier.fillMaxWidth(),
            showProgress = true,
            progress = vitals.painScore / 10f
        )

        // Timestamp
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.End
        ) {
            Text(
                text = "Recorded ${DateTimeFormatter.ofPattern("HH:mm").format(vitals.timestamp)}",
                fontSize = 10.sp,
                color = textMuted
            )
        }
    }
}

@Composable
private fun VitalMetricBox(
    label: String,
    value: String,
    unit: String,
    iconRes: Int,
    iconColor: Color,
    valueColor: Color,
    modifier: Modifier = Modifier,
    showProgress: Boolean = false,
    progress: Float = 0f
) {
    val bgLight = Color(0xFFF8FAFC)
    val borderLight = Color(0xFFE2E8F0)
    val textMuted = Color(0xFF64748B)

    Box(
        modifier = modifier
            .background(bgLight, RoundedCornerShape(12.dp))
            .border(1.dp, borderLight, RoundedCornerShape(12.dp))
            .padding(12.dp),
        contentAlignment = Alignment.CenterStart
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(iconColor.copy(alpha = 0.12f), RoundedCornerShape(8.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = iconRes),
                    contentDescription = null,
                    tint = iconColor,
                    modifier = Modifier.size(16.dp)
                )
            }
            Text(label, fontSize = 9.sp, fontWeight = FontWeight.Bold, color = textMuted, letterSpacing = 0.5.sp)
            Row(
                verticalAlignment = Alignment.Bottom,
                horizontalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = valueColor)
                if (unit.isNotBlank()) {
                    Text(unit, fontSize = 11.sp, fontWeight = FontWeight.Medium, color = textMuted)
                }
            }
            if (showProgress) {
                Column(modifier = Modifier.fillMaxWidth(), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text("No pain", fontSize = 9.sp, color = textMuted)
                        Text("Worst pain", fontSize = 9.sp, color = textMuted)
                    }
                    // Progress bar using Row with weighted boxes
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .weight(progress.coerceIn(0f, 1f))
                                .height(6.dp)
                                .background(valueColor, RoundedCornerShape(3.dp))
                        )
                        Box(
                            modifier = Modifier
                                .weight((1f - progress).coerceIn(0f, 1f))
                                .height(6.dp)
                                .background(Color(0xFFE2E8F0), RoundedCornerShape(3.dp))
                        )
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun AboutYouScreenPreview() {
    MaterialTheme {
        AboutYouScreen(
            profileData = ProfileData(),
            healthData = HealthData(),
            onBackClick = {},
            onEditProfileClick = {},
            onEditHealthDetailsClick = {}
        )
    }
}
