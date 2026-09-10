package com.example.aarogyaflow.feature.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview

@Composable
fun VerifyMobileScreen(
    onBackClick: () -> Unit,
    onVerifyClick: (String) -> Unit,
    onResendClick: () -> Unit
) {
    var otpValue by remember { mutableStateOf("") }
    
    val bgGradient = Brush.verticalGradient(
        colors = listOf(
            Color(0xFFEBF2F7),
            Color(0xFFEEF4F9),
            Color(0xFFF1F5F9)
        )
    )
    val darkGreen = Color(0xFF0A5645)
    val textHeading = Color(0xFF192231)
    val textSubtitle = Color(0xFF556575)
    val btnColor = Color(0xFF618D83)
    val resendColor = Color(0xFF0B5C4D)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF2F4F7)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(bgGradient)
                .statusBarsPadding()
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
        ) {
            // Header: Back Button
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                TextButton(onClick = onBackClick, contentPadding = PaddingValues(0.dp)) {
                    Text("< Back", color = Color(0xFF3D4C5E), fontSize = 17.sp, fontWeight = FontWeight.Medium)
                }
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Badge Icon
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(darkGreen, RoundedCornerShape(14.dp))
                    .shadow(1.dp, RoundedCornerShape(14.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text("✉️", fontSize = 20.sp) // Message icon placeholder
            }
            
            Spacer(modifier = Modifier.height(20.dp))
            
            Text(
                text = "Verify your mobile number",
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = textHeading,
                lineHeight = 32.sp
            )
            
            Spacer(modifier = Modifier.height(6.dp))
            
            Text(
                text = "We sent a 6-digit code to +91 ••••••8901",
                fontSize = 14.sp,
                color = textSubtitle
            )
            
            Spacer(modifier = Modifier.height(24.dp))
            
            // OTP Input
            BasicTextField(
                value = otpValue,
                onValueChange = { if (it.length <= 6 && it.all { char -> char.isDigit() }) otpValue = it },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                decorationBox = {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        repeat(6) { index ->
                            val char = when {
                                index >= otpValue.length -> ""
                                else -> otpValue[index].toString()
                            }
                            val isFocused = otpValue.length == index
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .aspectRatio(1f)
                                    .background(Color.White, RoundedCornerShape(16.dp))
                                    .border(
                                        width = if (isFocused) 1.5.dp else 1.dp,
                                        color = if (isFocused) btnColor else Color(0xFFD9E2EC).copy(alpha = 0.7f),
                                        shape = RoundedCornerShape(16.dp)
                                    )
                                    .shadow(2.dp, RoundedCornerShape(16.dp)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = char,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1E293B)
                                )
                            }
                        }
                    }
                }
            )
            
            Spacer(modifier = Modifier.height(12.dp))
            
            Text(
                text = "Enter each digit or paste the full code",
                fontSize = 13.sp,
                color = Color(0xFF6E7F91)
            )
            
            Spacer(modifier = Modifier.height(32.dp))
            
            Button(
                onClick = { onVerifyClick(otpValue) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = darkGreen,
                    contentColor = Color.White
                )
            ) {
                Text("Verify", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Box(
                modifier = Modifier.fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                TextButton(onClick = onResendClick) {
                    Text("Resend OTP", color = resendColor, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                }
            }
            
            Spacer(modifier = Modifier.weight(1f))
            
            // Bottom Indicator
            Box(
                modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
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

@Preview
@Composable
fun VerifyMobileScreenPreview() {
    MaterialTheme {
        VerifyMobileScreen({}, {}, {})
    }
}
