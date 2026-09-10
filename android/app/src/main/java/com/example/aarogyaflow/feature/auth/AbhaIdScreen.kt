package com.example.aarogyaflow.feature.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AbhaIdScreen(
    onContinueClick: (String) -> Unit,
    onCreateAbhaClick: () -> Unit,
    onLoginClick: () -> Unit
) {
    var abhaId by remember { mutableStateOf("") }
    
    // Brand colors from Stitch
    val bgLight = Color(0xFFF2F6F9)
    val teal = Color(0xFF005E54)
    val tealLight = Color(0xFF5D8E84)
    val tealHover = Color(0xFF528278)
    val badgeBg = Color(0xFFE6F8F5)
    val badgeBorder = Color(0xFFB9EBE2)
    val slateText = Color(0xFF1E293B)
    val mutedText = Color(0xFF64748B)

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF2F4F7)),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(bgLight)
                .statusBarsPadding()
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(24.dp)
        ) {
            // Header row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Log in",
                    color = Color(0xFF8E9BAE),
                    fontSize = 15.sp,
                    modifier = Modifier.clickable { onLoginClick() }
                )
                
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .background(teal, RoundedCornerShape(8.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("<>", color = Color.White, fontWeight = FontWeight.Bold) // Placeholder for code icon
                }
            }

            // Brand row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 16.dp),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    modifier = Modifier
                        .background(Color.White, CircleShape)
                        .border(1.dp, Color(0xFFF1F5F9), CircleShape)
                        .padding(horizontal = 14.dp, vertical = 6.dp)
                        .shadow(1.dp, CircleShape),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Logo placeholder
                    Box(modifier = Modifier.size(24.dp).background(Color.LightGray, RoundedCornerShape(6.dp)))
                    Text(
                        text = "AAROGYAFLOW",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = slateText,
                        letterSpacing = 1.sp
                    )
                }
                
                Spacer(modifier = Modifier.width(14.dp))
                
                Column(
                    modifier = Modifier
                        .background(Color.White, RoundedCornerShape(12.dp))
                        .border(1.dp, Color(0xFFF1F5F9), RoundedCornerShape(12.dp))
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                        .shadow(1.dp, RoundedCornerShape(12.dp)),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text("🔊", fontSize = 16.sp) // Audio icon placeholder
                    Text("Listen", fontSize = 10.sp, color = mutedText)
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Main Content
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .background(teal, RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text("👤", fontSize = 24.sp) // Avatar icon placeholder
            }

            Spacer(modifier = Modifier.height(20.dp))

            Text(
                text = "Enter your ABHA ID",
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF111C2E)
            )
            
            Spacer(modifier = Modifier.height(6.dp))
            
            Text(
                text = "Your 14-digit Ayushman Bharat Health Account number",
                fontSize = 13.5.sp,
                color = mutedText
            )

            Spacer(modifier = Modifier.height(24.dp))

            // ABHA Input
            OutlinedTextField(
                value = abhaId,
                onValueChange = { 
                    val formatted = it.filter { char -> char.isDigit() }.take(14)
                    // We can apply formatting logic here if needed (XX-XXXX-XXXX-XXXX)
                    abhaId = formatted
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .shadow(2.dp, RoundedCornerShape(16.dp)),
                placeholder = { Text("XX-XXXX-XXXX-XXXX", color = Color(0xFF9AA8BC)) },
                shape = RoundedCornerShape(16.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    unfocusedContainerColor = Color.White,
                    focusedContainerColor = Color.White,
                    unfocusedBorderColor = Color(0xFFE2E8F0),
                    focusedBorderColor = teal
                ),
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                singleLine = true
            )

            // Privacy Banner
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 14.dp)
                    .background(badgeBg, RoundedCornerShape(12.dp))
                    .border(1.dp, badgeBorder, RoundedCornerShape(12.dp))
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("🔒", fontSize = 14.sp) // Shield placeholder
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Your health information is protected and shared only with your permission.",
                    fontSize = 11.sp,
                    color = teal,
                    fontWeight = FontWeight.Medium,
                    lineHeight = 14.sp
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            Button(
                onClick = { onContinueClick(abhaId) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = teal,
                    contentColor = Color.White
                )
            ) {
                Text("Continue", fontSize = 16.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
            }
            
            Spacer(modifier = Modifier.weight(1f))

            // Footer
            Box(contentAlignment = Alignment.Center, modifier = Modifier.fillMaxWidth().padding(bottom = 24.dp)) {
                Divider(color = Color(0xFFE2E8F0))
                Text(
                    text = "or",
                    modifier = Modifier
                        .background(bgLight)
                        .padding(horizontal = 14.dp),
                    color = Color(0xFF8E9BAE),
                    fontSize = 13.sp
                )
            }
            
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text("Don't have ABHA?", color = mutedText, fontSize = 14.sp)
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Create ABHA ID >",
                    color = teal,
                    fontSize = 17.5.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.clickable { onCreateAbhaClick() }
                )
            }
        }
    }
}

@Preview
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
