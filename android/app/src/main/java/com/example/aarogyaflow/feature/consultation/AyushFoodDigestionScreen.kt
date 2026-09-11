package com.example.aarogyaflow.feature.consultation

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun AyushFoodDigestionScreen(
    assessmentState: AyushAssessmentState,
    onBackClick: () -> Unit,
    onContinueClick: (foodDigestion: String) -> Unit
) {
    val ayushPrimary = Color(0xFF8D6E63)
    val ayushLight = Color(0xFFFBE9E7)
    val ayushDark = Color(0xFF5D4037)
    val textHeading = Color(0xFF1E293B)
    val textBody = Color(0xFF475569)
    val textMuted = Color(0xFF94A3B8)
    val borderLight = Color(0xFFE2E8F0)

    var foodText by remember { mutableStateOf(assessmentState.foodDigestion) }
    val isValid = foodText.trim().isNotBlank()

    Scaffold(
        containerColor = Color(0xFFF8FAFC),
        topBar = {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Box(
                    modifier = Modifier
                        .clickable(onClick = onBackClick)
                        .padding(4.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_chevron_left),
                        contentDescription = "Go back",
                        tint = Color(0xFF334155),
                        modifier = Modifier.size(22.dp)
                    )
                }

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(ayushDark),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_aarogyaflow_logo),
                            contentDescription = "AarogyaFlow logo",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    }
                    Text(
                        text = "AarogyaFlow",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0F172A)
                    )
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF8FAFC))
                .padding(paddingValues)
                .padding(horizontal = 20.dp, vertical = 16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Progress indicator
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                ProgressStep(1, 5, false, ayushDark)
                ProgressStep(2, 5, false, ayushDark)
                ProgressStep(3, 5, false, ayushDark)
                ProgressStep(4, 5, true, ayushDark)
                ProgressStep(5, 5, false, ayushDark)
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Icon Badge
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .background(ayushDark, RoundedCornerShape(18.dp))
                    .shadow(2.dp, RoundedCornerShape(18.dp)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_bowl_food),
                    contentDescription = null,
                    tint = Color(0xFFFBE9E7),
                    modifier = Modifier.size(28.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Title
            Text(
                text = "Food & Digestion (Ahara & Agni)",
                fontSize = 20.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF0F2438),
                letterSpacing = (-0.3).sp,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Describe your typical diet, appetite, digestion, and any food-related symptoms.",
                fontSize = 13.5.sp,
                color = textBody,
                textAlign = TextAlign.Center,
                lineHeight = 18.sp,
                modifier = Modifier.padding(horizontal = 8.dp)
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Guiding prompts
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.Start,
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                PromptChip("Typical meals & food preferences", textMuted, borderLight)
                PromptChip("Appetite: strong, variable, or low", textMuted, borderLight)
                PromptChip("Digestion: bloating, gas, heaviness, acidity", textMuted, borderLight)
                PromptChip("Bowel movements: frequency & consistency", textMuted, borderLight)
                PromptChip("Food sensitivities or intolerances", textMuted, borderLight)
                PromptChip("Cravings: sweet, salty, sour, spicy", textMuted, borderLight)
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Text Input
            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Your Food & Digestion",
                    fontSize = 10.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF475569),
                    letterSpacing = 0.8.sp
                )

                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .border(1.dp, if (!isValid && foodText.isNotBlank()) Color(0xFFEF4444) else borderLight, RoundedCornerShape(16.dp))
                        .shadow(1.dp, RoundedCornerShape(16.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    BasicTextField(
                        value = foodText,
                        onValueChange = { foodText = it },
                        singleLine = false,
                        maxLines = 6,
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Text,
                            imeAction = ImeAction.Next
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                            .minHeight(140.dp)
                            .background(Color.Transparent, RoundedCornerShape(16.dp)),
                        textStyle = TextStyle(
                            fontSize = 16.sp,
                            color = textHeading
                        ),
                        decorationBox = { innerTextField ->
                            if (foodText.isEmpty()) {
                                Text(
                                    text = "e.g., Vegetarian, 3 meals daily, good appetite, occasional bloating after dairy, regular bowel movements, crave sweets in evening...",
                                    fontSize = 16.sp,
                                    color = textMuted,
                                    style = TextStyle(fontSize = 16.sp, color = textMuted)
                                )
                            }
                            innerTextField()
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Action Button
            Button(
                onClick = { if (isValid) onContinueClick(foodText.trim()) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isValid) ayushDark else Color(0xFF94A3B8),
                    contentColor = Color.White
                ),
                elevation = ButtonDefaults.buttonElevation(defaultElevation = 1.dp),
                enabled = isValid
            ) {
                Text(
                    text = "Continue",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    letterSpacing = 0.5.sp
                )
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Step 4 of 5: Food & Digestion",
                fontSize = 11.sp,
                color = textMuted,
                textAlign = TextAlign.Center
            )
        }
    }
}

@Composable
private fun PromptChip(text: String, textColor: Color, borderColor: Color) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(10.dp))
            .border(1.dp, borderColor, RoundedCornerShape(10.dp))
            .padding(horizontal = 14.dp, vertical = 10.dp),
        contentAlignment = Alignment.CenterStart
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(Color(0xFF8D6E63), CircleShape)
            )
            Text(
                text = text,
                fontSize = 13.sp,
                color = textColor
            )
        }
    }
}

@Composable
private fun ProgressStep(step: Int, total: Int, isActive: Boolean, activeColor: Color) {
    val inactiveColor = Color(0xFFE2E8F0)
    Row(
        modifier = Modifier.weight(1f, true),
        horizontalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(24.dp)
                .background(if (isActive) activeColor else inactiveColor, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "$step",
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = if (isActive) Color.White else Color(0xFF94A3B8)
            )
        }
    }
}