package com.example.aarogyaflow.feature.vitals

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R
import com.example.aarogyaflow.feature.aboutyou.VitalsData

@Composable
fun VitalsScreen(
    vitals: VitalsData = VitalsData(),
    onBackClick: () -> Unit,
    onSaveClick: (VitalsData) -> Unit
) {
    val bgLight = Color(0xFFF8FAFC)
    val brandTeal = Color(0xFF0F766E)
    val brandTealLight = Color(0xFFCCFBF1)
    val textHeading = Color(0xFF1E293B)
    val textMuted = Color(0xFF64748B)
    val textSubtle = Color(0xFF94A3B8)
    val borderLight = Color(0xFFE2E8F0)
    val errorRed = Color(0xFFDC2626)
    val warningOrange = Color(0xFFD97706)
    val white = Color.White

    var systolicInput by remember { mutableStateOf(vitals.systolicBp.toString()) }
    var diastolicInput by remember { mutableStateOf(vitals.diastolicBp.toString()) }
    var heartRateInput by remember { mutableStateOf(vitals.heartRateBpm.toString()) }
    var spO2Input by remember { mutableStateOf(vitals.spO2Percent.toString()) }
    var temperatureInput by remember { mutableStateOf(vitals.temperatureCelsius.toString()) }
    var painScore by remember { mutableStateOf(vitals.painScore) }

    val systolicValid = systolicInput.toIntOrNull()
    val diastolicValid = diastolicInput.toIntOrNull()
    val heartRateValid = heartRateInput.toIntOrNull()
    val spO2Valid = spO2Input.toIntOrNull()
    val temperatureValid = temperatureInput.toDoubleOrNull()

    val bpWarning = systolicValid != null && systolicValid >= 140 ||
        diastolicValid != null && diastolicValid >= 90
    val hrWarning = heartRateValid != null && heartRateValid > 100
    val spo2Warning = spO2Valid != null && spO2Valid < 95
    val tempWarning = temperatureValid != null && temperatureValid >= 38.0

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
                    .background(white)
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
                            contentDescription = "Back",
                            tint = Color(0xFF334155),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Column {
                        Text(
                            text = "Vitals",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = textHeading
                        )
                        Text(
                            text = "Record your current vitals",
                            fontSize = 11.5.sp,
                            color = textMuted
                        )
                    }
                }
            }

            HorizontalDivider(color = borderLight)

            // Summary Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 14.dp)
                    .background(white, RoundedCornerShape(16.dp))
                    .border(1.dp, borderLight, RoundedCornerShape(16.dp))
                    .padding(16.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "CURRENT VALUES",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = textSubtle,
                        letterSpacing = 0.8.sp
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        VitalSummaryBox(
                            label = "BLOOD PRESSURE",
                            value = "${vitals.systolicBp}/${vitals.diastolicBp}",
                            unit = "mmHg",
                            iconRes = R.drawable.ic_heart_capsule,
                            iconColor = if (vitals.isHypertensive) errorRed else brandTeal,
                            modifier = Modifier.weight(1f)
                        )
                        VitalSummaryBox(
                            label = "HEART RATE",
                            value = vitals.heartRateBpm.toString(),
                            unit = "bpm",
                            iconRes = R.drawable.ic_heart_capsule,
                            iconColor = if (vitals.isTachycardic) warningOrange else brandTeal,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        VitalSummaryBox(
                            label = "SpO₂",
                            value = vitals.spO2Percent.toString(),
                            unit = "%",
                            iconRes = R.drawable.ic_medical_cross,
                            iconColor = if (vitals.isHypoxic) errorRed else brandTeal,
                            modifier = Modifier.weight(1f)
                        )
                        VitalSummaryBox(
                            label = "TEMPERATURE",
                            value = String.format("%.1f", vitals.temperatureCelsius),
                            unit = "°C",
                            iconRes = R.drawable.ic_flask,
                            iconColor = if (vitals.hasFever) errorRed else brandTeal,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    VitalSummaryBox(
                        label = "PAIN SCORE",
                        value = vitals.painScore.toString(),
                        unit = "/10",
                        iconRes = R.drawable.ic_warning_triangle,
                        iconColor = if (vitals.hasSignificantPain) errorRed else brandTeal,
                        modifier = Modifier.fillMaxWidth(),
                        showProgress = true,
                        progress = vitals.painScore / 10f
                    )
                }
            }

            // Edit Form
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {

                // Blood Pressure
                VitalsEditCard(
                    title = "BLOOD PRESSURE",
                    iconRes = R.drawable.ic_heart_capsule,
                    borderColor = if (bpWarning) errorRed else borderLight
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        VitalsNumberField(
                            label = "Systolic",
                            value = systolicInput,
                            onValueChange = { systolicInput = it },
                            unit = "mmHg",
                            modifier = Modifier.weight(1f)
                        )
                        Text(
                            text = "/",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = textSubtle
                        )
                        VitalsNumberField(
                            label = "Diastolic",
                            value = diastolicInput,
                            onValueChange = { diastolicInput = it },
                            unit = "mmHg",
                            modifier = Modifier.weight(1f)
                        )
                    }
                }

                // Heart Rate
                VitalsEditCard(
                    title = "HEART RATE",
                    iconRes = R.drawable.ic_heart_capsule,
                    borderColor = if (hrWarning) warningOrange else borderLight
                ) {
                    VitalsNumberField(
                        label = "Heart Rate",
                        value = heartRateInput,
                        onValueChange = { heartRateInput = it },
                        unit = "bpm",
                        placeholder = "74",
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // SpO2
                VitalsEditCard(
                    title = "SPO₂",
                    iconRes = R.drawable.ic_medical_cross,
                    borderColor = if (spo2Warning) errorRed else borderLight
                ) {
                    VitalsNumberField(
                        label = "Oxygen Saturation",
                        value = spO2Input,
                        onValueChange = { spO2Input = it },
                        unit = "%",
                        placeholder = "98",
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Temperature
                VitalsEditCard(
                    title = "TEMPERATURE",
                    iconRes = R.drawable.ic_flask,
                    borderColor = if (tempWarning) errorRed else borderLight
                ) {
                    VitalsNumberField(
                        label = "Temperature",
                        value = temperatureInput,
                        onValueChange = { temperatureInput = it },
                        unit = "°C",
                        placeholder = "36.8",
                        keyboardType = KeyboardType.Decimal,
                        isDecimal = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                // Pain
                VitalsEditCard(
                    title = "PAIN SCORE",
                    iconRes = R.drawable.ic_warning_triangle,
                    borderColor = if (painScore >= 4) errorRed else borderLight
                ) {
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Pain level",
                                fontSize = 11.5.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF475569)
                            )
                            Box(
                                modifier = Modifier
                                    .background(brandTealLight, RoundedCornerShape(8.dp))
                                    .border(1.dp, Color(0xFF6EE7B7), RoundedCornerShape(8.dp))
                                    .padding(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "$painScore/10",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (painScore >= 4) errorRed else brandTeal
                                )
                            }
                        }

                        Slider(
                            value = painScore.toFloat(),
                            onValueChange = { painScore = it.toInt() },
                            valueRange = 0f..10f,
                            colors = SliderDefaults.colors(
                                activeTrackColor = if (painScore >= 4) errorRed else brandTeal,
                                inactiveTrackColor = Color(0xFFE2E8F0),
                                activeTickColor = if (painScore >= 4) errorRed else brandTeal,
                                inactiveTickColor = Color(0xFFCBD5E1),
                                thumbColor = if (painScore >= 4) errorRed else brandTeal
                            ),
                            steps = 9,
                            modifier = Modifier.fillMaxWidth()
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("No pain", fontSize = 9.5.sp, color = textSubtle)
                            Text("Mild", fontSize = 9.5.sp, color = textSubtle)
                            Text("Moderate", fontSize = 9.5.sp, color = textSubtle)
                            Text("Severe", fontSize = 9.5.sp, color = textSubtle)
                        }
                    }
                }
            }
        }

        // Bottom Save Bar
        Row(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .fillMaxWidth()
                .background(white)
                .border(width = 1.dp, color = borderLight)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedButton(
                onClick = onBackClick,
                modifier = Modifier.height(48.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    "Cancel",
                    fontSize = 13.5.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF334155)
                )
            }

            Button(
                onClick = {
                    val updated = vitals.copy(
                        systolicBp = systolicValid ?: vitals.systolicBp,
                        diastolicBp = diastolicValid ?: vitals.diastolicBp,
                        heartRateBpm = heartRateValid ?: vitals.heartRateBpm,
                        spO2Percent = spo2Valid ?: vitals.spO2Percent,
                        temperatureCelsius = temperatureValid ?: vitals.temperatureCelsius,
                        painScore = painScore
                    )
                    onSaveClick(updated)
                },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = brandTeal,
                    contentColor = white
                )
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_check_mark),
                    contentDescription = null,
                    tint = white,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    "Save Vitals",
                    fontSize = 13.5.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
private fun VitalSummaryBox(
    label: String,
    value: String,
    unit: String,
    iconRes: Int,
    iconColor: Color,
    modifier: Modifier = Modifier,
    showProgress: Boolean = false,
    progress: Float = 0f
) {
    val bgLight = Color(0xFFF8FAFC)
    val borderLight = Color(0xFFE2E8F0)
    val textHeading = Color(0xFF1E293B)
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
            verticalArrangement = Arrangement.spacedBy(6.dp
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
                Text(value, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = if (showProgress) iconColor else textHeading)
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
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                    ) {
                        val clamped = progress.coerceIn(0f, 1f)
                        Box(
                            modifier = Modifier
                                .weight(clamped)
                                .fillMaxHeight()
                                .background(iconColor, RoundedCornerShape(3.dp))
                        )
                        Box(
                            modifier = Modifier
                                .weight(1f - clamped)
                                .fillMaxHeight()
                                .background(borderLight, RoundedCornerShape(3.dp))
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun VitalsEditCard(
    title: String,
    iconRes: Int,
    borderColor: Color = Color(0xFFE2E8F0),
    content: @Composable ColumnScope.() -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.5.dp, borderColor, RoundedCornerShape(16.dp))
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
private fun VitalsNumberField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    unit: String = "",
    placeholder: String = "",
    keyboardType: KeyboardType = KeyboardType.Number,
    isDecimal: Boolean = false,
    modifier: Modifier = Modifier
) {
    val filteredValue = if (isDecimal) {
        value
    } else {
        value.filter { it.isDigit() }.take(4)
    }

    Column(modifier = modifier) {
        Text(
            text = "$label ($unit)",
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF475569),
            modifier = Modifier.padding(bottom = 4.dp)
        )
        OutlinedTextField(
            value = filteredValue,
            onValueChange = { newValue ->
                onValueChange(
                    if (isDecimal) {
                        newValue.take(5)
                    } else {
                        newValue.filter { it.isDigit() }.take(4)
                    }
                )
            },
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
                focusedBorderColor = Color(0xFF0F766E),
                unfocusedBorderColor = Color(0xFFCBD5E1),
                focusedContainerColor = Color(0xFFF8FAFC),
                unfocusedContainerColor = Color(0xFFF8FAFC)
            )
        )
    }
}
