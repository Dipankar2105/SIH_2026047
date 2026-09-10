package com.example.aarogyaflow.feature.auth

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.focus.onFocusChanged
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun AbhaIdScreen(
    onContinueClick: (String) -> Unit,
    onCreateAbhaClick: () -> Unit,
    onLoginClick: () -> Unit
) {
    var rawDigits by remember { mutableStateOf("") }
    var isInputFocused by remember { mutableStateOf(false) }
    val focusRequester = remember { FocusRequester() }
    val focusManager = LocalFocusManager.current

    // Brand tokens matching Stitch MCP specification
    val bgLight = Color(0xFFF2F6F9)
    val brandTeal = Color(0xFF005E54)
    val buttonTeal = Color(0xFF5D8E84)
    val titleDark = Color(0xFF111C2E)
    val slateMuted = Color(0xFF64748B)
    val slateDark = Color(0xFF1E293B)
    val borderLight = Color(0xFFE2E8F0)
    val privacyBadgeBg = Color(0xFFE6F8F5)
    val privacyBadgeBorder = Color(0xFFB9EBE2)
    val placeholderColor = Color(0xFF9AA8BC)

    // Formatted ABHA string: XX-XXXX-XXXX-XXXX
    val formattedAbha = remember(rawDigits) {
        buildString {
            for (i in rawDigits.indices) {
                if (i == 2 || i == 6 || i == 10) append('-')
                append(rawDigits[i])
            }
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
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 20.dp)
        ) {
            // Top Navigation Row: Log in & Developer Code Badge
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Log in",
                    color = Color(0xFF8E9BAE),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Normal,
                    modifier = Modifier.clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { onLoginClick() }
                )

                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .background(brandTeal, RoundedCornerShape(8.dp))
                        .shadow(1.dp, RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_code_brackets),
                        contentDescription = "Code Badge",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            // Brand Pill & Listen Audio Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 10.dp),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // AarogyaFlow Brand Pill
                Row(
                    modifier = Modifier
                        .shadow(2.dp, CircleShape)
                        .background(Color.White, CircleShape)
                        .border(1.dp, Color(0xFFF1F5F9), CircleShape)
                        .padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_aarogyaflow_logo),
                        contentDescription = "AarogyaFlow logo",
                        modifier = Modifier
                            .size(24.dp)
                            .clip(RoundedCornerShape(6.dp))
                    )
                    Text(
                        text = "AAROGYAFLOW",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = slateDark,
                        letterSpacing = 1.sp
                    )
                }

                Spacer(modifier = Modifier.width(14.dp))

                // Audio Listen Button
                Column(
                    modifier = Modifier
                        .width(54.dp)
                        .shadow(2.dp, RoundedCornerShape(12.dp))
                        .background(Color.White, RoundedCornerShape(12.dp))
                        .border(1.dp, Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) { /* Audio helper handler */ }
                        .padding(vertical = 6.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_volume_speaker),
                        contentDescription = "Listen audio",
                        tint = Color(0xFF475569),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Listen",
                        fontSize = 10.sp,
                        color = slateMuted,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // User Avatar Badge Icon
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(brandTeal, RoundedCornerShape(12.dp))
                    .shadow(1.dp, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_user_avatar),
                    contentDescription = "User Icon",
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Form Title
            Text(
                text = "Enter your ABHA ID",
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = titleDark,
                lineHeight = 32.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Form Subtitle
            Text(
                text = "Your 14-digit Ayushman Bharat Health Account number",
                fontSize = 13.5.sp,
                fontWeight = FontWeight.Normal,
                color = slateMuted
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ABHA Input Container (Matches Stitch default and focused/typing states)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(1.dp, RoundedCornerShape(16.dp))
                    .background(Color.White, RoundedCornerShape(16.dp))
                    .border(
                        width = if (isInputFocused) 2.dp else 1.dp,
                        color = if (isInputFocused) brandTeal else borderLight,
                        shape = RoundedCornerShape(16.dp)
                    )
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) {
                        focusRequester.requestFocus()
                    }
                    .padding(horizontal = 16.dp, vertical = 16.dp)
            ) {
                BasicTextField(
                    value = formattedAbha,
                    onValueChange = { input ->
                        val digits = input.filter { it.isDigit() }.take(14)
                        rawDigits = digits
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .focusRequester(focusRequester)
                        .onFocusChanged { isInputFocused = it.isFocused },
                    textStyle = TextStyle(
                        fontSize = 16.sp,
                        color = slateDark,
                        fontWeight = FontWeight.Normal,
                        letterSpacing = 1.sp
                    ),
                    cursorBrush = SolidColor(brandTeal),
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Number,
                        imeAction = ImeAction.Done
                    ),
                    keyboardActions = KeyboardActions(
                        onDone = { focusManager.clearFocus() }
                    ),
                    singleLine = true,
                    decorationBox = { innerTextField ->
                        if (formattedAbha.isEmpty()) {
                            Text(
                                text = "XX-XXXX-XXXX-XXXX",
                                color = placeholderColor,
                                fontSize = 16.sp,
                                letterSpacing = 1.sp
                            )
                        }
                        innerTextField()
                    }
                )
            }

            // Privacy & Protection Disclaimer Card
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 14.dp)
                    .background(privacyBadgeBg, RoundedCornerShape(12.dp))
                    .border(1.dp, privacyBadgeBorder, RoundedCornerShape(12.dp))
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_privacy_heart),
                    contentDescription = "Privacy Shield",
                    tint = brandTeal,
                    modifier = Modifier.size(14.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Your health information is protected and shared only with your permission.",
                    fontSize = 11.sp,
                    color = brandTeal,
                    fontWeight = FontWeight.Medium,
                    lineHeight = 14.sp
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Primary Action CTA Button ("Continue")
            Button(
                onClick = {
                    focusManager.clearFocus()
                    onContinueClick(rawDigits)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = buttonTeal,
                    contentColor = Color.White
                ),
                elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp)
            ) {
                Text(
                    text = "Continue",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.weight(1f).heightIn(min = 28.dp))

            // Footer Section: Divider with "or"
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 20.dp)
            ) {
                HorizontalDivider(color = Color(0xFFCBD5E1).copy(alpha = 0.8f))
                Text(
                    text = "or",
                    modifier = Modifier
                        .background(bgLight)
                        .padding(horizontal = 14.dp),
                    color = Color(0xFF8E9BAE),
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Normal
                )
            }

            // Footer Link: Create ABHA ID
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Don't have ABHA?",
                    color = slateMuted,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Normal
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center,
                    modifier = Modifier.clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { onCreateAbhaClick() }
                ) {
                    Text(
                        text = "Create ABHA ID",
                        color = brandTeal,
                        fontSize = 17.5.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Icon(
                        painter = painterResource(id = R.drawable.ic_chevron_right_small),
                        contentDescription = "Go",
                        tint = brandTeal,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun AbhaIdScreenPreview() {
    MaterialTheme {
        AbhaIdScreen(
            onContinueClick = {},
            onCreateAbhaClick = {},
            onLoginClick = {}
        )
    }
}
