package com.example.aarogyaflow.feature.appointments

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
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
fun AppointmentConfirmationScreen(
    appointment: Appointment,
    onBackToAppointmentsClick: () -> Unit
) {
    val brandTeal = Color(0xFF00594C)
    val accentTeal = Color(0xFF0F766E)
    val bgLight = Color(0xFFECFDF5)
    val textHeading = Color(0xFF0F172A)
    val textBody = Color(0xFF475569)
    val borderLight = Color(0xFFA7F3D0)

    val dateTimeFormatter = DateTimeFormatter.ofPattern("EEE, dd MMM yyyy")
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
                .padding(horizontal = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            // Success Icon
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .background(Color.White, CircleShape)
                    .border(1.dp, borderLight, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.ic_check_mark),
                    contentDescription = null,
                    tint = accentTeal,
                    modifier = Modifier.size(32.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Appointment Confirmed!",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = textHeading,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Your appointment has been booked successfully.",
                fontSize = 14.sp,
                color = textBody,
                textAlign = TextAlign.Center,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(24dp))

            // Appointment Details Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White, RoundedCornerShape(20.dp))
                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(20.dp))
                    .padding(20.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    // Token Number
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "Token Number",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = textBody,
                                letterSpacing = 0.8.sp
                            )
                            Text(
                                text = appointment.tokenNumber,
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold,
                                color = accentTeal
                            )
                        }
                        Box(
                            modifier = Modifier
                                .background(Color(0xFF0F766E).copy(alpha = 0.1f), RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = when (appointment.consultationType) {
                                    ConsultationType.MODERN_MEDICINE -> "allopathy"
                                    ConsultationType.AYUSH -> "ayush"
                                }.uppercase(),
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = accentTeal
                            )
                        }
                    }

                    HorizontalDivider(color = Color(0xFFE2E8F0))

                    // Doctor Info
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .background(Color(0xFFF0FDFA), CircleShape)
                                .border(1.dp, Color(0xFFCCFBF1), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.ic_user_avatar),
                                contentDescription = null,
                                tint = accentTeal,
                                modifier = Modifier.size(32.dp)
                            )
                        }
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
                        }
                        Image(
                            painter = painterResource(id = R.drawable.ic_check_circle),
                            contentDescription = "Confirmed",
                            tint = Color(0xFF059669),
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // Hospital
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_home),
                            contentDescription = null,
                            tint = textBody,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = appointment.hospitalName,
                            fontSize = 13.sp,
                            color = textBody
                        )
                    }

                    // Date & Time
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_calendar),
                            contentDescription = null,
                            tint = textBody,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "${appointment.dateTime.format(dateTimeFormatter)} at ${appointment.dateTime.format(timeFormatter)}",
                            fontSize = 13.sp,
                            color = textBody
                        )
                    }

                    // Consultation Type
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Image(
                            painter = painterResource(id = if (appointment.consultationType == ConsultationType.AYUSH) R.drawable.ic_herbs else R.drawable.ic_pills),
                            contentDescription = null,
                            tint = textBody,
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = appointment.consultationType.displayName,
                            fontSize = 13.sp,
                            color = textBody
                        )
                    }

                    // Queue Info
                    if (appointment.currentToken != null) {
                        HorizontalDivider(color = Color(0xFFE2E8F0))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("Current Token", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = textBody)
                                Text(appointment.currentToken!!, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = textHeading)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("Est. Wait", fontSize = 11.sp, fontWeight = FontWeight.Medium, color = textBody)
                                Text("${appointment.estimatedWaitMinutes}", fontSize = 14.sp, fontWeight = FontWeight.Bold, color = textHeading)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Queue Status Reminder
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(Color(0xFF059669), CircleShape)
                )
                Text(
                    text = "Please arrive 15 minutes before your scheduled time",
                    fontSize = 12.sp,
                    color = textBody,
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Action Button
            Button(
                onClick = onBackToAppointmentsClick,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = brandTeal,
                    contentColor = Color.White
                )
            ) {
                Text(
                    text = "Back to Appointments",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(12.dp))
        }
    }
}
