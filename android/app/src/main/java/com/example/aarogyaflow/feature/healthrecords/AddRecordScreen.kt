package com.example.aarogyaflow.feature.healthrecords

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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun AddRecordScreen(
    onBackClick: () -> Unit,
    onRecordSelected: (HealthRecord) -> Unit
) {
    val brandTeal = Color(0xFF00594C)
    val brandTealDark = Color(0xFF044238)
    val bgLight = Color(0xFFF8FAFC)
    val textHeading = Color(0xFF1E293B)
    val textBody = Color(0xFF475569)
    val textMuted = Color(0xFF64748B)
    val borderLight = Color(0xFFE2E8F0)
    val accentTeal = Color(0xFF0F766E)

    var selectedOption by remember { mutableStateOf<RecordInputOption?>(null) }
    var showFilePreview by remember { mutableStateOf(false) }
    var previewFileName by remember { mutableStateOf("") }

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
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(horizontal = 16.dp, vertical = 12.dp),
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
                            tint = Color(0xFF475569),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Text(
                        text = "Add Record",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading
                    )
                }
            }

            HorizontalDivider(color = borderLight)

            // Main Content
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 24.dp),
                verticalArrangement = Arrangement.spacedBy(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                if (!showFilePreview) {
                    // Question
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .background(Color(0xFFECFDF5), CircleShape)
                                .border(1.dp, Color(0xFFA7F3D0), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.ic_document_text),
                                contentDescription = null,
                                tint = accentTeal,
                                modifier = Modifier.size(32.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Do you have any reports\nto share?",
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = textHeading,
                            textAlign = TextAlign.Center,
                            lineHeight = 30.sp
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Add a lab report, prescription, or any health document",
                            fontSize = 14.sp,
                            color = textBody,
                            textAlign = TextAlign.Center,
                            lineHeight = 20.sp
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Options
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        RecordOptionCard(
                            option = RecordInputOption.TAKE_PHOTO,
                            isSelected = selectedOption == RecordInputOption.TAKE_PHOTO,
                            onClick = { selectedOption = RecordInputOption.TAKE_PHOTO }
                        )
                        RecordOptionCard(
                            option = RecordInputOption.CHOOSE_FROM_PHONE,
                            isSelected = selectedOption == RecordInputOption.CHOOSE_FROM_PHONE,
                            onClick = { selectedOption = RecordInputOption.CHOOSE_FROM_PHONE }
                        )
                    }

                    Spacer(modifier = Modifier.height(24.dp))

                    // Continue Button
                    Button(
                        onClick = {
                            if (selectedOption != null) {
                                showFilePreview = true
                                // Mock file name based on option
                                previewFileName = when (selectedOption) {
                                    RecordInputOption.TAKE_PHOTO -> "photo_${java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"))}.jpg"
                                    RecordInputOption.CHOOSE_FROM_PHONE -> "report_${java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"))}.pdf"
                                    else -> "document.pdf"
                                }
                            }
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (selectedOption != null) brandTeal else Color(0xFF94A3B8),
                            contentColor = Color.White
                        ),
                        enabled = selectedOption != null
                    ) {
                        Text(
                            text = "Continue",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                } else {
                    // File Preview State
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .background(Color(0xFFECFDF5), CircleShape)
                                .border(1.dp, Color(0xFFA7F3D0), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Image(
                                painter = painterResource(id = R.drawable.ic_check_mark),
                                contentDescription = null,
                                tint = accentTeal,
                                modifier = Modifier.size(36.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Report Ready to Save",
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = textHeading
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        // File preview card
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color.White, RoundedCornerShape(16.dp))
                                .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(16.dp))
                                .padding(16.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(48.dp)
                                        .background(Color(0xFFF0FDFA), RoundedCornerShape(12.dp))
                                        .border(1.dp, Color(0xFFCCFBF1), RoundedCornerShape(12.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Image(
                                        painter = painterResource(id = if (previewFileName.endsWith(".jpg") || previewFileName.endsWith(".png")) R.drawable.ic_image else R.drawable.ic_document_text),
                                        contentDescription = null,
                                        tint = accentTeal,
                                        modifier = Modifier.size(24.dp)
                                    )
                                }
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = previewFileName,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = textHeading,
                                        maxLines = 1,
                                        overflow = androidx.compose.ui.text.style.TextOverflow.Ellipsis
                                    )
                                    Spacer(modifier = Modifier.height(4.dp))
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .background(Color(0xFFECFDF5), RoundedCornerShape(6.dp))
                                                .padding(horizontal = 8.dp, vertical = 2.dp)
                                        ) {
                                            Text(
                                                text = "New",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = accentTeal
                                            )
                                        }
                                        Text(
                                            text = "Ready to save",
                                            fontSize = 12.sp,
                                            color = textBody
                                        )
                                    }
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Save Button
                        Button(
                            onClick = {
                                val record = HealthRecord(
                                    id = java.util.UUID.randomUUID().toString(),
                                    name = previewFileName,
                                    type = if (previewFileName.endsWith(".jpg") || previewFileName.endsWith(".png")) RecordType.IMAGING else RecordType.LAB_REPORT,
                                    fileName = previewFileName
                                )
                                onRecordSelected(record)
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp),
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = brandTeal,
                                contentColor = Color.White
                            )
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.Center,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Image(
                                    painter = painterResource(id = R.drawable.ic_check_mark),
                                    contentDescription = null,
                                    tint = Color.White,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Save Record",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color.White
                                )
                            }
                        }

                        // Retake/Change button
                        Text(
                            text = "Retake / Choose Different",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium,
                            color = brandTeal,
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable { showFilePreview = false; selectedOption = null }
                                .padding(vertical = 12.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

enum class RecordInputOption {
    TAKE_PHOTO(
        title = "Take Photo",
        subtitle = "Use camera to capture a document",
        iconRes = R.drawable.ic_camera
    ),
    CHOOSE_FROM_PHONE(
        title = "Choose from Phone",
        subtitle = "Select from gallery or files",
        iconRes = R.drawable.ic_folder_gallery
    );

    val title: String
    val subtitle: String
    val iconRes: Int
}

@Composable
private fun RecordOptionCard(
    option: RecordInputOption,
    isSelected: Boolean,
    onClick: () -> Unit
) {
    val accentTeal = Color(0xFF0F766E)
    val borderLight = Color(0xFFE2E8F0)
    val bgLight = Color(0xFFF8FAFC)

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(if (isSelected) Color(0xFFECFDF5) else Color.White, RoundedCornerShape(16.dp))
            .border(
                width = if (isSelected) 2.dp else 1.dp,
                color = if (isSelected) accentTeal else borderLight,
                shape = RoundedCornerShape(16.dp)
            )
            .clickable(
                interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                indication = null
            ) { onClick() }
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(if (isSelected) Color(0xFFCCFBF1) else Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
                    .border(1.dp, if (isSelected) accentTeal else Color(0xFFE2E8F0), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = option.iconRes),
                    contentDescription = null,
                    tint = if (isSelected) accentTeal else Color(0xFF64748B),
                    modifier = Modifier.size(24.dp)
                )
            }
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = option.title,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isSelected) Color(0xFF00594C) else Color(0xFF1E293B)
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = option.subtitle,
                    fontSize = 13.sp,
                    color = Color(0xFF64748B)
                )
            }
            if (isSelected) {
                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .background(accentTeal, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_check_mark),
                        contentDescription = "Selected",
                        tint = Color.White,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }
        }
    }
}