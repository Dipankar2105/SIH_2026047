package com.example.aarogyaflow.feature.healthrecords

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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@Composable
fun HealthRecordsScreen(
    healthRecords: List<HealthRecord>,
    onBackClick: () -> Unit,
    onAddRecordClick: () -> Unit,
    onRecordSaved: (HealthRecord) -> Unit
) {
    val brandTeal = Color(0xFF00594C)
    val brandTealDark = Color(0xFF044238)
    val bgLight = Color(0xFFF5F8F9)
    val textHeading = Color(0xFF111827)
    val textSubtitle = Color(0xFF4B5563)
    val textMuted = Color(0xFF6B7280)
    val borderLight = Color(0xFFE5E7EB)
    val accentTeal = Color(0xFF0F766E)

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
                            tint = Color(0xFF4B5563),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Text(
                        text = "My Health Records",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading
                    )
                }

                // Add Record Button
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .clickable(
                            interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                            indication = null
                        ) { onAddRecordClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_plus),
                        contentDescription = "Add Record",
                        tint = brandTeal,
                        modifier = Modifier.size(20.dp)
                    )
                }
            }

            HorizontalDivider(color = borderLight)

            // Content
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                if (healthRecords.isEmpty()) {
                    // Empty State
                    EmptyState(
                        onAddRecordClick = onAddRecordClick,
                        accentTeal = accentTeal,
                        bgLight = bgLight
                    )
                } else {
                    // Records List
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        healthRecords.forEach { record ->
                            HealthRecordCard(
                                record = record,
                                onClick = { /* View record detail */ }
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyState(
    onAddRecordClick: () -> Unit,
    accentTeal: Color,
    bgLight: Color
) {
    val textHeading = Color(0xFF111827)
    val textBody = Color(0xFF4B5563)
    val textMuted = Color(0xFF6B7280)
    val borderLight = Color(0xFFE5E7EB)

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .weight(1f),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(96.dp)
                .background(Color(0xFFECFDF5), CircleShape)
                .border(1.dp, Color(0xFFA7F3D0), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Image(
                painter = painterResource(id = R.drawable.ic_document_text),
                contentDescription = null,
                tint = accentTeal,
                modifier = Modifier.size(44.dp)
            )
        }
        Spacer(modifier = Modifier.height(20.dp))
        Text(
            text = "No Health Records Yet",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = textHeading
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Your lab reports, prescriptions, and health documents will appear here.",
            fontSize = 14.sp,
            color = textBody,
            textAlign = TextAlign.Center,
            lineHeight = 20.sp,
            modifier = Modifier.padding(horizontal = 24.dp)
        )
        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = onAddRecordClick,
            modifier = Modifier
                .width(200.dp)
                .height(48.dp),
            shape = RoundedCornerShape(16.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = accentTeal,
                contentColor = Color.White
            )
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.ic_plus),
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(18.dp)
                )
                Text(
                    text = "Add Record",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }
    }
}

@Composable
private fun HealthRecordCard(
    record: HealthRecord,
    onClick: () -> Unit
) {
    val textHeading = Color(0xFF111827)
    val textBody = Color(0xFF4B5563)
    val textMuted = Color(0xFF6B7280)
    val borderLight = Color(0xFFE5E7EB)
    val accentTeal = Color(0xFF0F766E)

    val typeColor = when (record.type) {
        RecordType.LAB_REPORT -> Color(0xFF2563EB)
        RecordType.PRESCRIPTION -> Color(0xFF7C3AED)
        RecordType.DISCHARGE_SUMMARY -> Color(0xFFDC2626)
        RecordType.IMAGING -> Color(0xFF0891B2)
        RecordType.VACCINATION -> Color(0xFF059669)
        RecordType.OTHER -> Color(0xFF64748B)
    }

    val typeIcon = when (record.type) {
        RecordType.LAB_REPORT -> R.drawable.ic_flask
        RecordType.PRESCRIPTION -> R.drawable.ic_pills
        RecordType.DISCHARGE_SUMMARY -> R.drawable.ic_hospital
        RecordType.IMAGING -> R.drawable.ic_image
        RecordType.VACCINATION -> R.drawable.ic_shield_check
        RecordType.OTHER -> R.drawable.ic_document_text
    }

    val formatter = DateTimeFormatter.ofPattern("dd MMM yyyy").withZone(ZoneId.systemDefault())
    val dateString = formatter.format(record.date)

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, borderLight, RoundedCornerShape(16.dp))
            .clickable(
                interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                indication = null
            ) { onClick() }
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(typeColor.copy(alpha = 0.12f), RoundedCornerShape(12.dp))
                    .border(1.dp, typeColor.copy(alpha = 0.2f), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = typeIcon),
                    contentDescription = null,
                    tint = typeColor,
                    modifier = Modifier.size(22.dp)
                )
            }

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = record.name,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading,
                        maxLines = 1,
                        overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                    )
                    Box(
                        modifier = Modifier
                            .background(typeColor.copy(alpha = 0.1f), RoundedCornerShape(6.dp))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = record.type.displayName,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = typeColor
                        )
                    }
                }
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_calendar),
                            contentDescription = null,
                            tint = textMuted,
                            modifier = Modifier.size(13.dp)
                        )
                        Text(
                            text = dateString,
                            fontSize = 12.sp,
                            color = textMuted
                        )
                    }
                    if (record.status == RecordStatus.SAVED) {
                        Box(
                            modifier = Modifier
                                .background(Color(0xFFECFDF5), RoundedCornerShape(6.dp))
                                .padding(horizontal = 8.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = "Saved locally",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Medium,
                                color = accentTeal
                            )
                        }
                    }
                }
            }

            Image(
                painter = painterResource(id = R.drawable.ic_chevron_right_small),
                contentDescription = "View",
                tint = textMuted,
                modifier = Modifier.size(16.dp)
            )
        }
    }
}

@Composable
fun SaveSuccessDialog(
    isVisible: Boolean,
    onDismiss: () -> Unit,
    onViewRecords: () -> Unit
) {
    if (!isVisible) return

    val brandTeal = Color(0xFF00594C)
    val accentTeal = Color(0xFF0F766E)
    val textHeading = Color(0xFF1E293B)
    val textBody = Color(0xFF475569)

    androidx.compose.material3.AlertDialog(
        onDismissRequest = onDismiss,
        modifier = Modifier.padding(24.dp),
        title = {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(64.dp)
                        .background(Color(0xFFECFDF5), CircleShape)
                        .border(1.dp, Color(0xFFA7F3D0), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_check_mark),
                        contentDescription = null,
                        tint = accentTeal,
                        modifier = Modifier.size(28.dp)
                    )
                }
                Text(
                    text = "Record Saved Successfully",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = textHeading,
                    textAlign = TextAlign.Center
                )
            }
        },
        text = {
            Text(
                text = "Your health record has been saved and will appear in your records list.",
                fontSize = 14.sp,
                color = textBody,
                textAlign = TextAlign.Center,
                lineHeight = 20.sp
            )
        },
        confirmButton = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onDismiss,
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFFF1F5F9),
                        contentColor = Color(0xFF334155)
                    )
                ) {
                    Text("Dismiss", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                }
                Button(
                    onClick = {
                        onDismiss()
                        onViewRecords()
                    },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = brandTeal,
                        contentColor = Color.White
                    )
                ) {
                    Text("View Records", fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                }
            }
        },
        dismissButton = null
    )
}