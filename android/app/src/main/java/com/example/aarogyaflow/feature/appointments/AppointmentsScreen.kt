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
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R
import java.time.format.DateTimeFormatter

@Composable
fun AppointmentsScreen(
    upcomingAppointments: List<Appointment>,
    pastAppointments: List<Appointment>,
    activeQueue: QueueInfo?,
    onBackClick: () -> Unit,
    onBookAppointmentClick: () -> Unit,
    onViewAppointmentClick: (Appointment) -> Unit
) {
    val brandTeal = Color(0xFF00594C)
    val brandTealDark = Color(0xFF044238)
    val bgLight = Color(0xFFF5F8F9)
    val textHeading = Color(0xFF111827)
    val textBody = Color(0xFF4B5563)
    val textMuted = Color(0xFF6B7280)
    val borderLight = Color(0xFFE5E7EB)
    val accentTeal = Color(0xFF0F766E)
    val successGreen = Color(0xFF059669)

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
                    .padding(horizontal = 20.dp, vertical = 14.dp),
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
                        text = "Appointments / Queue",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading
                    )
                }

                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .clickable(
                            interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                            indication = null
                        ) { onBookAppointmentClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_plus),
                        contentDescription = "Book Appointment",
                        tint = brandTeal,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            HorizontalDivider(color = borderLight)

            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Active Queue Card
                if (activeQueue != null) {
                    QueueCard(
                        queueInfo = activeQueue,
                        accentTeal = accentTeal,
                        textHeading = textHeading,
                        textMuted = textMuted,
                        borderLight = borderLight
                    )
                }

                // Upcoming Appointments
                if (upcomingAppointments.isNotEmpty()) {
                    Text(
                        text = "UPCOMING",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = textMuted,
                        letterSpacing = 0.8.sp
                    )
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        upcomingAppointments.forEach { appointment ->
                            AppointmentCard(
                                appointment = appointment,
                                textHeading = textHeading,
                                textBody = textBody,
                                textMuted = textMuted,
                                borderLight = borderLight,
                                accentTeal = accentTeal,
                                onClick = { onViewAppointmentClick(appointment) }
                            )
                        }
                    }
                }

                // Booking CTA if no upcoming
                if (upcomingAppointments.isEmpty() && activeQueue == null) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.White, RoundedCornerShape(16.dp))
                            .border(1.dp, borderLight, RoundedCornerShape(16.dp))
                            .clickable { onBookAppointmentClick() }
                            .padding(20.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Box(
                                modifier = Modifier
                                    .size(56.dp)
                                    .background(Color(0xFFF0FDFA), CircleShape)
                                    .border(1.dp, Color(0xFFA7F3D0), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Image(
                                    painter = painterResource(id = R.drawable.ic_calendar),
                                    contentDescription = null,
                                    tint = accentTeal,
                                    modifier = Modifier.size(26.dp)
                                )
                            }
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "No Upcoming Appointments",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = textHeading
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Book your next consultation",
                                fontSize = 13.sp,
                                color = textBody,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }

                // Past Appointments
                if (pastAppointments.isNotEmpty()) {
                    Text(
                        text = "PAST APPOINTMENTS",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = textMuted,
                        letterSpacing = 0.8.sp
                    )
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        pastAppointments.forEach { appointment ->
                            AppointmentCard(
                                appointment = appointment,
                                textHeading = textHeading,
                                textBody = textBody,
                                textMuted = textMuted,
                                borderLight = borderLight,
                                accentTeal = accentTeal,
                                onClick = { onViewAppointmentClick(appointment) },
                                isPast = true
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

@Composable
private fun QueueCard(
    queueInfo: QueueInfo,
    accentTeal: Color,
    textHeading: Color,
    textMuted: Color,
    borderLight: Color
) {
    val progress = if (queueInfo.totalAhead > 0) {
        1f - (queueInfo.totalAhead.toFloat() / (queueInfo.totalAhead + 1).toFloat())
    } else 1f

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, borderLight, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Live Queue",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = textHeading
                )
                Box(
                    modifier = Modifier
                        .background(Color(0xFFECFDF5), RoundedCornerShape(8.dp))
                        .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(8.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = queueInfo.status.displayName,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = accentTeal
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Your Token",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = textMuted
                    )
                    Text(
                        text = queueInfo.tokenNumber,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = accentTeal
                    )
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "Now Serving",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = textMuted
                    )
                    Text(
                        text = queueInfo.currentServingToken,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "Est. Wait",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = textMuted
                    )
                    Text(
                        text = "${queueInfo.estimatedWaitMinutes} min",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading
                    )
                }
            }

            Text(
                text = "${queueInfo.totalAhead} people ahead of you",
                fontSize = 12.sp,
                color = textMuted
            )
        }
    }
}

@Composable
private fun AppointmentCard(
    appointment: Appointment,
    textHeading: Color,
    textBody: Color,
    textMuted: Color,
    borderLight: Color,
    accentTeal: Color,
    onClick: () -> Unit,
    isPast: Boolean = false
) {
    val statusColor = when (appointment.queueStatus) {
        QueueStatus.COMPLETED -> Color(0xFF059669)
        QueueStatus.CANCELLED -> Color(0xFFDC2626)
        else -> accentTeal
    }

    val statusBg = when (appointment.queueStatus) {
        QueueStatus.COMPLETED -> Color(0xFFECFDF5)
        QueueStatus.CANCELLED -> Color(0xFFFFF1F2)
        QueueStatus.IN_PROGRESS -> Color(0xFFECFDF5)
        QueueStatus.UPCOMING -> Color(0xFFEEF2FF)
    }

    val formatter = DateTimeFormatter.ofPattern("EEE, dd MMM • hh:mm a")

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, borderLight, RoundedCornerShape(16.dp))
            .clickable(
                interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                indication = null
            ) { if (!isPast) onClick() }
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(12.dp)
                            .background(statusColor, CircleShape)
                    )
                    Text(
                        text = appointment.queueStatus.displayName,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = statusColor
                    )
                }
                Box(
                    modifier = Modifier
                        .background(statusBg, RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = appointment.consultationType.displayName,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = statusColor
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = appointment.doctorName,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading
                    )
                    Text(
                        text = appointment.doctorSpecialty,
                        fontSize = 13.sp,
                        color = textBody
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = appointment.hospitalName,
                        fontSize = 12.sp,
                        color = textMuted
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = appointment.dateTime.format(formatter),
                        fontSize = 12.sp,
                        color = textBody
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(
                        text = "Token",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        color = textMuted
                    )
                    Text(
                        text = appointment.tokenNumber,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = accentTeal
                    )
                }
            }

            if (appointment.notes != null && !isPast) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = appointment.notes!!,
                    fontSize = 11.5.sp,
                    color = textMuted
                )
            }
        }
    }
}
