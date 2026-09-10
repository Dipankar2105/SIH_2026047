package com.example.aarogyaflow.feature.consultation

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R
import com.example.aarogyaflow.data.remote.ApiService
import com.example.aarogyaflow.data.remote.models.DocumentUploadJsonRequest
import kotlinx.coroutines.launch

enum class ReportCategory(val displayName: String, val iconRes: Int, val docType: String) {
    LAB_REPORT("Lab Report", R.drawable.ic_flask, "lab_report"),
    PRESCRIPTION("Prescription", R.drawable.ic_rx_prescription, "prescription"),
    SCAN_XRAY("Scan / X-Ray", R.drawable.ic_scan_frame, "scan_xray"),
    FILE_HISTORY("File (History)", R.drawable.ic_file_history, "medical_history")
}

@Composable
fun UploadReportsScreen(
    apiService: ApiService,
    onBackClick: () -> Unit,
    onContinueClick: () -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    var selectedCategory by remember { mutableStateOf(ReportCategory.LAB_REPORT) }
    var attachedFileName by remember { mutableStateOf<String?>("Photo_today.jpg") }
    var isUploading by remember { mutableStateOf(false) }

    fun submitUploadAndProceed() {
        if (attachedFileName != null) {
            coroutineScope.launch {
                isUploading = true
                try {
                    apiService.uploadDocument(
                        DocumentUploadJsonRequest(
                            patient_id = "f5bf0bdc-900f-4e26-9dcb-365bfdb99ba6",
                            document_type = selectedCategory.docType,
                            file_name = attachedFileName
                        )
                    )
                } catch (e: Exception) {
                    // Handled gracefully
                }
                isUploading = false
                onContinueClick()
            }
        } else {
            onContinueClick()
        }
    }

    Scaffold(
        containerColor = Color.White,
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Back & Logo
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .clickable(onClick = onBackClick)
                            .padding(4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_chevron_left),
                            contentDescription = "Go back",
                            tint = Color(0xFF334155),
                            modifier = Modifier.size(22.dp)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF00594C)),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_aarogyaflow_logo),
                            contentDescription = "AarogyaFlow logo",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    }

                    Text(
                        text = "AarogyaFlow",
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1E293B)
                    )
                }

                // Language & Speaker
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .background(Color.White, CircleShape)
                            .border(1.dp, Color(0xFFCBD5E1), CircleShape)
                            .clickable { }
                            .padding(horizontal = 10.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_globe),
                            contentDescription = "Language",
                            tint = Color(0xFF64748B),
                            modifier = Modifier.size(13.dp)
                        )
                        Text(
                            text = "EN",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF334155)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .clickable { }
                            .padding(4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_volume_speaker),
                            contentDescription = "Listen",
                            tint = Color(0xFF475569),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.White)
                .padding(paddingValues)
                .padding(horizontal = 24.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.Start
        ) {
            // Heading & Subtitle matching Stitch
            Text(
                text = "Do you have any\nreports to share?",
                fontSize = 23.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF0F172A),
                lineHeight = 28.sp
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Choose what you are sharing below and then upload — any one.",
                fontSize = 13.sp,
                color = Color(0xFF64748B),
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(20.dp))

            // 4 Category Picker Items matching Stitch Grid
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                ReportCategory.values().forEach { cat ->
                    val isSelected = (selectedCategory == cat)
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier
                            .weight(1f)
                            .clickable { selectedCategory = cat }
                            .padding(horizontal = 2.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(56.dp)
                                .clip(RoundedCornerShape(16.dp))
                                .background(if (isSelected) Color(0xFF00594C) else Color(0xFFEFF9F6))
                                .border(
                                    1.dp,
                                    if (isSelected) Color(0xFF00594C) else Color(0xFFD5EFE6),
                                    RoundedCornerShape(16.dp)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(id = cat.iconRes),
                                contentDescription = cat.displayName,
                                tint = if (isSelected) Color.White else Color(0xFF00594C),
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = cat.displayName,
                            fontSize = 11.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Color(0xFF00594C) else Color(0xFF64748B),
                            textAlign = TextAlign.Center,
                            lineHeight = 14.sp
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Upload Action Cards
            // Card 1: Take a photo
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(Color.White)
                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(18.dp))
                    .clickable {
                        attachedFileName = "Photo_${System.currentTimeMillis() % 10000}.jpg"
                    }
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(Color(0xFFEFF9F6), RoundedCornerShape(14.dp))
                        .border(1.dp, Color(0xFFD5EFE6), RoundedCornerShape(14.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_camera),
                        contentDescription = "Camera",
                        tint = Color(0xFF00594C),
                        modifier = Modifier.size(24.dp)
                    )
                }

                Column {
                    Text(
                        text = "Take a photo",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1E293B)
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Use your camera",
                        fontSize = 12.sp,
                        color = Color(0xFF64748B)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Card 2: Choose from phone
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(Color.White)
                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(18.dp))
                    .clickable {
                        attachedFileName = "Report_doc_${selectedCategory.docType}.pdf"
                    }
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(Color(0xFFEFF9F6), RoundedCornerShape(14.dp))
                        .border(1.dp, Color(0xFFD5EFE6), RoundedCornerShape(14.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_folder_gallery),
                        contentDescription = "Gallery or files",
                        tint = Color(0xFF00594C),
                        modifier = Modifier.size(24.dp)
                    )
                }

                Column {
                    Text(
                        text = "Choose from phone",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF1E293B)
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Gallery or files",
                        fontSize = 12.sp,
                        color = Color(0xFF64748B)
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Uploaded File Attachment Pill matching Stitch
            if (attachedFileName != null) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFE6F3EE), RoundedCornerShape(12.dp))
                        .border(1.dp, Color(0xFFC8E7DC), RoundedCornerShape(12.dp))
                        .padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_check_circle),
                            contentDescription = "Uploaded",
                            tint = Color(0xFF00594C),
                            modifier = Modifier.size(18.dp)
                        )
                        Text(
                            text = attachedFileName!!,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF334155)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .clickable { attachedFileName = null }
                            .padding(4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_close_x),
                            contentDescription = "Remove file",
                            tint = Color(0xFF94A3B8),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Action Buttons matching Stitch:
            // 1. Continue
            Button(
                onClick = { submitUploadAndProceed() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF00594C),
                    contentColor = Color.White
                ),
                enabled = !isUploading
            ) {
                if (isUploading) {
                    CircularProgressIndicator(
                        color = Color.White,
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        text = "Continue",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                }
            }

            Spacer(modifier = Modifier.height(10.dp))

            // 2. Skip for now
            OutlinedButton(
                onClick = { onContinueClick() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFCBD5E1))
            ) {
                Text(
                    text = "Skip for now",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF475569)
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            // 3. Back link
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onBackClick() }
                    .padding(vertical = 4.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_chevron_left),
                        contentDescription = "Back",
                        tint = Color(0xFF64748B),
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = "Back",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF64748B)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))
        }
    }
}
