package com.example.aarogyaflow.feature.auth

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
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.text.SpanStyle
import androidx.compose.ui.text.buildAnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.withStyle
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun ConsentScreen(
    onConsentClick: () -> Unit,
    onCancelClick: () -> Unit
) {
    var isAgreed by remember { mutableStateOf(false) }

    // Stitch tokens from "Your consent matters" (your_consent_matters/code.html)
    val bgOverlay = Color(0xFF808996)
    val tealBadge = Color(0xFF0A6652)
    val ctaEnabled = Color(0xFF659288)
    val ctaDisabled = Color(0xFFAEBFBA)
    val textHeading = Color(0xFF1E293B)
    val textBody = Color(0xFF475569)
    val textSubtitle = Color(0xFF64748B)
    val textMuted = Color(0xFF94A3B8)
    val itemIconBg = Color(0xFFD5F4EE)
    val itemIconColor = Color(0xFF0A9E88)
    val borderDivider = Color(0xFFF1F5F9)

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
            .background(bgOverlay)
            .systemBarsPadding(),
        contentAlignment = Alignment.Center
    ) {
        // Consent card - scrollable in full, CTA reachable at bottom
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp)
                .shadow(8.dp, RoundedCornerShape(28.dp), clip = false)
                .background(Color.White, RoundedCornerShape(28.dp))
                .clip(RoundedCornerShape(28.dp))
                .verticalScroll(rememberScrollState())
                .padding(start = 24.dp, end = 24.dp, top = 24.dp, bottom = 28.dp)
        ) {
            // Header: Key Icon Badge + Title + Subtitle
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(48.dp)
                        .background(tealBadge, RoundedCornerShape(16.dp))
                        .shadow(1.dp, RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_key),
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(24.dp)
                    )
                }
                Spacer(modifier = Modifier.width(14.dp))
                Column {
                    Text(
                        text = "Your consent matters",
                        fontSize = 21.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading
                    )
                    Text(
                        text = "You're always in control of your health data.",
                        fontSize = 13.sp,
                        color = textSubtitle
                    )
                }
            }

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 16.dp),
                color = borderDivider
            )

            Text(
                text = "To provide you with the best care, this app may do the following. You can update these preferences at any time in Settings.",
                fontSize = 13.5.sp,
                color = textBody,
                lineHeight = 19.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Consent item list (14dp between items, 20dp after the last)
            consentItems.forEachIndexed { index, (title, desc) ->
                Row(
                    modifier = Modifier.padding(
                        bottom = if (index == consentItems.lastIndex) 20.dp else 14.dp
                    ),
                    verticalAlignment = Alignment.Top
                ) {
                    Box(
                        modifier = Modifier
                            .size(20.dp)
                            .background(itemIconBg, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_check_mark),
                            contentDescription = null,
                            tint = itemIconColor,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = title,
                            fontSize = 13.5.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = textHeading,
                            lineHeight = 17.sp
                        )
                        Text(
                            text = desc,
                            fontSize = 12.sp,
                            color = textMuted,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                }
            }

            // Supporting links
            Row(horizontalArrangement = Arrangement.spacedBy(20.dp)) {
                Text(
                    text = "View full consent details",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF0D8574),
                    textDecoration = TextDecoration.Underline,
                    modifier = Modifier.clickable { }
                )
                Text(
                    text = "Privacy policy",
                    fontSize = 13.sp,
                    color = textBody,
                    textDecoration = TextDecoration.Underline,
                    modifier = Modifier.clickable { }
                )
            }

            HorizontalDivider(
                modifier = Modifier.padding(top = 16.dp, bottom = 20.dp),
                color = borderDivider
            )

            // Agreement checkbox row
            Row(
                verticalAlignment = Alignment.Top,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(8.dp))
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null,
                        role = Role.Checkbox,
                        onClickLabel = if (isAgreed) "Withdraw consent" else "Give consent"
                    ) { isAgreed = !isAgreed }
                    .padding(vertical = 2.dp)
            ) {
                StitchCheckbox(checked = isAgreed)
                Spacer(modifier = Modifier.width(12.dp))
                Text(
                    text = buildAnnotatedString {
                        append("I understand and agree. I know I can ")
                        withStyle(style = SpanStyle(fontWeight = FontWeight.SemiBold, color = Color(0xFF097B69))) {
                            append("change or withdraw")
                        }
                        append(" my consent at any time.")
                    },
                    fontSize = 13.sp,
                    color = textBody,
                    lineHeight = 18.sp,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // CTA (disabled until consent is checked)
            Button(
                onClick = onConsentClick,
                enabled = isAgreed,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = ctaEnabled,
                    disabledContainerColor = ctaDisabled,
                    contentColor = Color.White,
                    disabledContentColor = Color.White
                ),
                elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp)
            ) {
                Text("Give Consent & Continue", fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Cancel
            TextButton(
                onClick = onCancelClick,
                modifier = Modifier.fillMaxWidth(),
                contentPadding = PaddingValues(vertical = 6.dp)
            ) {
                Text("Cancel", fontSize = 15.sp, fontWeight = FontWeight.Medium, color = textBody)
            }
        }
    }
}

@Composable
private fun StitchCheckbox(checked: Boolean) {
    val accent = Color(0xFF659288)
    val borderColor = Color(0xFFCBD5E1)
    Box(
        modifier = Modifier
            .size(22.dp)
            .clip(RoundedCornerShape(6.dp))
            .background(
                if (checked) accent else Color.White,
                RoundedCornerShape(6.dp)
            )
            .border(
                width = 1.5.dp,
                color = if (checked) accent else borderColor,
                shape = RoundedCornerShape(6.dp)
            ),
        contentAlignment = Alignment.Center
    ) {
        if (checked) {
            Icon(
                painter = painterResource(id = R.drawable.ic_check_mark),
                contentDescription = null,
                tint = Color.White,
                modifier = Modifier.size(14.dp)
            )
        }
    }
}

@Preview(showBackground = true)
@Composable
fun ConsentScreenPreview() {
    MaterialTheme {
        ConsentScreen(
            onConsentClick = {},
            onCancelClick = {}
        )
    }
}