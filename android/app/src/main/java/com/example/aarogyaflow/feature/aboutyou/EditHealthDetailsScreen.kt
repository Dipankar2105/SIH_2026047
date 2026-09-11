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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun EditHealthDetailsScreen(
    currentHealthData: HealthData = HealthData(),
    onBackClick: () -> Unit,
    onSaveHealthData: (HealthData) -> Unit
) {
    // Exact Stitch color tokens
    val bgLight = Color(0xFFF8FAFC)
    val brandTeal = Color(0xFF00594C)
    val textHeading = Color(0xFF0F172A)
    val textMuted = Color(0xFF64748B)
    val borderLight = Color(0xFFE2E8F0)

    // Local mutable state for vitals & health data
    var bloodGroup by remember { mutableStateOf(currentHealthData.bloodGroup) }
    var heightInput by remember { mutableStateOf(currentHealthData.heightCm.toString()) }
    var weightInput by remember { mutableStateOf(currentHealthData.weightKg.toString()) }
    var bloodPressure by remember { mutableStateOf(currentHealthData.bloodPressure) }
    var pulseInput by remember { mutableStateOf(currentHealthData.pulseBpm.toString()) }
    var spO2Input by remember { mutableStateOf(currentHealthData.spO2Percent.toString()) }

    // Allergies state
    var allergy1Name by remember { mutableStateOf(currentHealthData.allergies.getOrNull(0)?.name ?: "Penicillin") }
    var allergy1Reaction by remember { mutableStateOf(currentHealthData.allergies.getOrNull(0)?.reaction ?: "Causes severe skin hives & swelling.") }
    var allergy2Name by remember { mutableStateOf(currentHealthData.allergies.getOrNull(1)?.name ?: "Peanuts") }
    var allergy2Reaction by remember { mutableStateOf(currentHealthData.allergies.getOrNull(1)?.reaction ?: "Mild gastrointestinal distress.") }

    // Conditions state
    var cond1Title by remember { mutableStateOf(currentHealthData.conditions.getOrNull(0)?.title ?: "Mild Gastritis (Acid Reflux)") }
    var cond1Desc by remember { mutableStateOf(currentHealthData.conditions.getOrNull(0)?.subtitle ?: "Diagnosed Feb 2024 • Managed by diet & antacids") }

    // Medications state
    var med1Name by remember { mutableStateOf(currentHealthData.medications.getOrNull(0)?.name ?: "Pantoprazole 40mg") }
    var med1Inst by remember { mutableStateOf(currentHealthData.medications.getOrNull(0)?.instruction ?: "1 tablet • Once daily before breakfast") }

    // Dynamic Live BMI calculation
    val parsedHeight = heightInput.toIntOrNull() ?: currentHealthData.heightCm
    val parsedWeight = weightInput.toIntOrNull() ?: currentHealthData.weightKg
    val liveBmi = remember(parsedHeight, parsedWeight) {
        val hM = parsedHeight / 100.0
        if (hM > 0) Math.round((parsedWeight / (hM * hM)) * 10.0) / 10.0 else 0.0
    }
    val liveBmiStatus = remember(liveBmi) {
        when {
            liveBmi < 18.5 -> "Underweight"
            liveBmi < 25.0 -> "Normal"
            liveBmi < 30.0 -> "Overweight"
            else -> "Obese"
        }
    }

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
                .imePadding()
        ) {
            // Top App Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
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
                            contentDescription = "Cancel",
                            tint = Color(0xFF334155),
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Image(
                        painter = painterResource(id = R.drawable.ic_aarogyaflow_logo),
                        contentDescription = "AarogyaFlow",
                        modifier = Modifier
                            .size(26.dp)
                            .clip(RoundedCornerShape(6.dp))
                    )

                    Column {
                        Text(
                            text = "Edit Health Details",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = textHeading
                        )
                        Text(
                            text = "Vitals, Conditions & Medications",
                            fontSize = 11.sp,
                            color = textMuted
                        )
                    }
                }

                TextButton(onClick = onBackClick) {
                    Text(
                        text = "Cancel",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF64748B)
                    )
                }
            }

            HorizontalDivider(color = borderLight)

            // Scrollable Form Fields
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Section 1: Basic Vitals & Metrics Card
                HealthEditCard(
                    title = "BASIC VITALS & BODY METRICS",
                    iconRes = R.drawable.ic_document_text
                ) {
                    // Blood Group
                    HealthFormField(
                        label = "Blood Group",
                        value = bloodGroup,
                        onValueChange = { bloodGroup = it },
                        placeholder = "e.g. O +ve, A +ve, B +ve"
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    // Height & Weight with live BMI calculation
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        HealthFormField(
                            label = "Height (cm)",
                            value = heightInput,
                            onValueChange = { heightInput = it.filter { char -> char.isDigit() }.take(3) },
                            keyboardType = KeyboardType.Number,
                            placeholder = "174",
                            modifier = Modifier.weight(1f)
                        )

                        HealthFormField(
                            label = "Weight (kg)",
                            value = weightInput,
                            onValueChange = { weightInput = it.filter { char -> char.isDigit() }.take(3) },
                            keyboardType = KeyboardType.Number,
                            placeholder = "71",
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Live calculated BMI Preview Box
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFECFDF5), RoundedCornerShape(12.dp))
                            .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "CALCULATED BMI",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF047857),
                                    letterSpacing = 0.5.sp
                                )
                                Text(
                                    text = "Formula: weight / (height in meters)²",
                                    fontSize = 10.5.sp,
                                    color = Color(0xFF065F46)
                                )
                            }
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = "$liveBmi",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF065F46)
                                )
                                Box(
                                    modifier = Modifier
                                        .background(Color.White, RoundedCornerShape(6.dp))
                                        .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = liveBmiStatus,
                                        fontSize = 10.5.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF047857)
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Blood Pressure, Pulse, SpO2
                    HealthFormField(
                        label = "Blood Pressure",
                        value = bloodPressure,
                        onValueChange = { bloodPressure = it },
                        placeholder = "120/78 mmHg"
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        HealthFormField(
                            label = "Pulse Rate (bpm)",
                            value = pulseInput,
                            onValueChange = { pulseInput = it.filter { char -> char.isDigit() }.take(3) },
                            keyboardType = KeyboardType.Number,
                            placeholder = "74",
                            modifier = Modifier.weight(1f)
                        )

                        HealthFormField(
                            label = "Oxygen SpO2 (%)",
                            value = spO2Input,
                            onValueChange = { spO2Input = it.filter { char -> char.isDigit() }.take(3) },
                            keyboardType = KeyboardType.Number,
                            placeholder = "98",
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // Section 2: Allergies Card
                HealthEditCard(
                    title = "ALLERGIES & DRUG SENSITIVITIES",
                    iconRes = R.drawable.ic_warning_triangle
                ) {
                    Text("Allergy 1", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFF881337))
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        HealthFormField(
                            label = "Allergen Name",
                            value = allergy1Name,
                            onValueChange = { allergy1Name = it },
                            placeholder = "e.g. Penicillin",
                            modifier = Modifier.weight(1f)
                        )
                        HealthFormField(
                            label = "Reaction Description",
                            value = allergy1Reaction,
                            onValueChange = { allergy1Reaction = it },
                            placeholder = "e.g. Hives, swelling",
                            modifier = Modifier.weight(1.5f)
                        )
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    Text("Allergy 2", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFF78350F))
                    Spacer(modifier = Modifier.height(4.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        HealthFormField(
                            label = "Allergen Name",
                            value = allergy2Name,
                            onValueChange = { allergy2Name = it },
                            placeholder = "e.g. Peanuts",
                            modifier = Modifier.weight(1f)
                        )
                        HealthFormField(
                            label = "Reaction Description",
                            value = allergy2Reaction,
                            onValueChange = { allergy2Reaction = it },
                            placeholder = "e.g. GI distress",
                            modifier = Modifier.weight(1.5f)
                        )
                    }
                }

                // Section 3: Known Medical Conditions
                HealthEditCard(
                    title = "KNOWN CONDITIONS & MEDICAL HISTORY",
                    iconRes = R.drawable.ic_privacy_heart
                ) {
                    HealthFormField(
                        label = "Primary Diagnosis / Condition",
                        value = cond1Title,
                        onValueChange = { cond1Title = it },
                        placeholder = "e.g. Mild Gastritis (Acid Reflux)"
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    HealthFormField(
                        label = "Management Notes / Diagnosis Date",
                        value = cond1Desc,
                        onValueChange = { cond1Desc = it },
                        placeholder = "e.g. Diagnosed Feb 2024 • Managed by diet"
                    )
                }

                // Section 4: Current Medications
                HealthEditCard(
                    title = "CURRENT MEDICATIONS",
                    iconRes = R.drawable.ic_pills
                ) {
                    HealthFormField(
                        label = "Medicine Name & Strength",
                        value = med1Name,
                        onValueChange = { med1Name = it },
                        placeholder = "e.g. Pantoprazole 40mg"
                    )
                    Spacer(modifier = Modifier.height(10.dp))
                    HealthFormField(
                        label = "Dosage & Instructions",
                        value = med1Inst,
                        onValueChange = { med1Inst = it },
                        placeholder = "e.g. 1 tablet once daily before breakfast"
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))
            }

            // Fixed Bottom Action Bar: Save Health Details
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .border(width = 1.dp, color = borderLight)
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedButton(
                    onClick = onBackClick,
                    modifier = Modifier.height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF334155))
                ) {
                    Text("Cancel", fontSize = 13.5.sp, fontWeight = FontWeight.SemiBold)
                }

                Button(
                    onClick = {
                        val finalHeight = heightInput.toIntOrNull() ?: currentHealthData.heightCm
                        val finalWeight = weightInput.toIntOrNull() ?: currentHealthData.weightKg
                        val updated = currentHealthData.copy(
                            bloodGroup = bloodGroup.trim(),
                            heightCm = finalHeight,
                            weightKg = finalWeight,
                            bloodPressure = bloodPressure.trim(),
                            pulseBpm = pulseInput.toIntOrNull() ?: currentHealthData.pulseBpm,
                            spO2Percent = spO2Input.toIntOrNull() ?: currentHealthData.spO2Percent,
                            allergies = listOf(
                                AllergyItem(allergy1Name.trim(), "DRUG", allergy1Reaction.trim()),
                                AllergyItem(allergy2Name.trim(), "FOOD", allergy2Reaction.trim())
                            ),
                            conditions = listOf(
                                ConditionItemData(cond1Title.trim(), cond1Desc.trim(), "Active")
                            ),
                            medications = listOf(
                                MedicationItemData(med1Name.trim(), med1Inst.trim(), "Prescribed", true),
                                MedicationItemData("Avipattikar Churna", "Ayurvedic • 1 tsp at bedtime with warm water", "AYUSH", false)
                            )
                        )
                        onSaveHealthData(updated)
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = brandTeal,
                        contentColor = Color.White
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_check_mark),
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Save Health Details",
                        fontSize = 13.5.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun HealthEditCard(
    title: String,
    iconRes: Int,
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
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(bottom = 10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .background(Color(0xFFF0FDFA), RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = iconRes),
                        contentDescription = null,
                        tint = Color(0xFF00594C),
                        modifier = Modifier.size(15.dp)
                    )
                }
                Text(
                    text = title,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF64748B),
                    letterSpacing = 0.8.sp
                )
            }

            HorizontalDivider(color = Color(0xFFF1F5F9))
            Spacer(modifier = Modifier.height(10.dp))

            content()
        }
    }
}

@Composable
private fun HealthFormField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String = "",
    keyboardType: KeyboardType = KeyboardType.Text,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF475569),
            modifier = Modifier.padding(bottom = 4.dp)
        )
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            singleLine = true,
            placeholder = {
                Text(
                    text = placeholder,
                    fontSize = 13.sp,
                    color = Color(0xFF94A3B8)
                )
            },
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color(0xFF00594C),
                unfocusedBorderColor = Color(0xFFCBD5E1),
                focusedContainerColor = Color(0xFFF8FAFC),
                unfocusedContainerColor = Color(0xFFF8FAFC)
            )
        )
    }
}

@Preview(showBackground = true)
@Composable
fun EditHealthDetailsScreenPreview() {
    MaterialTheme {
        EditHealthDetailsScreen(
            currentHealthData = HealthData(),
            onBackClick = {},
            onSaveHealthData = {}
        )
    }
}
