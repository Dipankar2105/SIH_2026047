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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun EditProfileScreen(
    currentProfile: ProfileData = ProfileData(),
    onBackClick: () -> Unit,
    onSaveProfile: (ProfileData) -> Unit
) {
    // Exact Stitch color tokens
    val bgLight = Color(0xFFF7F9FA)
    val brandTeal = Color(0xFF00594C)
    val textHeading = Color(0xFF0F172A)
    val textBody = Color(0xFF334155)
    val textMuted = Color(0xFF64748B)
    val borderLight = Color(0xFFE2E8F0)

    // Local mutable state for all profile fields
    var fullName by remember { mutableStateOf(currentProfile.fullName) }
    var gender by remember { mutableStateOf(currentProfile.gender) }
    var dateOfBirth by remember { mutableStateOf(currentProfile.dateOfBirth) }
    var bloodGroup by remember { mutableStateOf(currentProfile.bloodGroup) }
    var mobileNumber by remember { mutableStateOf(currentProfile.mobileNumber) }
    var emailAddress by remember { mutableStateOf(currentProfile.emailAddress) }
    var address by remember { mutableStateOf(currentProfile.address) }
    var emergencyName by remember { mutableStateOf(currentProfile.emergencyContactName) }
    var emergencyRelation by remember { mutableStateOf(currentProfile.emergencyContactRelation) }
    var emergencyPhone by remember { mutableStateOf(currentProfile.emergencyContactPhone) }
    var avatarInitials by remember { mutableStateOf(currentProfile.avatarInitials) }

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
                .imePadding()
        ) {
            // Top App Bar
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
                            contentDescription = "Cancel",
                            tint = Color(0xFF334155),
                            modifier = Modifier.size(18.dp)
                        )
                    }

                    Image(
                        painter = painterResource(id = R.drawable.ic_aarogyaflow_logo),
                        contentDescription = "AarogyaFlow",
                        modifier = Modifier
                            .size(26.dp)
                            .clip(RoundedCornerShape(6.dp))
                    )

                    Column {
                        Text(
                            text = "Edit Profile",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = textHeading
                        )
                        Text(
                            text = "Personal & Account Details",
                            fontSize = 11.sp,
                            color = textMuted
                        )
                    }
                }

                TextButton(onClick = onBackClick) {
                    Text(
                        text = "Cancel",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF64748B)
                    )
                }
            }

            HorizontalDivider(color = borderLight)

            // Scrollable Form Fields
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Profile Avatar Photo Section
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .shadow(1.dp, RoundedCornerShape(16.dp))
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .border(1.dp, borderLight, RoundedCornerShape(16.dp))
                        .padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Box {
                            Box(
                                modifier = Modifier
                                    .size(72.dp)
                                    .background(brandTeal, CircleShape)
                                    .border(3.dp, Color(0xFF6EE7B7).copy(alpha = 0.5f), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = avatarInitials,
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                            // Camera edit badge
                            Box(
                                modifier = Modifier
                                    .size(26.dp)
                                    .align(Alignment.BottomEnd)
                                    .background(Color(0xFF0F766E), CircleShape)
                                    .border(2.dp, Color.White, CircleShape)
                                    .clickable(
                                        interactionSource = remember { MutableInteractionSource() },
                                        indication = null
                                    ) {
                                        // Demo local photo toggle
                                        avatarInitials = if (avatarInitials == "RS") "R" else "RS"
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_camera),
                                    contentDescription = "Edit photo",
                                    tint = Color.White,
                                    modifier = Modifier.size(13.dp)
                                )
                            }
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Tap camera badge to update avatar photo",
                            fontSize = 11.5.sp,
                            color = textMuted,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                // Section 1: Personal Information
                EditCardSection(
                    title = "PERSONAL INFORMATION",
                    iconRes = R.drawable.ic_user_avatar
                ) {
                    EditFormField(
                        label = "Full Name",
                        value = fullName,
                        onValueChange = { fullName = it },
                        placeholder = "e.g. Rahul Sharma"
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        EditFormField(
                            label = "Gender",
                            value = gender,
                            onValueChange = { gender = it },
                            placeholder = "Male / Female",
                            modifier = Modifier.weight(1f)
                        )
                        EditFormField(
                            label = "Blood Group",
                            value = bloodGroup,
                            onValueChange = { bloodGroup = it },
                            placeholder = "e.g. O +ve",
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    EditFormField(
                        label = "Date of Birth",
                        value = dateOfBirth,
                        onValueChange = { dateOfBirth = it },
                        placeholder = "DD MMM YYYY (e.g. 14 Aug 1994)"
                    )
                }

                // Section 2: Contact & Address
                EditCardSection(
                    title = "CONTACT & ADDRESS",
                    iconRes = R.drawable.ic_phone_call
                ) {
                    EditFormField(
                        label = "Mobile Number",
                        value = mobileNumber,
                        onValueChange = { mobileNumber = it },
                        keyboardType = KeyboardType.Phone,
                        placeholder = "+91 98765 43210"
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    EditFormField(
                        label = "Email Address",
                        value = emailAddress,
                        onValueChange = { emailAddress = it },
                        keyboardType = KeyboardType.Email,
                        placeholder = "your.email@example.com"
                    )

                    Spacer(modifier = Modifier.height(10.dp))

                    EditFormField(
                        label = "Current Address",
                        value = address,
                        onValueChange = { address = it },
                        singleLine = false,
                        placeholder = "Full residential address with PIN code"
                    )
                }

                // Section 3: Emergency Contact
                EditCardSection(
                    title = "EMERGENCY CONTACT",
                    iconRes = R.drawable.ic_privacy_heart
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        EditFormField(
                            label = "Contact Name",
                            value = emergencyName,
                            onValueChange = { emergencyName = it },
                            placeholder = "e.g. Sunita Sharma",
                            modifier = Modifier.weight(1.3f)
                        )
                        EditFormField(
                            label = "Relationship",
                            value = emergencyRelation,
                            onValueChange = { emergencyRelation = it },
                            placeholder = "e.g. Mother",
                            modifier = Modifier.weight(1f)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    EditFormField(
                        label = "Emergency Phone Number",
                        value = emergencyPhone,
                        onValueChange = { emergencyPhone = it },
                        keyboardType = KeyboardType.Phone,
                        placeholder = "+91 98111 22334"
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))
            }

            // Fixed Bottom Action Bar: Save Changes
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .border(width = 1.dp, color = borderLight)
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                horizontalArrangement = Arrangement.spacedBy(10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedButton(
                    onClick = onBackClick,
                    modifier = Modifier.height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFF334155))
                ) {
                    Text("Cancel", fontSize = 13.5.sp, fontWeight = FontWeight.SemiBold)
                }

                Button(
                    onClick = {
                        val updated = currentProfile.copy(
                            fullName = fullName.trim(),
                            gender = gender.trim(),
                            dateOfBirth = dateOfBirth.trim(),
                            bloodGroup = bloodGroup.trim(),
                            mobileNumber = mobileNumber.trim(),
                            emailAddress = emailAddress.trim(),
                            address = address.trim(),
                            emergencyContactName = emergencyName.trim(),
                            emergencyContactRelation = emergencyRelation.trim(),
                            emergencyContactPhone = emergencyPhone.trim(),
                            avatarInitials = if (fullName.isNotBlank()) {
                                fullName.split(" ")
                                    .take(2)
                                    .mapNotNull { it.firstOrNull()?.toString() }
                                    .joinToString("")
                                    .uppercase()
                                    .ifEmpty { "RS" }
                            } else "RS"
                        )
                        onSaveProfile(updated)
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = brandTeal,
                        contentColor = Color.White
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_check_mark),
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Save Changes",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun EditCardSection(
    title: String,
    iconRes: Int,
    content: @Composable ColumnScope.() -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(1.dp, RoundedCornerShape(16.dp))
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(16.dp))
            .padding(14.dp)
    ) {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(bottom = 10.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(28.dp)
                        .background(Color(0xFFF0FDFA), RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = iconRes),
                        contentDescription = null,
                        tint = Color(0xFF00594C),
                        modifier = Modifier.size(15.dp)
                    )
                }
                Text(
                    text = title,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF64748B),
                    letterSpacing = 0.8.sp
                )
            }

            HorizontalDivider(color = Color(0xFFF1F5F9))
            Spacer(modifier = Modifier.height(10.dp))

            content()
        }
    }
}

@Composable
fun EditFormField(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String = "",
    singleLine: Boolean = true,
    keyboardType: KeyboardType = KeyboardType.Text,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier) {
        Text(
            text = label,
            fontSize = 11.sp,
            fontWeight = FontWeight.SemiBold,
            color = Color(0xFF475569),
            modifier = Modifier.padding(bottom = 4.dp)
        )
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            singleLine = singleLine,
            placeholder = {
                Text(
                    text = placeholder,
                    fontSize = 13.sp,
                    color = Color(0xFF94A3B8)
                )
            },
            keyboardOptions = KeyboardOptions(keyboardType = keyboardType),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = Color(0xFF00594C),
                unfocusedBorderColor = Color(0xFFCBD5E1),
                focusedContainerColor = Color(0xFFF8FAFC),
                unfocusedContainerColor = Color(0xFFF8FAFC)
            )
        )
    }
}

@Preview(showBackground = true)
@Composable
fun EditProfileScreenPreview() {
    MaterialTheme {
        EditProfileScreen(
            currentProfile = ProfileData(),
            onBackClick = {},
            onSaveProfile = {}
        )
    }
}
