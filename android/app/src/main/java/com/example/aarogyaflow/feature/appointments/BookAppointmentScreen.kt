package com.example.aarogyaflow.feature.appointments

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R
import java.time.LocalDate
import java.time.LocalTime
import java.time.format.DateTimeFormatter

@Composable
fun BookAppointmentScreen(
    doctors: List<Doctor>,
    onBackClick: () -> Unit,
    onConfirmClick: (doctor: Doctor, consultationType: ConsultationType, date: LocalDate, time: LocalTime) -> Unit
) {
    val brandTeal = Color(0xFF00594C)
    val brandTealDark = Color(0xFF044238)
    val bgLight = Color(0xFFF8FAFC)
    val textHeading = Color(0xFF1E293B)
    val textBody = Color(0xFF475569)
    val textMuted = Color(0xFF64748B)
    val borderLight = Color(0xFFE2E8F0)
    val accentTeal = Color(0xFF0F766E)

    var selectedDoctor by remember { mutableStateOf<Doctor?>(null) }
    var selectedDate by remember { mutableStateOf<LocalDate?>(null) }
    var selectedTime by remember { mutableStateOf<LocalTime?>(null) }

    val today = LocalDate.now()
    val dateOptions = listOf(
        today,
        today.plusDays(1),
        today.plusDays(2),
        today.plusDays(3),
        today.plusDays(4)
    )

    val formatter = DateTimeFormatter.ofPattern("EEE, MMM d")
    val timeFormatter = DateTimeFormatter.ofPattern("hh:mm a")

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
                    .background(Color.White)
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .background(Color(0xFFF1F5F9), CircleShape)
                        .clickable(
                            interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                            indication = null
                        ) { onBackClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_chevron_left),
                        contentDescription = "Back",
                        tint = textMuted,
                        modifier = Modifier.size(18.dp)
                    )
                }
                Text(
                    text = "Book Appointment",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = textHeading
                )
            }

            HorizontalDivider(color = borderLight)

            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                // Step 1: Select Doctor
                Text(
                    text = "Select Doctor or Hospital",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = textHeading,
                    letterSpacing = 0.5.sp
                )
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    doctors.forEach { doctor ->
                        val isSelected = selectedDoctor?.id == doctor.id
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(
                                    if (isSelected) Color(0xFFEEF2FF) else Color.White,
                                    RoundedCornerShape(16.dp)
                                )
                                .border(
                                    width = if (isSelected) 2.dp else 1.dp,
                                    color = if (isSelected) brandTeal else borderLight,
                                    shape = RoundedCornerShape(16.dp)
                                )
                                .clickable(
                                    interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                                    indication = null
                                ) { selectedDoctor = doctor }
                                .padding(16.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(44.dp)
                                            .background(
                                                if (isSelected) Color(0xFFE0F5F2) : Color(0xFFF1F5F9),
                                                RoundedCornerShape(12.dp)
                                            )
                                            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Image(
                                            painter = painterResource(id = R.drawable.ic_user_avatar),
                                            contentDescription = null,
                                            tint = if (isSelected) brandTeal else textMuted,
                                            modifier = Modifier.size(24.dp)
                                        )
                                    }
                                    Column {
                                        Text(
                                            text = doctor.name,
                                            fontSize = 15.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = textHeading
                                        )
                                        Text(
                                            text = "${doctor.specialty} • ${doctor.consultationType.displayName}",
                                            fontSize = 12.sp,
                                            color = textBody
                                        )
                                        Text(
                                            text = doctor.hospitalName,
                                            fontSize = 11.5.sp,
                                            color = textMuted
                                        )
                                    }
                                }
                                if (isSelected) {
                                    Image(
                                        painter = painterResource(id = R.drawable.ic_check_mark),
                                        contentDescription = "Selected",
                                        tint = brandTeal,
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            }
                        }
                    }
                }

                // Step 2: Select Date
                if (selectedDoctor != null) {
                    Text(
                        text = "Select Date",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading,
                        letterSpacing = 0.5.sp
                    )
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        dateOptions.forEach { date ->
                            val isSelected = selectedDate == date
                            val dayName = date.format(DateTimeFormatter.ofPattern("EEE"))
                            val dayNum = date.format(DateTimeFormatter.ofPattern("d"))
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .background(
                                        if (isSelected) brandTeal else Color.White,
                                        RoundedCornerShape(12.dp)
                                    )
                                    .border(
                                        1.dp,
                                        if (isSelected) brandTeal else borderLight,
                                        RoundedCornerShape(12.dp)
                                    )
                                    .clickable(
                                        interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                                        indication = null
                                    ) { selectedDate = date }
                                    .padding(vertical = 12.dp)
                            ) {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(
                                        text = dayName,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = if (isSelected) Color.White else textMuted
                                    )
                                    Text(
                                        text = dayNum,
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) Color.White else textHeading
                                    )
                                }
                            }
                        }
                    }
                }

                // Step 3: Select Time
                if (selectedDoctor != null && selectedDate != null) {
                    Text(
                        text = "Select Time Slot",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading,
                        letterSpacing = 0.5.sp
                    )
                    val timeOptions = listOf(
                        LocalTime.of(9, 0),
                        LocalTime.of(10, 30),
                        LocalTime.of(12, 0),
                        LocalTime.of(14, 30),
                        LocalTime.of(16, 0),
                        LocalTime.of(17, 30)
                    )
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        timeOptions.forEach { time ->
                            val isSelected = selectedTime == time
                            val isAvailable = doctorHasSlot(selectedDoctor!!, selectedDate!!, time)
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .background(
                                        when {
                                            isSelected -> Color(0xFFECFDF5)
                                            isAvailable -> Color.White
                                            else -> Color(0xFFF8FAFC)
                                        },
                                        RoundedCornerShape(10.dp)
                                    )
                                    .border(
                                        1.5.dp,
                                        when {
                                            isSelected -> accentTeal
                                            isAvailable -> borderLight
                                            else -> Color(0xFFE2E8F0)
                                        },
                                        RoundedCornerShape(10.dp)
                                    )
                                    .clickable(
                                        interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                                        indication = null
                                    ) {
                                        if (isAvailable) selectedTime = time
                                    }
                                    .padding(14.dp)
                            ) {
                                Text(
                                    text = time.format(timeFormatter),
                                    fontSize = 14.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = when {
                                        isSelected -> accentTeal
                                        isAvailable -> textHeading
                                        else -> textMuted
                                    }
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
            }

            // Bottom Action
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .border(width = 1.dp, color = borderLight)
                    .padding(horizontal = 20.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = onBackClick,
                    modifier = Modifier.height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = textBody)
                ) {
                    Text("Cancel", fontSize = 13.5.sp, fontWeight = FontWeight.Medium)
                }

                Button(
                    onClick = {
                        if (selectedDoctor != null && selectedDate != null && selectedTime != null) {
                            onConfirmClick(
                                selectedDoctor!!,
                                selectedDoctor!!.consultationType,
                                selectedDate!!,
                                selectedTime!!
                            )
                        }
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (selectedDoctor != null && selectedDate != null && selectedTime != null) accentTeal else Color(0xFF94A3B8),
                        contentColor = Color.White
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp),
                    enabled = selectedDoctor != null && selectedDate != null && selectedTime != null
                ) {
                    Text(
                        text = "Confirm",
                        fontSize = 13.5.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

private fun doctorHasSlot(doctor: Doctor, date: LocalDate, time: LocalTime): Boolean {
    return doctor.availableSlots.any { slot ->
        slot.date == date && slot.time == time && slot.isAvailable
    }
}
