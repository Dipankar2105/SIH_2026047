package com.example.aarogyaflow.feature.family

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun FamilyMembersScreen(
    onBackClick: () -> Unit,
    onAddFamilyMemberClick: () -> Unit,
    onMemberClick: (FamilyMember) -> Unit,
    snackbarHostState: SnackbarHostState = remember { SnackbarHostState() }
) {
    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        containerColor = Color(0xFFF1F5F9)
    ) { padding ->
        FamilyMembersContent(
            modifier = Modifier.padding(padding),
            onBackClick = onBackClick,
            onAddFamilyMemberClick = onAddFamilyMemberClick,
            onMemberClick = onMemberClick
        )
    }
}

@Composable
private fun FamilyMembersContent(
    modifier: Modifier = Modifier,
    onBackClick: () -> Unit,
    onAddFamilyMemberClick: () -> Unit,
    onMemberClick: (FamilyMember) -> Unit
) {
    // Exact Stitch color tokens for Family Members (family_members_aarogyaflow)
    val bgLight = Color(0xFFF1F5F9)
    val brandTeal = Color(0xFF0D9488)
    val brandTealLight = Color(0xFFCCFBF1)
    val brandTealDark = Color(0xFF115E59)
    val textHeading = Color(0xFF0F172A)
    val textBody = Color(0xFF334155)
    val textMuted = Color(0xFF64748B)
    val textSubtle = Color(0xFF94A3B8)
    val borderLight = Color(0xFFE2E8F0)

    // Demo family members matching Stitch reference
    val familyMembers = remember {
        listOf(
            FamilyMember(
                id = "1",
                name = "Sunita Sharma",
                relationship = "Mother",
                age = 58,
                abhaNumber = "91-8842-1920-4102",
                avatarColor = "#FDF2F8",
                avatarInitials = "SS",
                healthSnapshot = "Hypertension (Managed) • Next BP Check in 4 days",
                activeRxCount = 2,
                statusBadge = "2 Active Rx",
                statusBadgeColor = "#0F766E",
                hasAlert = false
            ),
            FamilyMember(
                id = "2",
                name = "Rajesh Sharma",
                relationship = "Father",
                age = 62,
                abhaNumber = "91-3310-9281-7721",
                avatarColor = "#FFFBEB",
                avatarInitials = "RS",
                healthSnapshot = "Type 2 Diabetes • HbA1c: 6.8 (Normal)",
                activeRxCount = 0,
                statusBadge = "OPD Due",
                statusBadgeColor = "#64748B",
                hasAlert = false
            ),
            FamilyMember(
                id = "3",
                name = "Priya Sharma",
                relationship = "Spouse",
                age = 30,
                abhaNumber = "91-5541-6209-1148",
                avatarColor = "#F0FDF9",
                avatarInitials = "PS",
                healthSnapshot = "Allergies: Dust & Pollen • Flu Vaccine Done",
                activeRxCount = 0,
                statusBadge = "Vaccinated",
                statusBadgeColor = "#059669",
                hasAlert = false
            )
        )
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
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Back Button
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .background(Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
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

                    // Logo + Title
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_aarogyaflow_logo),
                            contentDescription = "AarogyaFlow Logo",
                            modifier = Modifier
                                .size(28.dp)
                                .clip(RoundedCornerShape(6.dp))
                        )
                        Column {
                            Text(
                                text = "Family Members",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = textHeading
                            )
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFFCCFBF1), RoundedCornerShape(8.dp))
                                    .padding(horizontal = 6.dp, vertical = 1.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "${familyMembers.size} Linked",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = Color(0xFF0F766E)
                                )
                            }
                        }
                    }
                }

                // Right Controls: Language, Audio
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Language Selector
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFF8FAFC), RoundedCornerShape(16.dp))
                            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(16.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(3.dp)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_globe),
                                contentDescription = "Language",
                                tint = Color(0xFF64748B),
                                modifier = Modifier.size(14.dp)
                            )
                            Text(
                                text = "EN",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF475569)
                            )
                        }
                    }

                    // Audio Listen Button
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .background(Color.White, CircleShape)
                            .border(1.dp, Color(0xFFE2E8F0), CircleShape)
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) { /* Audio handler */ },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_volume_speaker),
                            contentDescription = "Listen",
                            tint = Color(0xFF64748B),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }
            }

            HorizontalDivider(color = borderLight)

            // Scrollable Content
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Info Banner
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.horizontalGradient(
                                colors = listOf(
                                    Color(0xFFF0FDF9).copy(alpha = 0.8f),
                                    Color(0xFFECFDF5).copy(alpha = 0.5f)
                                )
                            ),
                            RoundedCornerShape(16.dp)
                        )
                        .border(1.dp, Color(0xFFCCFBF1), RoundedCornerShape(16.dp))
                        .padding(14.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(Color(0xFF0F766E), RoundedCornerShape(12.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_users_family),
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                        }
                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Linked Family Profiles",
                                    fontSize = 13.5.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = textHeading
                                )
                                Box(
                                    modifier = Modifier
                                        .background(Color.White, RoundedCornerShape(8.dp))
                                        .border(1.dp, Color(0xFF6EE7B7), RoundedCornerShape(8.dp))
                                        .padding(horizontal = 6.dp, vertical = 1.dp)
                                ) {
                                    Text(
                                        text = "ABHA Linked",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFF0F766E)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                text = "Manage consultations, digital prescriptions, and health records for dependents linked to your health locker.",
                                fontSize = 11.sp,
                                color = Color(0xFF475569),
                                lineHeight = 16.sp
                            )
                        }
                    }
                }

                // Add Family Member Button (Primary CTA)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.linearGradient(
                                colors = listOf(
                                    Color(0xFFF0FDF9).copy(alpha = 0.30f),
                                    Color.White.copy(alpha = 0.9f)
                                )
                            ),
                            RoundedCornerShape(16.dp)
                        )
                        .border(2.dp, Color(0xFF0D9488).copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) { onAddFamilyMemberClick() }
                        .padding(12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(24.dp)
                                .background(Color(0xFF0F766E), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_plus),
                                contentDescription = null,
                                tint = Color.White,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                        Text(
                            text = "Add Family Member via ABHA",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF115E59)
                        )
                    }
                }

                // Family Member List
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    familyMembers.forEach { member ->
                        FamilyMemberCard(
                            member = member,
                            onClick = { onMemberClick(member) }
                        )
                    }
                }

                // ABDM Consent Notice
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White.copy(alpha = 0.8f), RoundedCornerShape(12.dp))
                        .border(1.dp, Color(0xFFE2E8F0).copy(alpha = 0.8f), RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_shield_check),
                            contentDescription = null,
                            tint = Color(0xFF0F766E),
                            modifier = Modifier.size(16.dp)
                        )
                        Column {
                            Text(
                                text = "ABDM Consent & Privacy",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF334155)
                            )
                            Text(
                                text = "Health records of linked members are encrypted and shared strictly under Ayushman Bharat Digital Mission (ABDM) standards with verified OTP consent.",
                                fontSize = 11.sp,
                                color = Color(0xFF64748B),
                                lineHeight = 15.sp
                            )
                        }
                    }
                }

                // Empty State Preview (Collapsible)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White, RoundedCornerShape(12.dp))
                        .border(1.dp, borderLight, RoundedCornerShape(12.dp))
                        .padding(10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_chevron_right_small),
                                contentDescription = null,
                                tint = Color(0xFF94A3B8),
                                modifier = Modifier.size(12.dp)
                            )
                            Text(
                                text = "Empty state preview (if 0 members)",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF475569)
                            )
                        }
                        Text(
                            text = "View sample",
                            fontSize = 10.sp,
                            color = textSubtle
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Box(
                            modifier = Modifier
                                .size(40.dp)
                                .background(Color(0xFFF1F5F9), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_users_family),
                                contentDescription = null,
                                tint = Color(0xFF94A3B8),
                                modifier = Modifier.size(20.dp)
                            )
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "No family members added yet",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF334155)
                        )
                        Spacer(modifier = Modifier.height(2.dp))
                        Text(
                            text = "Tap '+ Add Family Member' to link your family's ABHA account and sync verified records.",
                            fontSize = 11.sp,
                            color = textMuted,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                            maxLines = 2
                        )
                    }
                }
            }

            // Bottom Actions
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .border(width = 1.dp, color = borderLight)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                // Primary: Add Family Member
                Button(
                    onClick = onAddFamilyMemberClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF0F766E),
                        contentColor = Color.White
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_plus),
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Add Family Member",
                        fontSize = 13.5.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                // Secondary: Back to Home
                OutlinedButton(
                    onClick = onBackClick,
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(44.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.outlinedButtonColors(
                        containerColor = Color.Transparent,
                        contentColor = Color(0xFF334155)
                    )
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_home),
                        contentDescription = null,
                        tint = Color(0xFF64748B),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "Back to Home",
                        fontSize = 12.5.sp,
                        fontWeight = FontWeight.Medium
                    )
                }

                // iOS Home Indicator
                Box(
                    modifier = Modifier
                        .width(128.dp)
                        .height(4.dp)
                        .background(Color(0xFFCBD5E1), CircleShape)
                        .align(Alignment.CenterHorizontally)
                        .padding(top = 8.dp)
                )
            }
        }
    }
}

@Composable
fun FamilyMemberCard(
    member: FamilyMember,
    onClick: () -> Unit
) {
    val statusBadgeColor = androidx.compose.ui.graphics.Color(android.graphics.Color.parseColor(member.statusBadgeColor))
    val avatarBgColor = androidx.compose.ui.graphics.Color(android.graphics.Color.parseColor(member.avatarColor))

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(1.dp, RoundedCornerShape(16.dp))
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, Color(0xFFE2E8F0).copy(alpha = 0.9f), RoundedCornerShape(16.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onClick() }
            .padding(12.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        // Top Row: Avatar + Details + Arrow
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.Top,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Avatar - Fixed size
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(avatarBgColor, RoundedCornerShape(16.dp))
                    .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(16.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = member.avatarInitials,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF334155)
                )
            }

            // Member Details - Flexible space
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                // Name + Relationship/Age Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = member.name,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0F172A),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f, fill = true)
                    )
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFF1F5F9), RoundedCornerShape(8.dp))
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                            .wrapContentSize()
                    ) {
                        Text(
                            text = "${member.relationship} • ${member.age} yrs",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF475569)
                        )
                    }
                }

                // ABHA Number Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .background(Color(0xFF10B981), CircleShape)
                    )
                    Text(
                        text = "ABHA: ${member.abhaNumber}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF0F766E),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxWidth()
                    )
                }
            }

            // Detail Arrow - Fixed size at end
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(Color(0xFFF1F5F9), CircleShape)
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { /* Arrow tap */ },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_chevron_right_small),
                    contentDescription = "View details",
                    tint = Color(0xFF94A3B8),
                    modifier = Modifier.size(18.dp)
                )
            }
        }

        // Divider between top and bottom sections
        HorizontalDivider(color = Color(0xFFE2E8F0).copy(alpha = 0.5f))

        // Bottom Row: Health Snapshot + Status Badge
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.Top,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Health Snapshot - Flexible space with wrapping
            Row(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalAlignment = Alignment.Top,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(Color(0xFF10B981), CircleShape)
                        .wrapContentSize()
                )
                Text(
                    text = member.healthSnapshot,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF475569),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 15.sp,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                )
            }

            // Status Badge - Fixed area, no overlap
            Box(
                modifier = Modifier
                    .background(Color(0xFFF0FDF9), RoundedCornerShape(8.dp))
                    .border(1.dp, Color(0xFFCCFBF1), RoundedCornerShape(8.dp))
                    .padding(horizontal = 8.dp, vertical = 3.dp)
                    .wrapContentSize(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = member.statusBadge,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = statusBadgeColor,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun FamilyMembersScreenPreview() {
    MaterialTheme {
        FamilyMembersScreen(
            onBackClick = {},
            onAddFamilyMemberClick = {},
            onMemberClick = {}
        )
    }
}