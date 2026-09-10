package com.example.aarogyaflow.feature.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.tooling.preview.Preview

@Composable
fun ConsentScreen(
    onConsentClick: () -> Unit,
    onCancelClick: () -> Unit
) {
    var isAgreed by remember { mutableStateOf(false) }

    val bgOuter = Color(0xFF808996)
    val tealBadge = Color(0xFF0A6652)
    val btnColor = Color(0xFF659288)
    val btnHover = Color(0xFF578177)
    val textHeading = Color(0xFF1E293B)
    val textBody = Color(0xFF475569)
    val textMuted = Color(0xFF94A3B8)
    val itemIconBg = Color(0xFFD5F4EE)
    val itemIconColor = Color(0xFF0A9E88)
    
    val consentItems = listOf(
        "Collect information you provide during consultation" to "Only what you share directly with us.",
        "Organise your medical history" to "So your care team has a clear picture.",
        "Process uploaded medical documents" to "Reports, prescriptions, and test results you add.",
        "Prepare information for your healthcare provider" to "Shared before or during consultations.",
        "Store verified health records" to "Securely, linked to your ABHA profile.",
        "Share relevant information according to your permissions" to "You choose what's shared and with whom."
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(bgOuter)
            .padding(16.dp),
        contentAlignment = Alignment.BottomCenter
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .shadow(8.dp, RoundedCornerShape(28.dp))
                .background(Color.White, RoundedCornerShape(28.dp))
                .verticalScroll(rememberScrollState())
                .padding(start = 24.dp, end = 24.dp, top = 24.dp, bottom = 28.dp)
        ) {
            // Header
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(tealBadge, RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Text("🔑", fontSize = 20.sp) // Key Icon Placeholder
                }
                Spacer(modifier = Modifier.width(14.dp))
                Column {
                    Text("Your consent matters", fontSize = 21.sp, fontWeight = FontWeight.Bold, color = textHeading)
                    Text("You're always in control of your health data.", fontSize = 13.sp, color = textBody)
                }
            }
            
            HorizontalDivider(modifier = Modifier.padding(vertical = 16.dp), color = Color(0xFFF1F5F9))
            
            Text(
                "To provide you with the best care, this app may do the following. You can update these preferences at any time in Settings.",
                fontSize = 13.5.sp,
                color = textBody,
                lineHeight = 19.sp
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            // Consent Items
            consentItems.forEach { (title, desc) ->
                Row(
                    modifier = Modifier.padding(bottom = 12.dp),
                    verticalAlignment = Alignment.Top
                ) {
                    Box(
                        modifier = Modifier
                            .size(20.dp)
                            .background(itemIconBg, CircleShape)
                            .padding(top = 2.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text("✓", color = itemIconColor, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(title, fontSize = 13.5.sp, fontWeight = FontWeight.SemiBold, color = textHeading, lineHeight = 16.sp)
                        Text(desc, fontSize = 12.sp, color = textMuted, modifier = Modifier.padding(top = 2.dp))
                    }
                }
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            
            // Links
            Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                Text(
                    "View full consent details", 
                    fontSize = 13.sp, 
                    fontWeight = FontWeight.Medium, 
                    color = Color(0xFF0D8574),
                    modifier = Modifier.clickable { }
                )
                Text(
                    "Privacy policy", 
                    fontSize = 13.sp, 
                    color = textBody,
                    modifier = Modifier.clickable { }
                )
            }
            
            HorizontalDivider(modifier = Modifier.padding(top = 16.dp, bottom = 20.dp), color = Color(0xFFF1F5F9))
            
            // Agreement Checkbox
            Row(
                verticalAlignment = Alignment.Top,
                modifier = Modifier.clickable { isAgreed = !isAgreed }
            ) {
                Checkbox(
                    checked = isAgreed,
                    onCheckedChange = { isAgreed = it },
                    colors = CheckboxDefaults.colors(checkedColor = btnColor)
                )
                Text(
                    buildAnnotatedString {
                        append("I understand and agree. I know I can ")
                        withStyle(style = SpanStyle(fontWeight = FontWeight.SemiBold, color = Color(0xFF097B69))) {
                            append("change or withdraw")
                        }
                        append(" my consent at any time.")
                    },
                    fontSize = 13.sp,
                    color = textBody,
                    lineHeight = 18.sp,
                    modifier = Modifier.padding(top = 12.dp, start = 4.dp)
                )
            }
            
            Spacer(modifier = Modifier.height(20.dp))
            
            // Actions
            Button(
                onClick = { if (isAgreed) onConsentClick() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isAgreed) btnColor else Color.LightGray
                )
            ) {
                Text("Give Consent & Continue", fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            TextButton(
                onClick = onCancelClick,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Cancel", fontSize = 15.sp, fontWeight = FontWeight.Medium, color = textBody)
            }
        }
    }
}

@Preview
@Composable
fun ConsentScreenPreview() {
    MaterialTheme {
        ConsentScreen({}, {})
    }
}
