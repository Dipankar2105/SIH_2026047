package com.example.aarogyaflow.feature.prescriptions

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.Divider as TabDivider
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R
import java.time.ZoneId
import java.time.format.DateTimeFormatter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PrescriptionsScreen(
    prescriptions: List<Prescription>,
    recommendedTests: List<RecommendedTest>,
    onBackClick: () -> Unit,
    onUploadReportClick: (RecommendedTest) -> Unit
) {
    val bgLight = Color(0xFFF5F8F9)
    val brandTeal = Color(0xFF00594C)
    val brandTealDark = Color(0xFF044238)
    val textHeading = Color(0xFF111827)
    val textBody = Color(0xFF4B5563)
    val textMuted = Color(0xFF6B7280)
    val borderLight = Color(0xFFE5E7EB)
    val accentTeal = Color(0xFF0F766E)
    val successGreen = Color(0xFF059669)

    val tabs = listOf("Prescriptions", "Recommended Tests")
    var selectedTabIndex by rememberSaveable { mutableStateOf(0) }

    Scaffold(
        containerColor = bgLight,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Prescriptions & Tests",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_chevron_left),
                            contentDescription = "Back",
                            tint = textMuted
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color.White,
                    titleContentColor = textHeading
                ),
                dividerColor = borderLight
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Tab Row
            TabRow(
                selectedTabIndex = selectedTabIndex,
                containerColor = Color.White,
                contentColor = accentTeal,
                indicator = { tabPositions ->
                    TabRowDefaults.Indicator(
                        height = 3.dp,
                        color = accentTeal,
                        tabPositions = tabPositions
                    )
                }
            ) {
                val badgeCount = recommendedTests.count { it.status == TestStatus.RECOMMENDED }
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTabIndex == index,
                        onClick = { selectedTabIndex = index },
                        text = {
                            if (index == 1 && badgeCount > 0) {
                                BadgedBox(
                                    containerColor = Color(0xFFFEF3C7),
                                    badgeColor = Color(0xFFF59E0B)
                                ) {
                                    Badge(
                                        containerColor = Color(0xFFF59E0B),
                                        contentColor = Color.White
                                    ) {
                                        Text(
                                            text = badgeCount.toString(),
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }
                            Text(
                                text = title,
                                fontSize = 13.sp,
                                fontWeight = if (selectedTabIndex == index) FontWeight.Bold else FontWeight.Medium,
                                color = if (selectedTabIndex == index) accentTeal else textMuted
                            )
                        }
                    )
                }
                TabDivider(
                    thickness = 1.dp,
                    color = borderLight
                ) {}
            }

            // Tab Content
            when (selectedTabIndex) {
                0 -> {
                    if (prescriptions.isEmpty()) {
                        EmptyState(
                            title = "No Prescriptions",
                            subtitle = "Your prescriptions will appear here once shared by your doctor.",
                            iconRes = R.drawable.ic_document_text,
                            accentTeal = accentTeal,
                            textBody = textBody
                        )
                    } else {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .verticalScroll(rememberScrollState())
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            prescriptions.forEach { prescription ->
                                PrescriptionCard(
                                    prescription = prescription,
                                    textHeading = textHeading,
                                    textBody = textBody,
                                    textMuted = textMuted,
                                    borderLight = borderLight,
                                    accentTeal = accentTeal,
                                    onClick = { /* View prescription detail */ }
                                )
                            }
                        }
                    }
                }
                1 -> {
                    if (recommendedTests.isEmpty()) {
                        EmptyState(
                            title = "No Recommended Tests",
                            subtitle = "Your doctor may recommend diagnostic tests.",
                            iconRes = R.drawable.ic_flask,
                            accentTeal = accentTeal,
                            textBody = textBody
                        )
                    } else {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .verticalScroll(rememberScrollState())
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            recommendedTests.forEach { test ->
                                RecommendedTestCard(
                                    test = test,
                                    textHeading = textHeading,
                                    textBody = textBody,
                                    textMuted = textMuted,
                                    borderLight = borderLight,
                                    accentTeal = accentTeal,
                                    onUploadReportClick = { onUploadReportClick(test) }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyState(
    title: String,
    subtitle: String,
    iconRes: Int,
    accentTeal: Color,
    textBody: Color
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(80.dp)
                .background(Color(0xFFECFDF5), CircleShape)
                .border(1.dp, Color(0xFFA7F3D0), CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Image(
                painter = painterResource(id = iconRes),
                contentDescription = null,
                tint = accentTeal,
                modifier = Modifier.size(36.dp)
            )
        }
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = title,
            fontSize = 16.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF0F172A)
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = subtitle,
            fontSize = 13.sp,
            color = textBody,
            textAlign = TextAlign.Center,
            lineHeight = 18.sp
        )
    }
}

@Composable
private fun PrescriptionCard(
    prescription: Prescription,
    textHeading: Color,
    textBody: Color,
    textMuted: Color,
    borderLight: Color,
    accentTeal: Color,
    onClick: () -> Unit
) {
    val formatter = DateTimeFormatter.ofPattern("dd MMM yyyy").withZone(ZoneId.systemDefault())

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
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header: Medicine name + icon
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .background(Color(0xFFF0FDFA), RoundedCornerShape(10.dp))
                            .border(1.dp, Color(0xFFCCFBF1), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_pills),
                            contentDescription = null,
                            tint = accentTeal,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Text(
                        text = prescription.medicineName,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading
                    )
                }
                Text(
                    text = formatter.format(prescription.prescriptionDate),
                    fontSize = 11.sp,
                    color = textMuted
                )
            }

            // Details
            PrescriptionDetailRow(label = "Dose", value = prescription.dose, textBody = textBody, textHeading = textHeading)
            PrescriptionDetailRow(label = "Frequency", value = prescription.frequency, textBody = textBody, textHeading = textHeading)
            PrescriptionDetailRow(label = "Duration", value = prescription.duration, textBody = textBody, textHeading = textHeading)
            PrescriptionDetailRow(label = "Instructions", value = prescription.instructions, textBody = textBody, textHeading = textHeading)

            HorizontalDivider(color = borderLight)

            // Doctor
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Prescribed by",
                    fontSize = 11.sp,
                    color = textMuted
                )
                Text(
                    text = prescription.doctorName,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = textHeading
                )
            }
        }
    }
}

@Composable
private fun PrescriptionDetailRow(
    label: String,
    value: String,
    textBody: Color,
    textHeading: Color
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            fontSize = 12.sp,
            color = textBody
        )
        Text(
            text = value,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = textHeading,
            textAlign = TextAlign.End,
            modifier = Modifier.weight(1f)
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun RecommendedTestCard(
    test: RecommendedTest,
    textHeading: Color,
    textBody: Color,
    textMuted: Color,
    borderLight: Color,
    accentTeal: Color,
    onUploadReportClick: () -> Unit
) {
    val formatter = DateTimeFormatter.ofPattern("dd MMM yyyy").withZone(ZoneId.systemDefault())
    val statusColor = Color(android.graphics.Color.parseColor(test.status.colorHex))

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, borderLight, RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxWidth(),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .background(Color(0xFFEEF2FF), RoundedCornerShape(10.dp))
                            .border(1.dp, Color(0xFFCBD5E1), RoundedCornerShape(10.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_flask),
                            contentDescription = null,
                            tint = Color(0xFF6366F1),
                            modifier = Modifier.size(22.dp)
                        )
                    }
                    Text(
                        text = test.testName,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading
                    )
                }
                Box(
                    modifier = Modifier
                        .background(statusColor.copy(alpha = 0.1f), RoundedCornerShape(6.dp))
                        .border(1.dp, statusColor.copy(alpha = 0.3f), RoundedCornerShape(6.dp))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = test.status.displayName,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = statusColor
                    )
                }
            }

            // Details
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Recommended by",
                    fontSize = 11.5.sp,
                    color = textMuted
                )
                Text(
                    text = test.recommendedBy,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = textBody
                )
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Date recommended",
                    fontSize = 11.5.sp,
                    color = textMuted
                )
                Text(
                    text = formatter.format(test.dateRecommended),
                    fontSize = 12.sp,
                    color = textBody
                )
            }

            // Upload Report action for actionable statuses
            if (test.status == TestStatus.RECOMMENDED || test.status == TestStatus.TEST_DONE) {
                Spacer(modifier = Modifier.height(8.dp))
                HorizontalDivider(color = borderLight)
                Spacer(modifier = Modifier.height(8.dp))
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable(
                            interactionSource = remember { androidx.compose.foundation.interaction.MutableInteractionSource() },
                            indication = null
                        ) { onUploadReportClick() }
                        .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_paperclip),
                            contentDescription = null,
                            tint = Color(0xFF00594C),
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Upload Report",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF00594C)
                        )
                    }
                }
            }
        }
    }
}
