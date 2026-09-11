package com.example.aarogyaflow.feature.notifications

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

enum class NotificationCategory(val label: String) {
    ALL("All"),
    FAMILY("Family"),
    APPOINTMENTS("Appointments"),
    MEDICINES("Medicines"),
    HEALTH("Health")
}

data class NotificationItem(
    val id: String,
    val category: NotificationCategory,
    val categoryTag: String,
    val title: String,
    val body: String,
    val highlightedText: String? = null,
    val time: String,
    val actionText: String? = null,
    val isUnread: Boolean = false,
    val isCritical: Boolean = false,
    val section: String // "TODAY", "YESTERDAY", "EARLIER"
)

@Composable
fun NotificationsScreen(
    onBackClick: () -> Unit
) {
    // Exact Stitch color tokens for Notifications (notifications_aarogyaflow)
    val bgLight = Color(0xFFF8FAFC)
    val brandTeal = Color(0xFF005C4B)
    val textHeading = Color(0xFF0F172A)
    val textBody = Color(0xFF334155)
    val textMuted = Color(0xFF64748B)
    val textSubtle = Color(0xFF94A3B8)
    val borderLight = Color(0xFFF1F5F9)

    // Demo notification dataset matching Stitch
    var notifications by remember {
        mutableStateOf(
            listOf(
                NotificationItem(
                    id = "1",
                    category = NotificationCategory.FAMILY,
                    categoryTag = "Family Alert",
                    title = "Emergency SOS Triggered",
                    body = "Sunita Sharma (Mother) pressed the Emergency Alert at City Hospital OPD. Staff has been notified.",
                    highlightedText = "Sunita Sharma (Mother)",
                    time = "12 mins ago",
                    actionText = "View Alert Details →",
                    isUnread = true,
                    isCritical = true,
                    section = "TODAY"
                ),
                NotificationItem(
                    id = "2",
                    category = NotificationCategory.APPOINTMENTS,
                    categoryTag = "Appointments",
                    title = "Queue Update: Token #42",
                    body = "Dr. Sharma is now seeing Token #39. Your estimated wait time is approx 15 minutes at Room 204.",
                    highlightedText = "15 minutes",
                    time = "35 mins ago",
                    actionText = "Track Queue Status →",
                    isUnread = true,
                    isCritical = false,
                    section = "TODAY"
                ),
                NotificationItem(
                    id = "3",
                    category = NotificationCategory.MEDICINES,
                    categoryTag = "Medicines",
                    title = "Dosage Reminder: Pantoprazole",
                    body = "Take 1 tablet (40mg) before breakfast with warm water as prescribed for acid reflux.",
                    highlightedText = "1 tablet (40mg)",
                    time = "8:30 AM",
                    actionText = "Mark Taken",
                    isUnread = true,
                    isCritical = false,
                    section = "TODAY"
                ),
                NotificationItem(
                    id = "4",
                    category = NotificationCategory.HEALTH,
                    categoryTag = "Health Records",
                    title = "Lab Report Uploaded",
                    body = "CBC Blood Report was successfully processed & saved to your ABHA health locker.",
                    highlightedText = "CBC Blood Report",
                    time = "Yesterday, 4:15 PM",
                    actionText = "View Record →",
                    isUnread = false,
                    isCritical = false,
                    section = "YESTERDAY"
                ),
                NotificationItem(
                    id = "5",
                    category = NotificationCategory.APPOINTMENTS,
                    categoryTag = "Appointments",
                    title = "Consultation Confirmed",
                    body = "Confirmed with Dr. Sharma (General Medicine) for Today at 10:30 AM at City Hospital.",
                    highlightedText = "Dr. Sharma (General Medicine)",
                    time = "Yesterday, 11:00 AM",
                    actionText = "View Appointment →",
                    isUnread = false,
                    isCritical = false,
                    section = "YESTERDAY"
                ),
                NotificationItem(
                    id = "6",
                    category = NotificationCategory.FAMILY,
                    categoryTag = "Family Health",
                    title = "Vitals Logged: Sunita Sharma",
                    body = "Routine blood pressure updated: 132/84 mmHg (Vitals Stable).",
                    highlightedText = "132/84 mmHg (Vitals Stable)",
                    time = "Sep 08, 2:30 PM",
                    actionText = "View Summary →",
                    isUnread = false,
                    isCritical = false,
                    section = "EARLIER"
                )
            )
        )
    }

    var selectedCategory by remember { mutableStateOf(NotificationCategory.ALL) }

    val unreadCount = notifications.count { it.isUnread }
    val filteredList = remember(selectedCategory, notifications) {
        if (selectedCategory == NotificationCategory.ALL) {
            notifications
        } else {
            notifications.filter { it.category == selectedCategory }
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
        ) {
            // Header Navigation Bar
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
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // Back Button
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(Color(0xFFF1F5F9), RoundedCornerShape(10.dp))
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) { onBackClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_chevron_left),
                            contentDescription = "Back to Home",
                            tint = Color(0xFF334155),
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    // Logo + Title
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_aarogyaflow_logo),
                            contentDescription = "AarogyaFlow Logo",
                            modifier = Modifier
                                .size(26.dp)
                                .clip(RoundedCornerShape(6.dp))
                        )
                        Column {
                            Text(
                                text = "Notifications",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = textHeading
                            )
                            if (unreadCount > 0) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(6.dp)
                                            .background(Color(0xFF10B981), CircleShape)
                                    )
                                    Text(
                                        text = "$unreadCount Unread Updates",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFF047857)
                                    )
                                }
                            } else {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Icon(
                                        painter = painterResource(id = R.drawable.ic_check_circle),
                                        contentDescription = null,
                                        tint = Color(0xFF059669),
                                        modifier = Modifier.size(11.dp)
                                    )
                                    Text(
                                        text = "All caught up",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFF047857)
                                    )
                                }
                            }
                        }
                    }
                }

                // Action: "Mark all read" or "0 Unread"
                if (unreadCount > 0) {
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFF0FDFA), RoundedCornerShape(8.dp))
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) {
                                notifications = notifications.map { it.copy(isUnread = false) }
                            }
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Text(
                            text = "Mark all read",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF115E59)
                        )
                    }
                } else {
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFF1F5F9), RoundedCornerShape(8.dp))
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Text(
                            text = "0 Unread",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = textSubtle
                        )
                    }
                }
            }

            HorizontalDivider(color = borderLight)

            // Category Filter Chips Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .horizontalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                NotificationCategory.values().forEach { cat ->
                    val isSelected = cat == selectedCategory
                    val count = if (cat == NotificationCategory.ALL) notifications.size else notifications.count { it.category == cat }
                    val label = if (cat == NotificationCategory.ALL) "All ($count)" else cat.label

                    Row(
                        modifier = Modifier
                            .shadow(if (isSelected) 1.dp else 0.dp, CircleShape)
                            .background(
                                if (isSelected) brandTeal else Color(0xFFF1F5F9),
                                CircleShape
                            )
                            .clip(CircleShape)
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) { selectedCategory = cat }
                            .padding(horizontal = 14.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp)
                    ) {
                        Text(
                            text = label,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Color.White else Color(0xFF475569)
                        )
                        // Dot for category indicator if unread exist
                        if (!isSelected) {
                            val catUnread = notifications.any { it.category == cat && it.isUnread }
                            if (catUnread) {
                                val dotColor = when (cat) {
                                    NotificationCategory.FAMILY -> Color(0xFFF43F5E)
                                    NotificationCategory.APPOINTMENTS -> Color(0xFF10B981)
                                    NotificationCategory.MEDICINES -> Color(0xFFF59E0B)
                                    else -> Color.Transparent
                                }
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .background(dotColor, CircleShape)
                                )
                            }
                        }
                    }
                }
            }

            HorizontalDivider(color = borderLight)

            // Main Notification Content Area
            if (filteredList.isEmpty()) {
                // State B: Empty / All Caught Up Screen (notifications_all_read_empty_state)
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .padding(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        // Big Bell Icon Circle
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .background(Color(0xFFF0FDFA), CircleShape)
                                .border(1.dp, Color(0xFF99F6E4), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_bell),
                                contentDescription = null,
                                tint = brandTeal,
                                modifier = Modifier.size(36.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(18.dp))

                        Text(
                            text = "You're all caught up!",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = textHeading
                        )

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = "There are no notifications in this category. Any new queue updates, medication reminders, or family alerts will appear here.",
                            fontSize = 12.5.sp,
                            color = textMuted,
                            textAlign = TextAlign.Center,
                            lineHeight = 18.sp,
                            modifier = Modifier.widthIn(max = 280.dp)
                        )

                        Spacer(modifier = Modifier.height(20.dp))

                        // Reset filter button
                        if (selectedCategory != NotificationCategory.ALL) {
                            Button(
                                onClick = { selectedCategory = NotificationCategory.ALL },
                                colors = ButtonDefaults.buttonColors(containerColor = Color.White),
                                border = ButtonDefaults.outlinedButtonBorder,
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Text("View All Notifications", color = textBody, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            } else {
                // State A: Populated Notification List
                val sections = listOf("TODAY", "YESTERDAY", "EARLIER")

                Column(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                        .verticalScroll(rememberScrollState())
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    sections.forEach { sectionName ->
                        val sectionItems = filteredList.filter { it.section == sectionName }
                        if (sectionItems.isNotEmpty()) {
                            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                // Section Header
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 4.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = sectionName,
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF94A3B8),
                                        letterSpacing = 1.sp
                                    )
                                    val sectionNewCount = sectionItems.count { it.isUnread }
                                    if (sectionNewCount > 0) {
                                        Text(
                                            text = "$sectionNewCount new",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Medium,
                                            color = textSubtle
                                        )
                                    }
                                }

                                // Section Cards
                                sectionItems.forEach { item ->
                                    NotificationCard(item = item)
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))
                }
            }

            // Bottom Navigation Bar / Back to Home CTA
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .border(width = 1.dp, color = borderLight)
                    .padding(16.dp)
            ) {
                Button(
                    onClick = onBackClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = brandTeal,
                        contentColor = Color.White
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_home),
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Back to Home",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun NotificationCard(item: NotificationItem) {
    val isRose = item.isCritical
    val cardBg = if (isRose) Color(0xFFFFF1F2) else Color.White
    val cardBorder = if (isRose) Color(0xFFFECDD3) else if (item.isUnread) Color(0xFF99F6E4) else Color(0xFFE2E8F0)

    val iconBg = when {
        item.isCritical -> Color(0xFFE11D48)
        item.category == NotificationCategory.APPOINTMENTS && item.isUnread -> Color(0xFF0F766E)
        item.category == NotificationCategory.MEDICINES && item.isUnread -> Color(0xFFD97706)
        else -> Color(0xFFF1F5F9)
    }
    val iconTint = if (item.isUnread) Color.White else Color(0xFF0F766E)

    val iconRes = when (item.category) {
        NotificationCategory.FAMILY -> if (item.isCritical) R.drawable.ic_warning_triangle else R.drawable.ic_users_family
        NotificationCategory.APPOINTMENTS -> R.drawable.ic_calendar
        NotificationCategory.MEDICINES -> R.drawable.ic_pills
        NotificationCategory.HEALTH -> R.drawable.ic_document_text
        NotificationCategory.ALL -> R.drawable.ic_bell
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(1.dp, RoundedCornerShape(16.dp))
            .background(cardBg, RoundedCornerShape(16.dp))
            .border(1.dp, cardBorder, RoundedCornerShape(16.dp))
            .padding(14.dp)
    ) {
        Row(
            verticalAlignment = Alignment.Top,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Category Icon Badge
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(iconBg, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = iconRes),
                    contentDescription = null,
                    tint = iconTint,
                    modifier = Modifier.size(20.dp)
                )
            }

            // Notification Details
            Column(modifier = Modifier.weight(1f)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        // Category Tag
                        val tagBg = if (isRose) Color(0xFFFFE4E6) else Color(0xFFF1F5F9)
                        val tagText = if (isRose) Color(0xFF9F1239) else Color(0xFF475569)
                        Box(
                            modifier = Modifier
                                .background(tagBg, RoundedCornerShape(4.dp))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = item.categoryTag.uppercase(),
                                fontSize = 9.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = tagText,
                                letterSpacing = 0.5.sp
                            )
                        }

                        Text(
                            text = item.title,
                            fontSize = 13.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0F172A)
                        )
                    }

                    // Unread Indicator Dot
                    if (item.isUnread) {
                        val dotColor = if (isRose) Color(0xFFE11D48) else Color(0xFF0D9488)
                        Box(
                            modifier = Modifier
                                .size(8.dp)
                                .background(dotColor, CircleShape)
                        )
                    } else {
                        Text(
                            text = "Read",
                            fontSize = 10.sp,
                            color = Color(0xFF94A3B8),
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                // Body text
                Text(
                    text = item.body,
                    fontSize = 12.sp,
                    color = if (isRose) Color(0xFF334155) else Color(0xFF475569),
                    lineHeight = 17.sp
                )

                Spacer(modifier = Modifier.height(8.dp))

                // Time + Action Link
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = item.time,
                        fontSize = 11.sp,
                        color = Color(0xFF94A3B8),
                        fontWeight = FontWeight.Medium
                    )

                    if (item.actionText != null) {
                        if (item.actionText == "Mark Taken") {
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFFFEF3C7), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 10.dp, vertical = 3.dp)
                            ) {
                                Text(
                                    text = item.actionText,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF92400E)
                                )
                            }
                        } else {
                            val actionColor = if (isRose) Color(0xFFBE123C) else Color(0xFF0F766E)
                            Text(
                                text = item.actionText,
                                fontSize = 11.5.sp,
                                fontWeight = FontWeight.Bold,
                                color = actionColor
                            )
                        }
                    }
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun NotificationsScreenPreview() {
    MaterialTheme {
        NotificationsScreen(onBackClick = {})
    }
}
