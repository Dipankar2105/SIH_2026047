package com.example.aarogyaflow.feature.auth

import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.TextRange
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun VerifyMobileScreen(
    mobileNumber: String = "+91 ••••••8901",
    onBackClick: () -> Unit,
    onVerifyClick: (String) -> Unit,
    onResendClick: () -> Unit
) {
    var otpValue by remember { mutableStateOf("") }
    var isFieldFocused by remember { mutableStateOf(false) }
    val focusRequester = remember { FocusRequester() }
    val focusManager = LocalFocusManager.current

    // Explicit brand colors from Stitch specification
    val bgGradient = Brush.verticalGradient(
        colors = listOf(
            Color(0xFFEBF2F7),
            Color(0xFFEEF4F9),
            Color(0xFFF1F5F9)
        )
    )
    val iconBg = Color(0xFF0A5645)
    val textHeading = Color(0xFF192231)
    val textSubtitle = Color(0xFF556575)
    val textPhone = Color(0xFF293845)
    val borderUnfocused = Color(0xFFD9E2EC)
    val borderFocused = Color(0xFF5E8F85)
    val btnColor = Color(0xFF618D83)
    val resendColor = Color(0xFF0B5C4D)
    val helperTextColor = Color(0xFF6E7F91)
    val digitColor = Color(0xFF1E293B)
    val caretColor = Color(0xFF0A5645)

    // Animated cursor blinking for the active OTP box
    val infiniteTransition = rememberInfiniteTransition(label = "cursorBlink")
    val cursorAlpha by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = 0f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 500),
            repeatMode = RepeatMode.Reverse
        ),
        label = "cursorAlpha"
    )

    // Automatically request focus when entering the screen
    LaunchedEffect(Unit) {
        focusRequester.requestFocus()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF1F5F9))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(bgGradient)
                .statusBarsPadding()
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 24.dp, vertical = 16.dp)
        ) {
            // Header: Back Navigation Button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier
                        .clickable(
                            interactionSource = remember { MutableInteractionSource() },
                            indication = null
                        ) { onBackClick() }
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_chevron_left),
                        contentDescription = "Back",
                        tint = Color(0xFF3D4C5E),
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "Back",
                        color = Color(0xFF3D4C5E),
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Badge Icon (Phone)
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(iconBg, RoundedCornerShape(14.dp))
                    .shadow(1.dp, RoundedCornerShape(14.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_mobile_device),
                    contentDescription = "Mobile Verification",
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // Screen Title
            Text(
                text = "Verify your mobile number",
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = textHeading,
                lineHeight = 32.sp
            )

            Spacer(modifier = Modifier.height(6.dp))

            // Subtitle with masked phone number
            val subtitleText = buildAnnotatedString {
                append("We sent a 6-digit code to ")
                withStyle(SpanStyle(fontWeight = FontWeight.Medium, color = textPhone)) {
                    append(if (mobileNumber.startsWith("+91")) mobileNumber else "+91 ••••••8901")
                }
            }
            Text(
                text = subtitleText,
                fontSize = 14.sp,
                color = textSubtitle
            )

            Spacer(modifier = Modifier.height(24.dp))

            // OTP Input Grid (DETERMINISTIC, NEVER SOLID BLACK)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) {
                        focusRequester.requestFocus()
                    }
            ) {
                // Transparent, fully functional BasicTextField overlay
                BasicTextField(
                    value = TextFieldValue(
                        text = otpValue,
                        selection = TextRange(otpValue.length)
                    ),
                    onValueChange = { newValue ->
                        val digits = newValue.text.filter { it.isDigit() }.take(6)
                        otpValue = digits
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .focusRequester(focusRequester)
                        .onFocusChanged { isFieldFocused = it.isFocused },
                    keyboardOptions = KeyboardOptions(
                        keyboardType = KeyboardType.Number,
                        imeAction = ImeAction.Done
                    ),
                    keyboardActions = KeyboardActions(
                        onDone = { focusManager.clearFocus() }
                    ),
                    cursorBrush = SolidColor(Color.Transparent),
                    textStyle = TextStyle(color = Color.Transparent, fontSize = 1.sp),
                    decorationBox = {
                        // Visual OTP cells rendered with explicit pure white background
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            repeat(6) { index ->
                                val digit = otpValue.getOrNull(index)?.toString() ?: ""
                                val isCurrentTarget = index == otpValue.length.coerceAtMost(5)
                                val isFocusedCell = isFieldFocused && isCurrentTarget

                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .aspectRatio(1f)
                                        .shadow(1.dp, RoundedCornerShape(16.dp), clip = false)
                                        .clip(RoundedCornerShape(16.dp))
                                        .background(Color.White, RoundedCornerShape(16.dp))
                                        .border(
                                            width = if (isFocusedCell) 1.5.dp else 1.dp,
                                            color = if (isFocusedCell) borderFocused else borderUnfocused.copy(alpha = 0.7f),
                                            shape = RoundedCornerShape(16.dp)
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (digit.isNotEmpty()) {
                                        Text(
                                            text = digit,
                                            fontSize = 20.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = digitColor,
                                            textAlign = TextAlign.Center
                                        )
                                    } else if (isFocusedCell) {
                                        // Vertical caret in active cell
                                        Box(
                                            modifier = Modifier
                                                .width(2.dp)
                                                .height(20.dp)
                                                .background(caretColor.copy(alpha = cursorAlpha), RoundedCornerShape(1.dp))
                                        )
                                    }
                                }
                            }
                        }
                    }
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Helper text below OTP cells
            Text(
                text = "Enter each digit or paste the full code",
                fontSize = 13.sp,
                color = helperTextColor
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Primary Action Button ("Verify")
            Button(
                onClick = {
                    focusManager.clearFocus()
                    onVerifyClick(otpValue)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = btnColor,
                    contentColor = Color.White
                ),
                elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp)
            ) {
                Text(
                    text = "Verify",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Resend OTP Action
            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "Resend OTP",
                    color = resendColor,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) { onResendClick() }
                )
            }

            Spacer(modifier = Modifier.weight(1f).heightIn(min = 32.dp))

            // Bottom Home Indicator (Matches Stitch layout)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .width(128.dp)
                        .height(4.dp)
                        .background(Color(0xFFCBD5E1).copy(alpha = 0.4f), RoundedCornerShape(2.dp))
                )
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun VerifyMobileScreenPreview() {
    MaterialTheme {
        VerifyMobileScreen(
            onBackClick = {},
            onVerifyClick = {},
            onResendClick = {}
        )
    }
}
