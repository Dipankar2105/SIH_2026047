package com.example.aarogyaflow.feature.family

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
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun FamilyMemberSummaryScreen(
    member: FamilyMember,
    onBackClick: () -> Unit,
    onEditClick: () -> Unit,
    onViewRecordsClick: () -> Unit,
    onStartConsultationClick: () -> Unit,
    onCallDoctorClick: () -> Unit,
    onEmergencyClick: () -> Unit
) {
    // Exact Stitch color tokens for Family Member Summary (family_member_summary_aarogyaflow)
    val bgLight = Color(0xFFF1F5F9)
    val brandTeal = Color(0xFF0F766E)
    val brandTealDark = Color(0xFF115E59)
    val brandTealLight = Color(0xFFCCFBF1)
    val textHeading = Color(0xFF0F172A)
    val textBody = Color(0xFF334155)
    val textMuted = Color(0xFF64748B)
    val textSubtle = Color(0xFF94A3B8)
    val borderLight = Color(0xFFE2E8F0)
    val white = Color.White

    // Demo detailed data for the member
    val detail = remember {
        when (member.id) {
            "1" -> FamilyMemberDetail(
                id = "1",
                name = "Sunita Sharma",
                relationship = "Mother",
                age = 58,
                gender = "Female",
                abhaNumber = "91-8842-1920-4102",
                avatarColor = "#FDF2F8",
                avatarInitials = "SS",
                bloodGroup = "B+",
                heightCm = 158,
                weightKg = 68,
                bloodPressure = "138/88",
                pulseBpm = 72,
                spO2Percent = 98,
                recentUpdateTitle = "BP Check Completed",
                recentUpdateDescription = "Morning reading: 138/88 mmHg - Within managed range",
                recentUpdateTags = listOf("Vitals", "Hypertension"),
                conditions = listOf(
                    ConditionItem("Hypertension", "Diagnosed 2019", "Managed", "#0F766E", "#ECFDF5"),
                    ConditionItem("Hypothyroidism", "On Levothyroxine 75mcg", "Controlled", "#059669", "#ECFDF5"),
                    ConditionItem("Osteoarthritis (Knee)", "Grade 2 - Right Knee", "Monitoring", "#D97706", "#FFFBEB")
                ),
                allergies = listOf(
                    AllergyItem("Penicillin", "Rash & Swelling", "Severe"),
                    AllergyItem("Sulfa Drugs", "Hives", "Moderate")
                ),
                medications = listOf(
                    MedicationItem("Telmisartan 40mg", "1 tablet daily morning", "Allopathic", "Hypertension"),
                    MedicationItem("Levothyroxine 75mcg", "1 tablet daily empty stomach", "Allopathic", "Hypothyroidism"),
                    MedicationItem("Calcium + Vit D3", "1 tablet daily after dinner", "Allopathic", "Bone Health")
                ),
                primaryDoctor = CareTeamMember(
                    "Dr. Meera Patel",
                    "Cardiology",
                    "Apollo Hospital, Chennai",
                    "MP",
                    "#FDF2F8",
                    true
                ),
                emergencyContact = EmergencyContact(
                    "Rajesh Sharma",
                    "Husband",
                    "+91 98765 43210",
                    true,
                    "RS",
                    "#FFFBEB"
                )
            )
            "2" -> FamilyMemberDetail(
                id = "2",
                name = "Rajesh Sharma",
                relationship = "Father",
                age = 62,
                gender = "Male",
                abhaNumber = "91-3310-9281-7721",
                avatarColor = "#FFFBEB",
                avatarInitials = "RS",
                bloodGroup = "O+",
                heightCm = 170,
                weightKg = 78,
                bloodPressure = "142/90",
                pulseBpm = 76,
                spO2Percent = 97,
                recentUpdateTitle = "OPD Follow-up Due",
                recentUpdateDescription = "Diabetes review scheduled in 3 days - HbA1c monitoring",
                recentUpdateTags = listOf("Diabetes", "Follow-up"),
                conditions = listOf(
                    ConditionItem("Type 2 Diabetes", "Diagnosed 2015", "Controlled", "#059669", "#ECFDF5"),
                    ConditionItem("Dyslipidemia", "On Atorvastatin 20mg", "Managed", "#0F766E", "#ECFDF5"),
                    ConditionItem("Cataract (Left Eye)", "Post-op 2023", "Resolved", "#64748B", "#F1F5F9")
                ),
                allergies = listOf(
                    AllergyItem("Aspirin", "Gastric Irritation", "Mild")
                ),
                medications = listOf(
                    MedicationItem("Metformin 500mg", "1 tablet twice daily", "Allopathic", "Type 2 Diabetes"),
                    MedicationItem("Atorvastatin 20mg", "1 tablet at bedtime", "Allopathic", "Dyslipidemia"),
                    MedicationItem("Glimepiride 2mg", "1 tablet before breakfast", "Allopathic", "Type 2 Diabetes")
                ),
                primaryDoctor = CareTeamMember(
                    "Dr. Arjun Reddy",
                    "Endocrinology",
                    "Fortis Hospital, Bangalore",
                    "AR",
                    "#FFFBEB",
                    true
                ),
                emergencyContact = EmergencyContact(
                    "Sunita Sharma",
                    "Wife",
                    "+91 98765 43211",
                    true,
                    "SS",
                    "#FDF2F8"
                )
            )
            else -> FamilyMemberDetail(
                id = "3",
                name = "Priya Sharma",
                relationship = "Spouse",
                age = 30,
                gender = "Female",
                abhaNumber = "91-5541-6209-1148",
                avatarColor = "#F0FDF9",
                avatarInitials = "PS",
                bloodGroup = "A+",
                heightCm = 165,
                weightKg = 58,
                bloodPressure = "118/76",
                pulseBpm = 68,
                spO2Percent = 99,
                recentUpdateTitle = "Flu Vaccine Completed",
                recentUpdateDescription = "Annual influenza vaccination done on 15 Jan 2025",
                recentUpdateTags = listOf("Vaccination", "Preventive"),
                conditions = listOf(
                    ConditionItem("Allergic Rhinitis", "Dust & Pollen", "Seasonal", "#D97706", "#FFFBEB"),
                    ConditionItem("Vitamin D Deficiency", "Supplementing 1000 IU", "Improving", "#0F766E", "#ECFDF5")
                ),
                allergies = listOf(
                    AllergyItem("Dust Mites", "Sneezing, Runny Nose", "Moderate"),
                    AllergyItem("Pollen", "Itchy Eyes, Congestion", "Moderate")
                ),
                medications = listOf(
                    MedicationItem("Cetirizine 10mg", "As needed for allergies", "Allopathic", "Allergic Rhinitis"),
                    MedicationItem("Vitamin D3 1000 IU", "1 tablet daily", "Allopathic", "Vitamin D Deficiency"),
                    MedicationItem("Fluticasone Nasal Spray", "2 sprays each nostril daily", "Allopathic", "Allergic Rhinitis")
                ),
                primaryDoctor = CareTeamMember(
                    "Dr. Kavya Nair",
                    "General Medicine",
                    "AIIMS, Delhi",
                    "KN",
                    "#F0FDF9",
                    true
                ),
                emergencyContact = EmergencyContact(
                    "Rajesh Sharma",
                    "Spouse",
                    "+91 98765 43212",
                    true,
                    "RS",
                    "#FFFBEB"
                )
            )
        }
    }

    val avatarBgColor = Color(android.graphics.Color.parseColor(detail.avatarColor))
    val statusBadgeColor = Color(android.graphics.Color.parseColor(member.statusBadgeColor))

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
            // Header Navigation Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(white)
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Back Button
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) { onBackClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_chevron_left),
                            contentDescription = "Back",
                            tint = Color(0xFF334155),
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    // Avatar + Name
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .background(avatarBgColor, RoundedCornerShape(12.dp))
                                .border(1.dp, borderLight, RoundedCornerShape(12.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = detail.avatarInitials,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = textHeading
                            )
                        }
                        Column {
                            Text(
                                text = detail.name,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = textHeading
                            )
                            Box(
                                modifier = Modifier
                                    .background(brandTealLight, RoundedCornerShape(8.dp))
                                    .padding(horizontal = 6.dp, vertical = 1.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "${detail.relationship} • ${detail.age} yrs • ${detail.gender}",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = brandTealDark
                                )
                            }
                        }
                    }
                }

                // Right Actions: Edit, More
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Edit Button
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(Color(0xFFF1F5F9), CircleShape)
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) { onEditClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_edit_pencil),
                            contentDescription = "Edit",
                            tint = Color(0xFF64748B),
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    // More/Menu Button
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(Color(0xFFF1F5F9), CircleShape)
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) { /* More options */ },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_chevron_right_small),
                            contentDescription = "More",
                            tint = Color(0xFF64748B),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }

            HorizontalDivider(color = borderLight)

            // Scrollable Content
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // ABHA ID Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(white, RoundedCornerShape(16.dp))
                        .border(1.dp, borderLight, RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_document_text),
                                    contentDescription = null,
                                    tint = brandTeal,
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = "ABHA Number",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = textMuted
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = detail.abhaNumber,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = textHeading,
                                    letterSpacing = 0.5.sp
                                )
                                Box(
                                    modifier = Modifier
                                        .size(32.dp)
                                        .background(brandTealLight, CircleShape)
                                        .clickable(
                                            interactionSource = remember { MutableInteractionSource() },
                                            indication = null
                                        ) { /* Copy to clipboard */ },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        painter = painterResource(id = R.drawable.ic_copy_content),
                                        contentDescription = "Copy ABHA",
                                        tint = brandTeal,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                        }
                        Box(
                            modifier = Modifier
                                .background(brandTealLight, RoundedCornerShape(8.dp))
                                .border(1.dp, Color(0xFF6EE7B7), RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "ABHA Linked",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = brandTealDark
                            )
                        }
                    }
                }

                // Basic Health Vitals Grid
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(white, RoundedCornerShape(16.dp))
                        .border(1.dp, borderLight, RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Text(
                        text = "Basic Vitals",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        VitalItem(
                            modifier = Modifier.weight(1f, true),
                            icon = R.drawable.ic_medical_cross,
                            label = "Blood Group",
                            value = detail.bloodGroup,
                            color = Color(0xFFEF4444)
                        )
                        VitalItem(
                            modifier = Modifier.weight(1f, true),
                            icon = R.drawable.ic_calendar,
                            label = "Height",
                            value = "${detail.heightCm} cm",
                            color = Color(0xFF3B82F6)
                        )
                        VitalItem(
                            modifier = Modifier.weight(1f, true),
                            icon = R.drawable.ic_pills,
                            label = "Weight",
                            value = "${detail.weightKg} kg",
                            color = Color(0xFF8B5CF6)
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        VitalItem(
                            modifier = Modifier.weight(1f, true),
                            icon = R.drawable.ic_heart_capsule,
                            label = "BP",
                            value = "${detail.bloodPressure} mmHg",
                            color = Color(0xFFEC4899)
                        )
                        VitalItem(
                            modifier = Modifier.weight(1f, true),
                            icon = R.drawable.ic_herbs,
                            label = "Pulse",
                            value = "${detail.pulseBpm} bpm",
                            color = Color(0xFFF59E0B)
                        )
                        VitalItem(
                            modifier = Modifier.weight(1f, true),
                            icon = R.drawable.ic_medical_cross,
                            label = "SpO₂",
                            value = "${detail.spO2Percent}%",
                            color = Color(0xFF06B6D4)
                        )
                    }
                }

                // Recent Health Update
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFF0FDF5), RoundedCornerShape(16.dp))
                        .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(brandTealLight, RoundedCornerShape(10.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_clipboard_check),
                                contentDescription = null,
                                tint = brandTeal,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = detail.recentUpdateTitle,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = textHeading
                                )
                                Box(
                                    modifier = Modifier
                                        .background(white, RoundedCornerShape(6.dp))
                                        .border(1.dp, borderLight, RoundedCornerShape(6.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "Recent",
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = textMuted
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = detail.recentUpdateDescription,
                                fontSize = 11.sp,
                                color = textBody,
                                lineHeight = 15.sp
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                detail.recentUpdateTags.forEach { tag ->
                                    Box(
                                        modifier = Modifier
                                            .background(white, RoundedCornerShape(12.dp))
                                            .border(1.dp, borderLight, RoundedCornerShape(12.dp))
                                            .padding(horizontal = 8.dp, vertical = 3.dp)
                                    ) {
                                        Text(
                                            text = tag,
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = textMuted
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // Medical Conditions
                VStackCard(
                    title = "Medical Conditions",
                    icon = R.drawable.ic_warning_triangle,
                    iconColor = Color(0xFFF59E0B)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        detail.conditions.forEach { condition ->
                            ConditionRow(condition = condition)
                        }
                    }
                }

                // Allergies
                VStackCard(
                    title = "Allergies",
                    icon = R.drawable.ic_shield_check,
                    iconColor = Color(0xFFEF4444)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        detail.allergies.forEach { allergy ->
                            AllergyRow(allergy = allergy)
                        }
                    }
                }

                // Current Medications
                VStackCard(
                    title = "Current Medications",
                    icon = R.drawable.ic_pills,
                    iconColor = Color(0xFF3B82F6)
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        detail.medications.forEach { med ->
                            MedicationRow(medication = med)
                        }
                    }
                }

                // Care Team
                VStackCard(
                    title = "Care Team",
                    icon = R.drawable.ic_users_family,
                    iconColor = Color(0xFF8B5CF6)
                ) {
                    CareTeamRow(member = detail.primaryDoctor)
                }

                // Emergency Contact
                VStackCard(
                    title = "Emergency Contact",
                    icon = R.drawable.ic_phone_call,
                    iconColor = Color(0xFFEF4444)
                ) {
                    EmergencyContactRow(contact = detail.emergencyContact)
                }
            }

            // Bottom Action Bar
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(white)
                    .border(width = 1.dp, color = borderLight)
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Primary: View Records
                    Button(
                        onClick = onViewRecordsClick,
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = brandTeal,
                            contentColor = white
                        ),
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_document_text),
                            contentDescription = null,
                            tint = white,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "View Records",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }

                    // Secondary: Start Consultation
                    OutlinedButton(
                        onClick = onStartConsultationClick,
                        modifier = Modifier
                            .weight(1f, true)
                            .height(48.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = Color.Transparent,
                            contentColor = brandTeal
                        )
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_medical_cross),
                            contentDescription = null,
                            tint = brandTeal,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Consultation",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                // Emergency & Call Doctor Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    OutlinedButton(
                        onClick = onCallDoctorClick,
                        modifier = Modifier
                            .weight(1f, true)
                            .height(44.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.outlinedButtonColors(
                            containerColor = Color.Transparent,
                            contentColor = Color(0xFF3B82F6)
                        )
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_phone_call),
                            contentDescription = null,
                            tint = Color(0xFF3B82F6),
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Call Doctor",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    Button(
                        onClick = onEmergencyClick,
                        modifier = Modifier
                            .weight(1f, true)
                            .height(44.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFEF4444),
                            contentColor = Color.White
                        ),
                        elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_warning_triangle),
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Emergency",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                // iOS Home Indicator
                Box(
                    modifier = Modifier
                        .width(128.dp)
                        .height(4.dp)
                        .background(Color(0xFFCBD5E1), CircleShape)
                        .align(Alignment.CenterHorizontally)
                        .padding(top = 8.dp)
                )
            }
        }
    }
}

@Composable
private fun VitalItem(
    modifier: Modifier = Modifier,
    icon: Int,
    label: String,
    value: String,
    color: Color
) {
    Box(
        modifier = modifier
            .background(Color(0xFFF8FAFC), RoundedCornerShape(12.dp))
            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
            .padding(12.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .background(Color.White, CircleShape)
                    .border(1.dp, color.copy(alpha = 0.3f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = icon),
                    contentDescription = null,
                    tint = color,
                    modifier = Modifier.size(14.dp)
                )
            }
            Text(
                text = label,
                fontSize = 9.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF64748B)
            )
            Text(
                text = value,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF0F172A)
            )
        }
    }
}

@Composable
private fun VStackCard(
    title: String,
    icon: Int,
    iconColor: Color,
    content: @Composable () -> Unit
) {
    val bgLight = Color(0xFFF1F5F9)
    val textHeading = Color(0xFF0F172A)
    val textMuted = Color(0xFF64748B)
    val borderLight = Color(0xFFE2E8F0)
    val white = Color.White

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(white, RoundedCornerShape(16.dp))
            .border(1.dp, borderLight, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .background(iconColor.copy(alpha = 0.12f), RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = icon),
                        contentDescription = null,
                        tint = iconColor,
                        modifier = Modifier.size(14.dp)
                    )
                }
                Text(
                    text = title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = textHeading
                )
            }
            content()
        }
    }
}

@Composable
private fun ConditionRow(condition: ConditionItem) {
    val statusColor = Color(android.graphics.Color.parseColor(condition.statusColor))
    val statusBg = Color(android.graphics.Color.parseColor(condition.statusBg))
    val borderLight = Color(0xFFE2E8F0)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFFAFAFA), RoundedCornerShape(12.dp))
            .border(1.dp, borderLight, RoundedCornerShape(12.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f, true)) {
            Text(
                text = condition.title,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF0F172A)
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = condition.subtitle,
                fontSize = 10.sp,
                color = Color(0xFF64748B)
            )
        }
        Box(
            modifier = Modifier
                .background(statusBg, RoundedCornerShape(8.dp))
                .border(1.dp, statusColor.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Text(
                text = condition.status,
                fontSize = 10.sp,
                fontWeight = FontWeight.SemiBold,
                color = statusColor
            )
        }
    }
}

@Composable
private fun AllergyRow(allergy: AllergyItem) {
    val severityColor = when (allergy.severity.lowercase()) {
        "severe" -> Color(0xFFEF4444)
        "moderate" -> Color(0xFFF59E0B)
        "mild" -> Color(0xFF3B82F6)
        else -> Color(0xFF64748B)
    }
    val borderLight = Color(0xFFE2E8F0)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFFAFAFA), RoundedCornerShape(12.dp))
            .border(1.dp, borderLight, RoundedCornerShape(12.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f, true)) {
            Text(
                text = allergy.name,
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                color = Color(0xFF0F172A)
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "Reaction: ${allergy.reaction}",
                fontSize = 10.sp,
                color = Color(0xFF64748B)
            )
        }
        Box(
            modifier = Modifier
                .background(severityColor.copy(alpha = 0.12f), RoundedCornerShape(8.dp))
                .border(1.dp, severityColor.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                .padding(horizontal = 8.dp, vertical = 4.dp)
        ) {
            Text(
                text = allergy.severity,
                fontSize = 10.sp,
                fontWeight = FontWeight.SemiBold,
                color = severityColor
            )
        }
    }
}

@Composable
private fun MedicationRow(medication: MedicationItem) {
    val typeColor = if (medication.type == "Allopathic") Color(0xFF3B82F6) else Color(0xFF8B5CF6)
    val typeBg = if (medication.type == "Allopathic") Color(0xFFDBEAFE) else Color(0xFFEDE9FE)
    val borderLight = Color(0xFFE2E8F0)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFFAFAFA), RoundedCornerShape(12.dp))
            .border(1.dp, borderLight, RoundedCornerShape(12.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.Top,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f, true)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = medication.name,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF0F172A)
                )
                Box(
                    modifier = Modifier
                        .background(typeBg, RoundedCornerShape(6.dp))
                        .padding(horizontal = 6.dp, vertical = 1.dp)
                ) {
                    Text(
                        text = medication.type,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Bold,
                        color = typeColor
                    )
                }
            }
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = medication.instruction,
                fontSize = 10.sp,
                color = Color(0xFF64748B)
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "For: ${medication.condition}",
                fontSize = 9.sp,
                color = Color(0xFF94A3B8)
            )
        }
    }
}

@Composable
private fun CareTeamRow(member: CareTeamMember) {
    val avatarBg = Color(android.graphics.Color.parseColor(member.avatarColor))
    val borderLight = Color(0xFFE2E8F0)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFFAFAFA), RoundedCornerShape(12.dp))
            .border(1.dp, borderLight, RoundedCornerShape(12.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .background(avatarBg, RoundedCornerShape(12.dp))
                .border(1.dp, borderLight, RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = member.avatarInitials,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF334155)
            )
        }
        Column(modifier = Modifier.weight(1f, true)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = member.name,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0F172A)
                )
                if (member.isPrimary) {
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFECFDF5), RoundedCornerShape(6.dp))
                            .padding(horizontal = 6.dp, vertical = 1.dp)
                    ) {
                        Text(
                            text = "Primary",
                            fontSize = 8.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0F766E)
                        )
                    }
                }
            }
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "${member.specialty} • ${member.hospital}",
                fontSize = 10.sp,
                color = Color(0xFF64748B)
            )
        }
    }
}

@Composable
private fun EmergencyContactRow(contact: EmergencyContact) {
    val avatarBg = Color(android.graphics.Color.parseColor(contact.avatarColor))
    val borderLight = Color(0xFFE2E8F0)

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFFAFAFA), RoundedCornerShape(12.dp))
            .border(1.dp, borderLight, RoundedCornerShape(12.dp))
            .padding(12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Box(
            modifier = Modifier
                .size(44.dp)
                .background(avatarBg, RoundedCornerShape(12.dp))
                .border(1.dp, borderLight, RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = contact.avatarInitials,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF334155)
            )
        }
        Column(modifier = Modifier.weight(1f, true)) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = contact.name,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF0F172A)
                )
                Box(
                    modifier = Modifier
                        .background(Color(0xFFF1F5F9), RoundedCornerShape(6.dp))
                        .padding(horizontal = 6.dp, vertical = 1.dp)
                ) {
                    Text(
                        text = contact.relationship,
                        fontSize = 8.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF64748B)
                    )
                }
            }
            Spacer(modifier = Modifier.height(2.dp))
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_phone_call),
                    contentDescription = null,
                    tint = Color(0xFF3B82F6),
                    modifier = Modifier.size(12.dp)
                )
                Text(
                    text = contact.phone,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF3B82F6)
                )
            }
        }
        if (contact.isPrimaryHolder) {
            Box(
                modifier = Modifier
                    .background(Color(0xFFECFDF5), RoundedCornerShape(8.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "Primary",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF0F766E)
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun FamilyMemberSummaryScreenPreview() {
    MaterialTheme {
        FamilyMemberSummaryScreen(
            member = FamilyMember(
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
                statusBadgeColor = "#0F766E"
            ),
            onBackClick = {},
            onEditClick = {},
            onViewRecordsClick = {},
            onStartConsultationClick = {},
            onCallDoctorClick = {},
            onEmergencyClick = {}
        )
    }
}