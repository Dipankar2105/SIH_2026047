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
import androidx.compose.material3.Divider
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.em
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import androidx.compose.runtime.rememberCoroutineScope

@Composable
fun FamilyMemberOtpScreen(
    abhaId: String,
    relationship: String = "",
    onBackClick: () -> Unit,
    onVerifyClick: () -> Unit,
    onResendClick: () -> Unit
) {
    // Exact Stitch color tokens for Family Member OTP (family_member_otp_aarogyaflow)
    val bgLight = Color(0xFFF2F6FA)
    val brandTeal = Color(0xFF0F766E)
    val brandTealDark = Color(0xFF00594C)
    val brandTealLight = Color(0xFFE6F7F4)
    val textHeading = Color(0xFF0F172A)
    val textBody = Color(0xFF334155)
    val textMuted = Color(0xFF64748B)
    val textSubtle = Color(0xFF94A3B8)
    val borderLight = Color(0xFFE2E8F0)
    val errorRed = Color(0xFFEF4444)
    val successGreen = Color(0xFF10B981)

    // OTP input state - 6 digit OTP
    var otpDigits by remember { mutableStateOf(Array(6) { "" }) }
    var focusedIndex by remember { mutableStateOf(0) }
    var showError by remember { mutableStateOf(false) }
    var resendEnabled by remember { mutableStateOf(false) }
    var timerSeconds by remember { mutableStateOf(30) }
    var isVerifying by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    // Focus requesters for each OTP box
    val focusRequesters = remember { List(6) { FocusRequester() } }

    val isOtpComplete = remember(otpDigits) {
        otpDigits.all { it.isNotBlank() }
    }

    // Auto-focus next field when focusedIndex changes
    LaunchedEffect(focusedIndex) {
        focusRequesters[focusedIndex].requestFocus()
    }

    // Timer countdown
    LaunchedEffect(resendEnabled) {
        if (!resendEnabled) {
            timerSeconds = 30
            while (timerSeconds > 0) {
                delay(1000)
                timerSeconds--
            }
            resendEnabled = true
        }
    }

    // Auto-focus next field
    LaunchedEffect(otpDigits) {
        if (isOtpComplete && !isVerifying) {
            // Auto-submit after brief delay for UX
            delay(300)
            onVerifyClick()
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

            // Scrollable Content
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Verification Icon Badge
                Box(
                    modifier = Modifier
                        .size(56.dp)
                        .background(Color(0xFF004D40), RoundedCornerShape(18.dp))
                        .shadow(2.dp, RoundedCornerShape(18.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_shield_check),
                        contentDescription = null,
                        tint = Color(0xFF99F6E4),
                        modifier = Modifier.size(28.dp)
                    )
                }

                // Page Title & Subtitle
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Verify Mobile Number",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF0F2438),
                        letterSpacing = (-0.3).sp
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "An OTP has been sent to the mobile number linked with ABHA ending in ${abhaId.takeLast(4)}",
                        fontSize = 13.5.sp,
                        color = textMuted,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        lineHeight = 18.sp,
                        modifier = Modifier.padding(horizontal = 8.dp)
                    )
                }

                // OTP Input Fields
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "Enter 6-digit OTP",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF475569),
                        letterSpacing = 0.8.sp
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        otpDigits.forEachIndexed { index, digit ->
                            val isFocused = index == focusedIndex
                            val hasError = showError && !isOtpComplete

                            Box(
                                modifier = Modifier
                                    .width(44.dp)
                                    .height(52.dp)
                                    .background(Color.White, RoundedCornerShape(14.dp))
                                    .border(
                                        width = if (isFocused) 2.dp else 1.dp,
                                        color = if (hasError) errorRed else if (isFocused) brandTeal else borderLight,
                                        shape = RoundedCornerShape(14.dp)
                                    )
                                    .shadow(if (isFocused) 2.dp else 1.dp, RoundedCornerShape(14.dp))
                                    .padding(horizontal = 4.dp, vertical = 4.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                TextField(
                                    value = digit,
                                    onValueChange = { newValue ->
                                        val singleChar = if (newValue.isNotBlank()) newValue.last().toString() else ""
                                        val newDigits = otpDigits.copyOf()
                                        newDigits[index] = singleChar
                                        otpDigits = newDigits

                                        // Auto-advance to next field
                                        if (singleChar.isNotBlank() && index < 5) {
                                            focusedIndex = index + 1
                                        } else if (singleChar.isBlank() && index > 0) {
                                            focusedIndex = index - 1
                                        }
                                        showError = false
                                    },
                                    singleLine = true,
                                    keyboardOptions = KeyboardOptions(
                                        keyboardType = KeyboardType.Number,
                                        imeAction = if (index == 5) androidx.compose.ui.text.input.ImeAction.Done else androidx.compose.ui.text.input.ImeAction.Next
                                    ),
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(Color.Transparent, RoundedCornerShape(14.dp))
                                        .padding(horizontal = 8.dp, vertical = 4.dp),
                                    textStyle = androidx.compose.ui.text.TextStyle(
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.Bold,
                                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                                        color = textHeading
                                    ),
                                    colors = TextFieldDefaults.colors(
                                        focusedIndicatorColor = Color.Transparent,
                                        unfocusedIndicatorColor = Color.Transparent,
                                        disabledIndicatorColor = Color.Transparent,
                                        focusedContainerColor = Color.White,
                                        unfocusedContainerColor = Color.White,
                                        cursorColor = brandTeal,
                                        focusedTextColor = textHeading,
                                        unfocusedTextColor = textHeading,
                                        focusedPlaceholderColor = textSubtle,
                                        unfocusedPlaceholderColor = textSubtle
                                    )
                                )
                            }
                        }
                    }

                    // Error message
                    if (showError) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Center,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_warning_triangle),
                                contentDescription = "Error",
                                tint = errorRed,
                                modifier = Modifier.size(12.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Invalid OTP. Please try again.",
                                fontSize = 11.sp,
                                color = errorRed
                            )
                        }
                    }
                }

                // Resend OTP
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text(
                        text = "Didn't receive the code?",
                        fontSize = 12.sp,
                        color = textMuted,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.Center,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (resendEnabled) {
                                "Resend OTP"
                            } else {
                                "Resend in ${timerSeconds}s"
                            },
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (resendEnabled) brandTeal else textSubtle
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Main Action Button: Verify OTP
                Button(
                    onClick = {
                        if (isOtpComplete && !isVerifying) {
                            isVerifying = true
                            // Simulate verification delay
                            scope.launch {
                                delay(800)
                                // Demo mode: any 6-digit OTP is accepted locally
                                onVerifyClick()
                                isVerifying = false
                            }
                        } else if (!isOtpComplete) {
                            showError = true
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = if (isOtpComplete) brandTeal else Color(0xFF94A3B8),
                        contentColor = Color.White
                    ),
                    elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp),
                    enabled = isOtpComplete && !isVerifying
                ) {
                    if (isVerifying) {
                        CircularProgressIndicator(
                            color = Color.White,
                            modifier = Modifier.size(20.dp),
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text(
                            text = "Verify OTP",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.SemiBold,
                            letterSpacing = 0.5.sp
                        )
                    }
                }

                Text(
                    text = "Auto-verifies on complete entry",
                    fontSize = 11.sp,
                    color = textSubtle,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }

            // Footer with ABDM notice
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(horizontal = 16.dp, vertical = 12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_shield_check),
                        contentDescription = null,
                        tint = brandTeal,
                        modifier = Modifier.size(16.dp).padding(top = 2.dp)
                    )
                    Text(
                        text = "Verification follows ABDM consent protocols. OTP expires in 5 minutes.",
                        fontSize = 10.sp,
                        color = textMuted,
                        lineHeight = 14.sp
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun FamilyMemberOtpScreenPreview() {
    MaterialTheme {
        FamilyMemberOtpScreen(
            abhaId = "91-8842-1920-4102",
            relationship = "Mother",
            onBackClick = {},
            onVerifyClick = {},
            onResendClick = {}
        )
    }
}