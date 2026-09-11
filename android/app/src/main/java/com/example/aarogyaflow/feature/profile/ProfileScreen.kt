package com.example.aarogyaflow.feature.profile

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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun ProfileScreen(
    profileData: ProfileData = ProfileData(),
    onBackClick: () -> Unit,
    onEditProfileClick: () -> Unit,
    onAboutYouClick: () -> Unit,
    onFamilyMembersClick: () -> Unit = {}
) {
    // Exact Stitch color tokens for Profile (profile_aarogyaflow)
    val bgLight = Color(0xFFF7F9FA)
    val brandTeal = Color(0xFF00594C)
    val brandTealDark = Color(0xFF004238)
    val textHeading = Color(0xFF0F172A)
    val textBody = Color(0xFF334155)
    val textMuted = Color(0xFF64748B)
    val textSubtle = Color(0xFF94A3B8)
    val borderLight = Color(0xFFE2E8F0)

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
            // Header Navigation Bar with official AarogyaFlow logo
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
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Back Button
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
                            contentDescription = "Go back",
                            tint = Color(0xFF334155),
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    // AarogyaFlow Logo + Title & Subtitle
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
                                text = "Profile",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = textHeading
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp),
                                modifier = Modifier.padding(top = 1.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(6.dp)
                                        .background(Color(0xFF10B981), CircleShape)
                                )
                                Text(
                                    text = "Personal & Account Details",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = textMuted
                                )
                            }
                        }
                    }
                }

                // Listen Action Button
                Row(
                    modifier = Modifier
                        .background(Color.White, RoundedCornerShape(20.dp))
                        .border(1.dp, borderLight, RoundedCornerShape(20.dp))
                        .padding(horizontal = 10.dp, vertical = 5.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_volume_speaker),
                        contentDescription = "Listen",
                        tint = brandTeal,
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = "Listen",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF475569)
                    )
                }
            }

            HorizontalDivider(color = borderLight)

            // Main Scrollable Profile Content
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Hero Account Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(4.dp, RoundedCornerShape(20.dp))
                        .background(
                            brush = Brush.linearGradient(
                                colors = listOf(brandTeal, brandTealDark)
                            ),
                            shape = RoundedCornerShape(20.dp)
                        )
                        .padding(16.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.Top
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                // Profile Avatar with Camera badge
                                Box {
                                    Box(
                                        modifier = Modifier
                                            .size(56.dp)
                                            .background(Color(0xFF0F766E), CircleShape)
                                            .border(2.dp, Color(0xFF6EE7B7).copy(alpha = 0.4f), CircleShape),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = profileData.avatarInitials,
                                            fontSize = 20.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = Color(0xFFCCFBF1)
                                        )
                                    }
                                    // Camera icon overlay
                                    Box(
                                        modifier = Modifier
                                            .size(20.dp)
                                            .align(Alignment.BottomEnd)
                                            .background(Color.White, CircleShape)
                                            .border(1.dp, Color(0xFFE2E8F0), CircleShape)
                                            .clickable(
                                                interactionSource = remember { MutableInteractionSource() },
                                                indication = null
                                            ) { onEditProfileClick() },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            painter = painterResource(id = R.drawable.ic_camera),
                                            contentDescription = "Change photo",
                                            tint = brandTeal,
                                            modifier = Modifier.size(11.dp)
                                        )
                                    }
                                }

                                Column {
                                    Text(
                                        text = profileData.fullName,
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                                        modifier = Modifier.padding(top = 4.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .background(Color(0xFF0F766E).copy(alpha = 0.8f), RoundedCornerShape(4.dp))
                                                .padding(horizontal = 6.dp, vertical = 2.dp)
                                        ) {
                                            Text(
                                                text = "${profileData.gender.uppercase()}, ${profileData.age}",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.SemiBold,
                                                color = Color(0xFFCCFBF1)
                                            )
                                        }
                                        Row(
                                            modifier = Modifier
                                                .background(Color(0x3334D399), RoundedCornerShape(10.dp))
                                                .border(1.dp, Color(0x4D34D399), RoundedCornerShape(10.dp))
                                                .padding(horizontal = 6.dp, vertical = 2.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.spacedBy(3.dp)
                                        ) {
                                            Icon(
                                                painter = painterResource(id = R.drawable.ic_shield_check),
                                                contentDescription = null,
                                                tint = Color(0xFF6EE7B7),
                                                modifier = Modifier.size(10.dp)
                                            )
                                            Text(
                                                text = "Verified",
                                                fontSize = 10.sp,
                                                fontWeight = FontWeight.Medium,
                                                color = Color(0xFF6EE7B7)
                                            )
                                        }
                                    }
                                }
                            }

                            // Edit Button
                            Row(
                                modifier = Modifier
                                    .background(Color.White.copy(alpha = 0.12f), RoundedCornerShape(8.dp))
                                    .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                                    .clickable(
                                        interactionSource = remember { MutableInteractionSource() },
                                        indication = null
                                    ) { onEditProfileClick() }
                                    .padding(horizontal = 8.dp, vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_edit_pencil),
                                    contentDescription = "Edit",
                                    tint = Color.White,
                                    modifier = Modifier.size(12.dp)
                                )
                                Text(
                                    text = "Edit",
                                    fontSize = 11.5.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color.White
                                )
                            }
                        }

                        // ABHA ID Bar
                        Spacer(modifier = Modifier.height(14.dp))
                        HorizontalDivider(color = Color.White.copy(alpha = 0.15f))
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text("ABHA Number:", fontSize = 12.sp, color = Color(0xFFCCFBF1).copy(alpha = 0.9f))
                                Text(profileData.abhaNumber, fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            }
                            Icon(
                                painter = painterResource(id = R.drawable.ic_copy_content),
                                contentDescription = "Copy ABHA",
                                tint = Color(0xFF99F6E4),
                                modifier = Modifier.size(14.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(Color.White.copy(alpha = 0.12f), RoundedCornerShape(8.dp))
                                .padding(horizontal = 10.dp, vertical = 6.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text("ABHA Address:", fontSize = 11.sp, color = Color(0xFF99F6E4))
                                Text(profileData.abhaAddress, fontSize = 12.sp, fontWeight = FontWeight.Medium, color = Color.White)
                            }
                            Box(
                                modifier = Modifier
                                    .background(Color(0x4D10B981), RoundedCornerShape(4.dp))
                                    .border(1.dp, Color(0x6634D399), RoundedCornerShape(4.dp))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("ABDM LINKED", fontSize = 9.5.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFFA7F3D0))
                            }
                        }
                    }
                }

                // 1. Personal Details Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(1.dp, RoundedCornerShape(16.dp))
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .border(1.dp, borderLight, RoundedCornerShape(16.dp))
                        .padding(14.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .background(Color(0xFFF0FDFA), RoundedCornerShape(8.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        painter = painterResource(id = R.drawable.ic_user_avatar),
                                        contentDescription = null,
                                        tint = brandTeal,
                                        modifier = Modifier.size(15.dp)
                                    )
                                }
                                Text("PERSONAL INFORMATION", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = textMuted, letterSpacing = 0.8.sp)
                            }
                            Text(
                                text = "Update",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = brandTeal,
                                modifier = Modifier.clickable(
                                    interactionSource = remember { MutableInteractionSource() },
                                    indication = null
                                ) { onEditProfileClick() }
                            )
                        }

                        HorizontalDivider(color = Color(0xFFF1F5F9))
                        Spacer(modifier = Modifier.height(10.dp))

                        // 2x2 Grid of details
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            ProfileDetailField(label = "Full Name", value = profileData.fullName, modifier = Modifier.weight(1f))
                            ProfileDetailField(label = "Gender & Age", value = "${profileData.gender}, ${profileData.age} yrs", modifier = Modifier.weight(1f))
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            ProfileDetailField(label = "Date of Birth", value = profileData.dateOfBirth, modifier = Modifier.weight(1f))
                            Column(modifier = Modifier.weight(1f)) {
                                Text("Blood Group", fontSize = 10.5.sp, color = textSubtle, fontWeight = FontWeight.Medium)
                                Spacer(modifier = Modifier.height(2.dp))
                                Box(
                                    modifier = Modifier
                                        .background(Color(0xFFFEF2F2), RoundedCornerShape(4.dp))
                                        .border(1.dp, Color(0xFFFEE2E2), RoundedCornerShape(4.dp))
                                        .padding(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text(profileData.bloodGroup, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFDC2626))
                                }
                            }
                        }
                    }
                }

                // 2. Contact & Address Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(1.dp, RoundedCornerShape(16.dp))
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .border(1.dp, borderLight, RoundedCornerShape(16.dp))
                        .padding(14.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .background(Color(0xFFF0FDFA), RoundedCornerShape(8.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        painter = painterResource(id = R.drawable.ic_phone_call),
                                        contentDescription = null,
                                        tint = brandTeal,
                                        modifier = Modifier.size(15.dp)
                                    )
                                }
                                Text("CONTACT & ADDRESS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = textMuted, letterSpacing = 0.8.sp)
                            }
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFFECFDF5), RoundedCornerShape(10.dp))
                                    .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(10.dp))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("Active", fontSize = 10.sp, fontWeight = FontWeight.Medium, color = Color(0xFF059669))
                            }
                        }

                        HorizontalDivider(color = Color(0xFFF1F5F9))
                        Spacer(modifier = Modifier.height(10.dp))

                        // Mobile Number
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Mobile Number", fontSize = 10.5.sp, color = textSubtle, fontWeight = FontWeight.Medium)
                                Text(profileData.mobileNumber, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = textHeading, modifier = Modifier.padding(top = 2.dp))
                            }
                            VerifiedBadge()
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        HorizontalDivider(color = Color(0xFFF8FAFC))
                        Spacer(modifier = Modifier.height(10.dp))

                        // Email Address
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text("Email Address", fontSize = 10.5.sp, color = textSubtle, fontWeight = FontWeight.Medium)
                                Text(profileData.emailAddress, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = textHeading, modifier = Modifier.padding(top = 2.dp))
                            }
                            VerifiedBadge()
                        }

                        Spacer(modifier = Modifier.height(10.dp))
                        HorizontalDivider(color = Color(0xFFF8FAFC))
                        Spacer(modifier = Modifier.height(10.dp))

                        // Residential Address
                        Column {
                            Text("Current Address", fontSize = 10.5.sp, color = textSubtle, fontWeight = FontWeight.Medium)
                            Text(
                                text = profileData.address,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF334155),
                                lineHeight = 16.sp,
                                modifier = Modifier.padding(top = 2.dp)
                            )
                        }
                    }
                }

                // 3. Emergency Contact Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(1.dp, RoundedCornerShape(16.dp))
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .border(1.dp, borderLight, RoundedCornerShape(16.dp))
                        .padding(14.dp)
                ) {
                    Column {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 10.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(28.dp)
                                        .background(Color(0xFFFEF2F2), RoundedCornerShape(8.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        painter = painterResource(id = R.drawable.ic_privacy_heart),
                                        contentDescription = null,
                                        tint = Color(0xFFDC2626),
                                        modifier = Modifier.size(15.dp)
                                    )
                                }
                                Text("EMERGENCY CONTACT", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = textMuted, letterSpacing = 0.8.sp)
                            }
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFFFEF2F2), RoundedCornerShape(6.dp))
                                    .border(1.dp, Color(0xFFFECDD3), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 6.dp, vertical = 2.dp)
                            ) {
                                Text("SOS PRIMARY", fontSize = 9.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFFDC2626))
                            }
                        }

                        HorizontalDivider(color = Color(0xFFF1F5F9))
                        Spacer(modifier = Modifier.height(10.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(profileData.emergencyContactName, fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = textHeading)
                                    Box(
                                        modifier = Modifier
                                            .background(Color(0xFFF1F5F9), RoundedCornerShape(4.dp))
                                            .padding(horizontal = 5.dp, vertical = 1.dp)
                                    ) {
                                        Text(profileData.emergencyContactRelation, fontSize = 9.5.sp, color = textMuted)
                                    }
                                }
                                Text(profileData.emergencyContactPhone, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = textMuted, modifier = Modifier.padding(top = 2.dp))
                            }

                            // Quick Call Button
                            Row(
                                modifier = Modifier
                                    .background(Color(0xFFFEF2F2), RoundedCornerShape(10.dp))
                                    .border(1.dp, Color(0xFFFECDD3), RoundedCornerShape(10.dp))
                                    .padding(horizontal = 12.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_phone_call),
                                    contentDescription = "Call",
                                    tint = Color(0xFFB91C1C),
                                    modifier = Modifier.size(12.dp)
                                )
                                Text("Call", fontSize = 11.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFFB91C1C))
                            }
                        }
                    }
                }

                // 4. Quick Navigation Links Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(1.dp, RoundedCornerShape(16.dp))
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .border(1.dp, borderLight, RoundedCornerShape(16.dp))
                ) {
                    Column {
                        // Link 1: Health Summary (About You)
                        ProfileNavRow(
                            title = "Health Summary (About You)",
                            subtitle = "View clinical history, conditions & medications",
                            iconRes = R.drawable.ic_document_text,
                            onClick = onAboutYouClick
                        )
                        HorizontalDivider(color = Color(0xFFF1F5F9))

                        // Link 2: Linked Family Members
                        ProfileNavRow(
                            title = "Linked Family Members",
                            subtitle = "Mother, Father & Spouse accounts",
                            badgeText = "3 members",
                            iconRes = R.drawable.ic_users_family,
                            onClick = onFamilyMembersClick
                        )
                        HorizontalDivider(color = Color(0xFFF1F5F9))

                        // Link 3: ABHA & Consent Settings
                        ProfileNavRow(
                            title = "ABHA & Consent Settings",
                            subtitle = "Manage data sharing & hospital approvals",
                            iconRes = R.drawable.ic_shield_check,
                            onClick = { /* Consent settings */ }
                        )
                    }
                }

                // Secondary Logout Action
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 6.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) { /* Logout handler */ }
                            .padding(8.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_close_x),
                            contentDescription = "Logout",
                            tint = Color(0xFFE11D48),
                            modifier = Modifier.size(14.dp)
                        )
                        Text(
                            text = "Log Out of AarogyaFlow",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFFE11D48)
                        )
                    }
                    Text(
                        text = "App Version 2.4.1 (Build 890)",
                        fontSize = 10.sp,
                        color = textSubtle,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))
            }

            // Fixed Bottom Action Footer
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White.copy(alpha = 0.95f))
                    .border(width = 1.dp, color = borderLight)
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Share profile button
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .background(Color.White, RoundedCornerShape(12.dp))
                        .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(12.dp))
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) { /* Share profile */ },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_share_nodes),
                        contentDescription = "Share Profile",
                        tint = Color(0xFF475569),
                        modifier = Modifier.size(18.dp)
                    )
                }

                // Primary Edit Profile CTA Button
                Button(
                    onClick = onEditProfileClick,
                    modifier = Modifier
                        .weight(1f)
                        .height(44.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = brandTeal,
                        contentColor = Color.White
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_edit_pencil),
                        contentDescription = null,
                        tint = Color(0xFFA7F3D0),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Edit Profile",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Done Button
                Box(
                    modifier = Modifier
                        .height(44.dp)
                        .background(Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) { onBackClick() }
                        .padding(horizontal = 16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Done",
                        fontSize = 12.5.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF334155)
                    )
                }
            }
        }
    }
}

@Composable
private fun ProfileDetailField(
    label: String,
    value: String,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        Text(label, fontSize = 10.5.sp, color = Color(0xFF94A3B8), fontWeight = FontWeight.Medium)
        Text(value, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF1E293B), modifier = Modifier.padding(top = 2.dp))
    }
}

@Composable
private fun VerifiedBadge() {
    Row(
        modifier = Modifier
            .background(Color(0xFFECFDF5), RoundedCornerShape(12.dp))
            .border(1.dp, Color(0xFFA7F3D0), RoundedCornerShape(12.dp))
            .padding(horizontal = 8.dp, vertical = 2.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(3.dp)
    ) {
        Icon(
            painter = painterResource(id = R.drawable.ic_shield_check),
            contentDescription = null,
            tint = Color(0xFF059669),
            modifier = Modifier.size(11.dp)
        )
        Text("Verified", fontSize = 10.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF047857))
    }
}

@Composable
private fun ProfileNavRow(
    title: String,
    subtitle: String,
    badgeText: String? = null,
    iconRes: Int,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onClick() }
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.weight(1f)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .background(Color(0xFFF0FDFA), RoundedCornerShape(10.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = iconRes),
                    contentDescription = null,
                    tint = Color(0xFF00594C),
                    modifier = Modifier.size(18.dp)
                )
            }
            Column {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(title, fontSize = 12.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                    if (badgeText != null) {
                        Box(
                            modifier = Modifier
                                .background(Color(0xFFF0FDFA), RoundedCornerShape(10.dp))
                                .padding(horizontal = 6.dp, vertical = 1.dp)
                        ) {
                            Text(badgeText, fontSize = 9.5.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF00594C))
                        }
                    }
                }
                Text(subtitle, fontSize = 10.5.sp, color = Color(0xFF64748B), modifier = Modifier.padding(top = 1.dp))
            }
        }
        Icon(
            painter = painterResource(id = R.drawable.ic_chevron_right_small),
            contentDescription = "Navigate",
            tint = Color(0xFF94A3B8),
            modifier = Modifier.size(16.dp)
        )
    }
}

@Preview(showBackground = true)
@Composable
fun ProfileScreenPreview() {
    MaterialTheme {
        ProfileScreen(
            profileData = ProfileData(),
            onBackClick = {},
            onEditProfileClick = {},
            onAboutYouClick = {}
        )
    }
}
