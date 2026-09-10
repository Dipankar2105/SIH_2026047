package com.example.aarogyaflow.feature.home

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.rememberAsyncImagePainter

@Composable
fun HomeScreen(
    onNotificationsClick: () -> Unit,
    onAboutYouClick: () -> Unit,
    onStartConsultationClick: () -> Unit,
    onHealthRecordsClick: () -> Unit,
    onAppointmentsClick: () -> Unit,
    onFamilyMembersClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF1F5F9))
            .padding(16.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF5F8F9), RoundedCornerShape(44.dp))
                .shadow(16.dp, RoundedCornerShape(44.dp))
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 20.dp, end = 20.dp, top = 32.dp, bottom = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Brand Logo & Name
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(modifier = Modifier.size(36.dp).background(Color.LightGray, RoundedCornerShape(12.dp))) {
                        // Placeholder for logo
                        Text("AF", modifier = Modifier.align(Alignment.Center), fontWeight = FontWeight.Bold, color = Color.White)
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Text("AarogyaFlow", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color(0xFF111827))
                }
                // Right Controls
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    // Language
                    Box(
                        modifier = Modifier
                            .background(Color(0xCCFFFFFF), RoundedCornerShape(16.dp))
                            .border(1.dp, Color(0xFFD1D5DB), RoundedCornerShape(16.dp))
                            .padding(horizontal = 12.dp, vertical = 6.dp)
                    ) {
                        Text("EN", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF374151))
                    }
                    // Audio button placeholder
                    Text("🔊", fontSize = 18.sp, modifier = Modifier.clickable { })
                    // Notification bell placeholder
                    Text("🔔", fontSize = 20.sp, modifier = Modifier.clickable { onNotificationsClick() })
                }
            }

            // Main Content Area
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(horizontal = 20.dp, vertical = 8.dp)
            ) {
                // User Greeting
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(56.dp)
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(Color(0xFF99F6E4), Color(0xFF34D399))
                                ),
                                CircleShape
                            )
                            .padding(2.5.dp)
                    ) {
                        Box(modifier = Modifier.fillMaxSize().background(Color(0xFFECFDF5), CircleShape).clip(CircleShape)) {
                            // Avatar placeholder
                            Text("R", modifier = Modifier.align(Alignment.Center), fontSize = 24.sp, fontWeight = FontWeight.Bold, color = Color(0xFF0A735E))
                        }
                    }
                    Spacer(modifier = Modifier.width(14.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Good morning,", fontSize = 12.sp, color = Color(0xFF6B7280))
                        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                            Text("Rahul", fontSize = 20.sp, fontWeight = FontWeight.Bold, color = Color(0xFF111827))
                            Box(
                                modifier = Modifier
                                    .background(Color(0xFFEAF5F2), RoundedCornerShape(16.dp))
                                    .border(1.dp, Color(0x99A7F3D0), RoundedCornerShape(16.dp))
                                    .clickable { onAboutYouClick() }
                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Text("About You >", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color(0xFF0A735E))
                            }
                        }
                    }
                }
                
                Text("How can we help you today?", fontSize = 14.sp, fontWeight = FontWeight.Medium, color = Color(0xFF4B5563))
                Spacer(modifier = Modifier.height(16.dp))

                // Primary Hero Card
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF015C49), RoundedCornerShape(16.dp))
                        .shadow(8.dp, RoundedCornerShape(16.dp), spotColor = Color(0xFF015C49))
                        .padding(20.dp)
                ) {
                    Row(verticalAlignment = Alignment.Top) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .background(Color.White.copy(alpha = 0.1f), RoundedCornerShape(12.dp))
                                .border(1.dp, Color.White.copy(alpha = 0.1f), RoundedCornerShape(12.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("📋", fontSize = 24.sp)
                        }
                        Spacer(modifier = Modifier.width(16.dp))
                        Column {
                            Text("Start Consultation", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text("Tell us what's wrong and share your health history.", fontSize = 12.sp, color = Color(0xCCE6F4F1), lineHeight = 16.sp)
                            Spacer(modifier = Modifier.height(16.dp))
                            Button(
                                onClick = onStartConsultationClick,
                                colors = ButtonDefaults.buttonColors(containerColor = Color.White.copy(alpha = 0.15f)),
                                shape = RoundedCornerShape(12.dp),
                                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                                modifier = Modifier.height(36.dp)
                            ) {
                                Text("Begin >", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = Color.White)
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Secondary Actions List
                Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    SecondaryActionCard("My Health Records", "Reports, prescriptions and previous visits.", "📂", onHealthRecordsClick)
                    SecondaryActionCard("Appointments / Queue", "Your appointment or hospital queue status.", "📅", onAppointmentsClick)
                    SecondaryActionCard("Family Members", "Manage your linked family members", "👥", onFamilyMembersClick)
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Recent Activity
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White, RoundedCornerShape(16.dp))
                        .border(1.dp, Color(0xB3E5E7EB), RoundedCornerShape(16.dp))
                        .padding(16.dp)
                ) {
                    Column {
                        Text("RECENT ACTIVITY", fontSize = 10.5.sp, fontWeight = FontWeight.Bold, color = Color(0xFF9CA3AF), letterSpacing = 1.sp)
                        Spacer(modifier = Modifier.height(6.dp))
                        Text("Your health activity will appear here after your first consultation.", fontSize = 12.sp, color = Color(0xFF6B7280), lineHeight = 18.sp)
                    }
                }
                
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun SecondaryActionCard(title: String, subtitle: String, icon: String, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, Color(0xB3E5E7EB), RoundedCornerShape(16.dp))
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .background(Color(0xFFEAF5F2), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(icon, fontSize = 20.sp)
            }
            Spacer(modifier = Modifier.width(14.dp))
            Column {
                Text(title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF111827))
                Spacer(modifier = Modifier.height(2.dp))
                Text(subtitle, fontSize = 11.5.sp, color = Color(0xFF6B7280))
            }
        }
        Text(">", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = Color(0xFF9CA3AF))
    }
}

@Preview
@Composable
fun HomeScreenPreview() {
    MaterialTheme {
        HomeScreen({}, {}, {}, {}, {}, {})
    }
}
