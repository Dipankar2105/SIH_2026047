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
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun AddFamilyMemberScreen(
    onBackClick: () -> Unit,
    onContinueClick: (relationship: String, abhaId: String) -> Unit,
    onCancelClick: () -> Unit
) {
    // Exact Stitch color tokens for Add Family Member (add_family_member_aarogyaflow_1/2)
    val bgLight = Color(0xFFF2F6FA)
    val brandTeal = Color(0xFF0F766E)
    val brandTealDark = Color(0xFF00594C)
    val brandTealLight = Color(0xFFE6F7F4)
    val textHeading = Color(0xFF0F172A)
    val textBody = Color(0xFF334155)
    val textMuted = Color(0xFF64748B)
    val textSubtle = Color(0xFF94A3B8)
    val borderLight = Color(0xFFE2E8F0)

    // Relationship chips state
    val relationshipOptions = listOf("Mother", "Father", "Spouse", "Child", "Other")
    var selectedRelationship by remember { mutableStateOf("Mother") }

    // ABHA ID input state
    var abhaId by remember { mutableStateOf("") }
    var showValidation by remember { mutableStateOf(false) }

    val isAbhaValid = remember(abhaId) {
        // Basic validation: 14 digits with optional dashes
        val digits = abhaId.replace("-", "")
        digits.length == 14 && digits.all { it.isDigit() }
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
                .imePadding()
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
                    // Back Button with "Back" text
                    Box(
                        modifier = Modifier
                            .background(Color(0xFFF1F5F9), RoundedCornerShape(10.dp))
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) { onBackClick() }
                            .padding(horizontal = 8.dp, vertical = 4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_chevron_left),
                                contentDescription = "Back",
                                tint = Color(0xFF334155),
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = "Back",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF334155)
                            )
                        }
                    }
                }

                // Right Header Actions: Brand Badge + Listen
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // AarogyaFlow Brand Badge
                    Row(
                        modifier = Modifier
                            .background(Color.White, RoundedCornerShape(20.dp))
                            .border(1.dp, Color(0xFFE2E8F0).copy(alpha = 0.8f), RoundedCornerShape(20.dp))
                            .padding(horizontal = 10.dp, vertical = 5.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_aarogyaflow_logo),
                            contentDescription = "AarogyaFlow Logo",
                            modifier = Modifier
                                .size(16.dp)
                                .clip(RoundedCornerShape(4.dp))
                        )
                        Text(
                            text = "AAROGYAFLOW",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 0.8.sp,
                            color = Color(0xFF334155)
                        )
                    }

                    // Listen Button
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .background(Color.White, RoundedCornerShape(12.dp))
                            .border(1.dp, Color(0xFFE2E8F0).copy(alpha = 0.8f), RoundedCornerShape(12.dp))
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null
                            ) { /* Audio handler */ },
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            verticalArrangement = Arrangement.spacedBy(1.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_volume_speaker),
                                contentDescription = "Listen",
                                tint = Color(0xFF64748B),
                                modifier = Modifier.size(18.dp)
                            )
                            Text(
                                text = "Listen",
                                fontSize = 9.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF64748B)
                            )
                        }
                    }
                }
            }

            HorizontalDivider(color = borderLight)

            // Scrollable Form Content
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Member Icon Badge
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(Color(0xFF004D40), RoundedCornerShape(16.dp))
                        .shadow(2.dp, RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_users_family),
                        contentDescription = null,
                        tint = Color(0xFF99F6E4),
                        modifier = Modifier.size(24.dp)
                    )
                }

                // Page Title & Subtitle
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Add a Family Member",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF0F2438),
                        letterSpacing = (-0.3).sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Link your family member's health records using their Ayushman Bharat Health Account (ABHA).",
                        fontSize = 13.5.sp,
                        color = textMuted,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        lineHeight = 18.sp,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )
                }

                // Relationship Selection Chips
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = "Relationship",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF475569),
                        letterSpacing = 0.8.sp
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        relationshipOptions.forEach { relationship ->
                            val isSelected = relationship == selectedRelationship
                            Row(
                                modifier = Modifier
                                    .background(
                                        if (isSelected) Color(0xFF004D40) else Color.White,
                                        RoundedCornerShape(16.dp)
                                    )
                                    .border(
                                        if (isSelected) 0.dp else 1.dp,
                                        if (isSelected) Color.Transparent else Color(0xFFE2E8F0),
                                        RoundedCornerShape(16.dp)
                                    )
                                    .shadow(if (isSelected) 1.dp else 0.dp, RoundedCornerShape(16.dp))
                                    .clickable(
                                        interactionSource = remember { MutableInteractionSource() },
                                        indication = null
                                    ) { selectedRelationship = relationship }
                                    .padding(horizontal = 12.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = relationship,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (isSelected) Color.White else Color(0xFF475569)
                                )
                            }
                        }
                    }
                }

                // ABHA ID Input Card
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(
                        text = "Enter Family Member's ABHA ID",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF475569)
                    )
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.White, RoundedCornerShape(16.dp))
                            .border(1.dp, if (showValidation && !isAbhaValid && abhaId.isNotBlank()) Color(0xFFEF4444) else Color(0xFFE2E8F0).copy(alpha = 0.9f), RoundedCornerShape(16.dp))
                            .shadow(1.dp, RoundedCornerShape(16.dp)),
                        contentAlignment = Alignment.Center
                    ) {
                        OutlinedTextField(
                            value = abhaId,
                            onValueChange = { newValue ->
                                // Format: XX-XXXX-XXXX-XXXX
                                var digits = newValue.replace("-", "")
                                    .filter { it.isDigit() }
                                    .take(14)
                                val formatted = StringBuilder()
                                for (i in digits.indices) {
                                    if (i == 2 || i == 6 || i == 10) formatted.append("-")
                                    formatted.append(digits[i])
                                }
                                abhaId = formatted.toString()
                                showValidation = false
                            },
                            singleLine = true,
                            placeholder = {
                                Text(
                                    text = "XX-XXXX-XXXX-XXXX",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Medium,
                                    letterSpacing = 0.2.em,
                                    color = Color(0xFFCBD5E1)
                                )
                            },
                            keyboardOptions = KeyboardOptions(
                                keyboardType = KeyboardType.Number,
                                imeAction = androidx.compose.ui.text.input.ImeAction.Next
                            ),
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 10.dp)
                                .background(Color.Transparent, RoundedCornerShape(16.dp)),
                            shape = RoundedCornerShape(16.dp),
                            colors = TextFieldDefaults.colors(
                                focusedIndicatorColor = Color.Transparent,
                                unfocusedIndicatorColor = Color.Transparent,
                                disabledIndicatorColor = Color.Transparent,
                                focusedContainerColor = Color.White,
                                unfocusedContainerColor = Color.White,
                                cursorColor = Color(0xFF0F766E),
                                focusedTextColor = Color(0xFF334155),
                                unfocusedTextColor = Color(0xFF334155),
                                focusedPlaceholderColor = Color(0xFFCBD5E1),
                                unfocusedPlaceholderColor = Color(0xFFCBD5E1)
                            )
                        )
                    }
                    // Validation message
                    if (showValidation && !isAbhaValid && abhaId.isNotBlank()) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_warning_triangle),
                                contentDescription = "Error",
                                tint = Color(0xFFEF4444),
                                modifier = Modifier.size(12.dp)
                            )
                            Text(
                                text = "Please enter a valid 14-digit ABHA ID",
                                fontSize = 11.sp,
                                color = Color(0xFFEF4444)
                            )
                        }
                    }

                    // ABDM Data Security Pill
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFE6F7F3), RoundedCornerShape(12.dp))
                            .border(1.dp, Color(0xFFB2E8DC), RoundedCornerShape(12.dp))
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_shield_check),
                            contentDescription = null,
                            tint = Color(0xFF0D7665),
                            modifier = Modifier.size(16.dp)
                        )
                        Text(
                            text = "Family member's health data is protected and shared only with consent under ABDM protocols.",
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF0D7665)
                        )
                    }
                }

                // Registered Mobile OTP Disclaimer Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFEBF3FA), RoundedCornerShape(12.dp))
                        .border(1.dp, Color(0xFFD5E4F2), RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_info_circle),
                            contentDescription = null,
                            tint = Color(0xFF245D8C),
                            modifier = Modifier.size(20.dp)
                        )
                        Text(
                            text = "Make sure you have access to your family member's registered mobile phone. An OTP will be sent to verify and link the account.",
                            fontSize = 12.sp,
                            color = Color(0xFF214D73),
                            lineHeight = 16.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(8.dp))

                // Main Action Button: Continue
                Button(
                    onClick = {
                        if (isAbhaValid) {
                            onContinueClick(selectedRelationship, abhaId)
                        } else {
                            showValidation = true
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isAbhaValid) Color(0xFF5C8D84) else Color(0xFF94A3B8),
                        contentColor = Color.White
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp)
                ) {
                    Text(
                        text = "Continue",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        letterSpacing = 0.5.sp
                    )
                }

                Text(
                    text = "Next: OTP verification will be sent to their linked mobile number.",
                    fontSize = 11.sp,
                    color = textSubtle,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }

            // Divider
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                HorizontalDivider(
                    modifier = Modifier.weight(1f),
                    color = Color(0xFFCBD5E1),
                    thickness = 1.dp
                )
                Text(
                    text = "or",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Medium,
                    color = textSubtle
                )
                HorizontalDivider(
                    modifier = Modifier.weight(1f),
                    color = Color(0xFFCBD5E1),
                    thickness = 1.dp
                )
            }

            // Create ABHA Link
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = "Don't have ABHA for this member?",
                    fontSize = 10.sp,
                    color = textMuted
                )
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "Create ABHA ID",
                        fontSize = 13.5.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF00695C)
                    )
                    Icon(
                        painter = painterResource(id = R.drawable.ic_chevron_right_small),
                        contentDescription = "Create ABHA",
                        tint = Color(0xFF00695C),
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Cancel Action
            TextButton(onClick = onCancelClick) {
                Text(
                    text = "Cancel and return to Family Members",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = textSubtle
                )
            }
        }

        // Footer (no extra content needed)
    }
}

@Preview(showBackground = true)
@Composable
fun AddFamilyMemberScreenPreview() {
    MaterialTheme {
        AddFamilyMemberScreen(
            onBackClick = {},
            onContinueClick = { _, _ -> },
            onCancelClick = {}
        )
    }
}