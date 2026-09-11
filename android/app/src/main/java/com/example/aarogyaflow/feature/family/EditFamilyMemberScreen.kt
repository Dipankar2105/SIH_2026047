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
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@Composable
fun EditFamilyMemberScreen(
    member: FamilyMember,
    onBackClick: () -> Unit,
    onSaveClick: (FamilyMember) -> Unit
) {
    val bgLight = Color(0xFFF1F5F9)
    val brandTeal = Color(0xFF0F766E)
    val textHeading = Color(0xFF0F172A)
    val textBody = Color(0xFF475563)
    val textMuted = Color(0xFF64748B)
    val borderLight = Color(0xFFE2E8F0)

    var nameInput by remember { mutableStateOf(member.name) }
    var relationshipInput by remember { mutableStateOf(member.relationship) }
    var ageInput by remember { mutableStateOf(member.age.toString()) }

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
                            contentDescription = "Back",
                            tint = Color(0xFF334155),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                    Text(
                        text = "Edit Family Member",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = textHeading
                    )
                }
                TextButton(onClick = onBackClick) {
                    Text(
                        text = "Cancel",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium,
                        color = textMuted
                    )
                }
            }

            HorizontalDivider(color = borderLight)

            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Basic Info Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .border(1.dp, borderLight, RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(
                            text = "Basic Information",
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.Bold,
                            color = textMuted,
                            letterSpacing = 0.8.sp
                        )

                        // Full Name
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Text(
                                text = "Full Name",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = textBody,
                                modifier = Modifier.padding(bottom = 4.dp)
                            )
                            OutlinedTextField(
                                value = nameInput,
                                onValueChange = { nameInput = it },
                                singleLine = true,
                                placeholder = { Text("e.g. Sunita Sharma") },
                                shape = RoundedCornerShape(12.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = brandTeal,
                                    unfocusedBorderColor = Color(0xFFD1D5DB),
                                    focusedContainerColor = Color(0xFFF8FAFC),
                                    unfocusedContainerColor = Color(0xFFF8FAFC)
                                ),
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        // Relationship
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Text(
                                text = "Relationship",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = textBody,
                                modifier = Modifier.padding(bottom = 4.dp)
                            )
                            OutlinedTextField(
                                value = relationshipInput,
                                onValueChange = { relationshipInput = it },
                                singleLine = true,
                                placeholder = { Text("e.g. Mother") },
                                shape = RoundedCornerShape(12.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = brandTeal,
                                    unfocusedBorderColor = Color(0xFFD1D5DB),
                                    focusedContainerColor = Color(0xFFF8FAFC),
                                    unfocusedContainerColor = Color(0xFFF8FAFC)
                                ),
                                modifier = Modifier.fillMaxWidth()
                            )
                        }

                        // Age
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Text(
                                text = "Age",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = textBody,
                                modifier = Modifier.padding(bottom = 4.dp)
                            )
                            OutlinedTextField(
                                value = ageInput,
                                onValueChange = { ageInput = it.filter { char -> char.isDigit() }.take(3) },
                                singleLine = true,
                                placeholder = { Text("e.g. 58") },
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                shape = RoundedCornerShape(12.dp),
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedBorderColor = brandTeal,
                                    unfocusedBorderColor = Color(0xFFD1D5DB),
                                    focusedContainerColor = Color(0xFFF8FAFC),
                                    unfocusedContainerColor = Color(0xFFF8FAFC)
                                ),
                                modifier = Modifier.fillMaxWidth()
                            )
                        }
                    }
                }

                // Read-only section: ABHA Number (not editable in this simple flow)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFFF8FAFC), RoundedCornerShape(12.dp))
                        .border(1.dp, borderLight, RoundedCornerShape(12.dp))
                        .padding(12.dp)
                ) {
                    Column {
                        Text(
                            text = "ABHA Number (linked)",
                            fontSize = 11.5.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = textBody
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = member.abhaNumber,
                            fontSize = 14.sp,
                            color = textHeading
                        )
                    }
                }
            }
        }

        // Bottom Save Button
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(Color.White)
                .border(width = 1.dp, color = borderLight)
                .padding(horizontal = 20.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedButton(
                onClick = onBackClick,
                modifier = Modifier.height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = textBody)
            ) {
                Text("Cancel", fontSize = 13.5.sp, fontWeight = FontWeight.SemiBold)
            }

            Button(
                onClick = {
                    val updated = member.copy(
                        name = nameInput.trim(),
                        relationship = relationshipInput.trim(),
                        age = ageInput.toIntOrNull() ?: member.age
                    )
                    onSaveClick(updated)
                },
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = brandTeal,
                    contentColor = Color.White
                )
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
                    fontSize = 13.5.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
