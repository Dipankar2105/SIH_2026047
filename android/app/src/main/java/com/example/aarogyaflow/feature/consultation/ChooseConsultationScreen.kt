package com.example.aarogyaflow.feature.consultation

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ChooseConsultationScreen(
    onBackClick: () -> Unit,
    onAllopathyClick: () -> Unit,
    onAyushClick: () -> Unit
) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {},
                navigationIcon = {
                    IconButton(onClick = onBackClick) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color(0xFF334155)
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.Transparent)
            )
        },
        containerColor = Color(0xFFE5E9EC)
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFFF4F7F9), RoundedCornerShape(topStart = 48.dp, topEnd = 48.dp))
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 20.dp, vertical = 24.dp)
            ) {
                Text(
                    text = "What kind of\nconsultation today?",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color(0xFF111E33),
                    lineHeight = 32.sp,
                    letterSpacing = (-0.5).sp
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "Choose the type of care you'd like.",
                    fontSize = 14.sp,
                    color = Color(0xFF69798E)
                )

                Spacer(modifier = Modifier.height(32.dp))

                // Modern Medicine Card
                ConsultationOptionCard(
                    title = "Modern Medicine",
                    subtitle = "General medical consultation",
                    iconBackgroundColor = Color(0xFFEFF5F5),
                    iconContent = {
                        androidx.compose.foundation.Image(
                            painter = painterResource(id = R.drawable.ic_pills),
                            contentDescription = null,
                            modifier = Modifier.size(44.dp)
                        )
                    },
                    onClick = onAllopathyClick
                )

                Spacer(modifier = Modifier.height(16.dp))

                // AYUSH Card
                ConsultationOptionCard(
                    title = "AYUSH / Ayurveda",
                    subtitle = "Ayurvedic consultation",
                    iconBackgroundColor = Color(0xFFF7F3EC),
                    iconContent = {
                        androidx.compose.foundation.Image(
                            painter = painterResource(id = R.drawable.ic_herbs),
                            contentDescription = null,
                            modifier = Modifier.size(44.dp)
                        )
                    },
                    onClick = onAyushClick
                )
            }
        }
    }
}

@Composable
fun ConsultationOptionCard(
    title: String,
    subtitle: String,
    iconBackgroundColor: Color,
    iconContent: @Composable () -> Unit,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, Color(0xE6E2E8F0), RoundedCornerShape(16.dp))
            .clickable { onClick() }
            .padding(16.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(64.dp)
                .background(iconBackgroundColor, RoundedCornerShape(16.dp)),
            contentAlignment = Alignment.Center
        ) {
            iconContent()
        }
        
        Spacer(modifier = Modifier.width(18.dp))
        
        Column {
            Text(
                text = title,
                fontSize = 17.sp,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF142337)
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = subtitle,
                fontSize = 13.sp,
                color = Color(0xFF6D7C92)
            )
        }
    }
}
