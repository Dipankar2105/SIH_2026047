package com.example.aarogyaflow.feature.consultation

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.aarogyaflow.R
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class ChatMessage(
    val id: String,
    val sender: MessageSender,
    val text: String,
    val isGreeting: Boolean = false,
    val showListen: Boolean = true
)

enum class MessageSender {
    BOT, USER
}

@Composable
fun AllopathicChatScreen(
    onBackClick: () -> Unit,
    onProceedToUpload: () -> Unit,
    onRedFlagDetected: (triggerMessage: String) -> Unit
) {
    val coroutineScope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    var currentStep by remember { mutableIntStateOf(0) }
    var isBotTyping by remember { mutableStateOf(false) }
    var inputText by remember { mutableStateOf("") }
    var consultationCompleted by remember { mutableStateOf(false) }

    // Initial Messages matching Stitch:
    // Message 1: "Hello Rahul 👋\nLet's understand what you're feeling today."
    // Message 2: "What brings you here?"
    val messages = remember {
        mutableStateListOf(
            ChatMessage(
                id = "1",
                sender = MessageSender.BOT,
                text = "Hello Rahul 👋\nLet's understand what you're feeling today.",
                isGreeting = true,
                showListen = true
            ),
            ChatMessage(
                id = "2",
                sender = MessageSender.BOT,
                text = "What brings you here?",
                isGreeting = false,
                showListen = true
            )
        )
    }

    // Quick chips matching Stitch:
    // Step 0 options: Fever, Cough, Pain, Stomach problem, Headache, Other/Type
    // Follow-up options if Stomach problem chosen: Upper abdomen, Lower abdomen, Around the navel, Right side, Left side, Not sure
    var activeChips by remember {
        mutableStateOf(
            listOf("Fever", "Cough", "Pain", "Stomach problem", "Headache", "Other/Type")
        )
    }

    fun sendMessage(userText: String) {
        if (userText.isBlank()) return
        val trimmed = userText.trim()
        val userMsgId = System.currentTimeMillis().toString()
        messages.add(ChatMessage(id = userMsgId, sender = MessageSender.USER, text = trimmed))
        inputText = ""

        coroutineScope.launch {
            isBotTyping = true
            delay(700) // Natural conversational pacing
            isBotTyping = false

            val lowerText = trimmed.lowercase()
            val reply: String
            val nextChips: List<String>
            val isRedFlag: Boolean
            val complete: Boolean

            when {
                // Red flag keywords — trigger triage flow
                lowerText.contains("chest pain") ||
                lowerText.contains("difficulty breathing") ||
                lowerText.contains("shortness of breath") ||
                lowerText.contains("can't breathe") ||
                lowerText.contains("blurred vision") ||
                lowerText.contains("seizure") ||
                lowerText.contains("unconscious") ||
                lowerText.contains("heavy bleeding") -> {
                    reply = "I'm concerned about what you've described. These symptoms need immediate medical attention."
                    nextChips = emptyList()
                    isRedFlag = true
                    complete = false
                }
                lowerText.contains("stomach") -> {
                    reply = "I understand. To help me narrow it down, is the discomfort in your upper abdomen, lower abdomen, or around your navel?"
                    nextChips = listOf("Upper abdomen", "Lower abdomen", "Around the navel", "Right side", "Left side", "Not sure")
                    isRedFlag = false
                    complete = false
                }
                lowerText.contains("fever") -> {
                    reply = "Thank you for sharing. How high is your fever, and how long has it been going on?"
                    nextChips = listOf("Mild", "Moderate", "High", "Very high")
                    isRedFlag = false
                    complete = false
                }
                lowerText.contains("cough") -> {
                    reply = "Got it. Is your cough dry, or are you producing phlegm? And how long have you had it?"
                    nextChips = listOf("Dry cough", "Phlegm", "A week or less", "More than a week")
                    isRedFlag = false
                    complete = false
                }
                lowerText.contains("pain") -> {
                    reply = "Thanks for letting me know. How would you describe the pain — mild, moderate, or severe?"
                    nextChips = listOf("Mild", "Moderate", "Severe", "Throbbing", "Sharp")
                    isRedFlag = false
                    complete = false
                }
                lowerText.contains("headache") -> {
                    reply = "Understood. Where in your head do you feel the pain, and is it constant or coming in waves?"
                    nextChips = listOf("Front", "Back", "One side", "All over", "Constant", "Throbbing")
                    isRedFlag = false
                    complete = false
                }
                lowerText.contains("how long") || lowerText.contains("less than a day") ||
                lowerText.contains("1-3 days") || lowerText.contains("about a week") ||
                lowerText.contains("more than a week") -> {
                    reply = "Thank you for that detail. Have you taken any medication for these symptoms so far?"
                    nextChips = listOf("Yes, prescribed", "Yes, OTC", "No, not yet")
                    isRedFlag = false
                    complete = false
                }
                lowerText.contains("upper abdomen") || lowerText.contains("lower abdomen") ||
                lowerText.contains("around the navel") || lowerText.contains("right side") ||
                lowerText.contains("left side") -> {
                    reply = "Thank you for pinpointing that. Have you noticed any nausea, loss of appetite, or changes in your digestion?"
                    nextChips = listOf("Yes, nausea", "Yes, appetite loss", "Yes, digestion issues", "No, just pain")
                    isRedFlag = false
                    complete = false
                }
                lowerText.contains("mild") || lowerText.contains("moderate") ||
                lowerText.contains("severe") || lowerText.contains("throbbing") ||
                lowerText.contains("sharp") -> {
                    reply = "Thank you for describing that. Based on what you've told me, I recommend resting, staying hydrated, and monitoring how you feel. Would you like to upload any past reports to share with a doctor?"
                    nextChips = listOf("Yes, upload reports", "No, continue chat")
                    isRedFlag = false
                    complete = true
                }
                lowerText.contains("nausea") || lowerText.contains("appetite") ||
                lowerText.contains("digestion") -> {
                    reply = "I've noted those symptoms. To complete the assessment, would you like to upload any past medical reports or prescriptions for a more thorough review?"
                    nextChips = listOf("Yes, upload reports", "No, skip for now")
                    isRedFlag = false
                    complete = true
                }
                lowerText.contains("medication") || lowerText.contains("prescribed") ||
                lowerText.contains("otc") || lowerText.contains("not yet") -> {
                    reply = "Thank you for that information. I have enough details now to summarize your symptoms. Would you like to upload any past reports for a more complete review?"
                    nextChips = listOf("Yes, upload reports", "No, skip for now")
                    isRedFlag = false
                    complete = true
                }
                lowerText.contains("upload") -> {
                    reply = "Great! You can share your past medical reports or prescriptions now, or we can wrap up the chat first."
                    nextChips = listOf("Upload now", "Skip for now")
                    isRedFlag = false
                    complete = false
                }
                else -> {
                    reply = "Thank you for sharing that. Is there anything else you'd like to tell me about how you're feeling?"
                    nextChips = listOf("That's all", "More details")
                    isRedFlag = false
                    complete = false
                }
            }

            // Add bot reply message
            messages.add(
                ChatMessage(
                    id = System.currentTimeMillis().toString(),
                    sender = MessageSender.BOT,
                    text = reply,
                    showListen = true
                )
            )

            activeChips = nextChips
            currentStep++

            if (isRedFlag) {
                onRedFlagDetected(trimmed)
                return@launch
            }

            if (complete) {
                consultationCompleted = true
            }

            // Auto-scroll to latest
            delay(100)
            if (messages.isNotEmpty()) {
                listState.animateScrollToItem(messages.size - 1)
            }
        }
    }

    Scaffold(
        containerColor = Color(0xFFF8FAFC),
        topBar = {
            // Stitch Header layout: px-4 pt-3 pb-2.5 border-b border-gray-100 bg-white
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .statusBarsPadding()
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Left: Back Chevron + Brand Icon + Title & Assistant Status
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
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

                    // AarogyaFlow Logo Icon
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF00594C)),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_aarogyaflow_logo),
                            contentDescription = "AarogyaFlow logo",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier.fillMaxSize()
                        )
                    }

                    // Name & Health Assistant Status
                    Column {
                        Text(
                            text = "AarogyaFlow",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF0F172A),
                            lineHeight = 18.sp
                        )
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            modifier = Modifier.padding(top = 1.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .background(Color(0xFF10B981), CircleShape)
                            )
                            Text(
                                text = "Health Assistant",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF64748B)
                            )
                        }
                    }
                }

                // Right Utility Controls: Language & Speaker Audio
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Language Selector Pill
                    Row(
                        modifier = Modifier
                            .background(Color.White, CircleShape)
                            .border(1.dp, Color(0xFFCBD5E1), CircleShape)
                            .clickable { /* Language toggle */ }
                            .padding(horizontal = 10.dp, vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_globe),
                            contentDescription = "Language",
                            tint = Color(0xFF64748B),
                            modifier = Modifier.size(13.dp)
                        )
                        Text(
                            text = "EN",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFF334155)
                        )
                    }

                    // Speaker Volume Button
                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .clickable { /* Audio guidance */ }
                            .padding(4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_volume_speaker),
                            contentDescription = "Listen to instructions",
                            tint = Color(0xFF475569),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF8FAFC))
                .padding(paddingValues)
        ) {
            // Chat Message Stream
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(top = 12.dp, bottom = 16.dp)
            ) {
                items(messages, key = { it.id }) { msg ->
                    when (msg.sender) {
                        MessageSender.BOT -> {
                            BotMessageBubble(msg = msg)
                        }
                        MessageSender.USER -> {
                            UserMessageBubble(text = msg.text)
                        }
                    }
                }

                // Typing indicator item
                if (isBotTyping) {
                    item {
                        BotTypingIndicator()
                    }
                }

                // Quick symptom chips
                if (activeChips.isNotEmpty() && !isBotTyping) {
                    item {
                        QuickChipsRow(
                            chips = activeChips,
                            onChipClick = { chipText ->
                                sendMessage(chipText)
                            }
                        )
                    }
                }

                // Consultation Completed Banner & Proceed Button
                if (consultationCompleted) {
                    item {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 8.dp)
                                .background(Color(0xFFE8F5F1), RoundedCornerShape(16.dp))
                                .border(1.dp, Color(0xFFBCE3D8), RoundedCornerShape(16.dp))
                                .padding(16.dp)
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "Symptom Assessment Complete",
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF00594C)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Would you like to share any past medical reports or prescriptions?",
                                    fontSize = 12.sp,
                                    color = Color(0xFF334155),
                                    lineHeight = 16.sp
                                )
                                Spacer(modifier = Modifier.height(12.dp))
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(Color(0xFF00594C))
                                        .clickable { onProceedToUpload() }
                                        .padding(vertical = 12.dp),
                                    horizontalArrangement = Arrangement.Center,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = "Proceed to Upload Reports",
                                        color = Color.White,
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Icon(
                                        painter = painterResource(id = R.drawable.ic_arrow_right),
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Quick bypass to upload if user wants to skip chat
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color(0xFFF1F5F9))
                    .clickable { onProceedToUpload() }
                    .padding(vertical = 6.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Have reports ready? Skip to Upload Reports →",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF00594C)
                )
            }

            // Bottom Input Section matching Stitch:
            // Input pill with paperclip, text input, mic, teal send button + privacy footnote
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(Color.White)
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color.White, CircleShape)
                        .border(1.dp, Color(0xFFE2E8F0), CircleShape)
                        .padding(horizontal = 8.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Paperclip Attachment Button
                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .clickable { onProceedToUpload() }
                            .padding(6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_paperclip),
                            contentDescription = "Attach report",
                            tint = Color(0xFF64748B),
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // Text Input
                    BasicTextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 8.dp),
                        textStyle = TextStyle(
                            fontSize = 14.sp,
                            color = Color(0xFF1E293B)
                        ),
                        cursorBrush = SolidColor(Color(0xFF00594C)),
                        decorationBox = { innerTextField ->
                            if (inputText.isEmpty()) {
                                Text(
                                    text = "Type a message...",
                                    fontSize = 14.sp,
                                    color = Color(0xFF94A3B8)
                                )
                            }
                            innerTextField()
                        }
                    )

                    // Microphone voice button
                    Box(
                        modifier = Modifier
                            .clip(CircleShape)
                            .clickable {
                                // Voice input trigger simulation
                                sendMessage("I am having stomach pain since yesterday")
                            }
                            .padding(6.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_microphone),
                            contentDescription = "Voice input",
                            tint = Color(0xFF64748B),
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    // Circular Teal Send Button
                    Box(
                        modifier = Modifier
                            .size(34.dp)
                            .clip(CircleShape)
                            .background(Color(0xFFE0F5F2))
                            .clickable {
                                if (inputText.isNotBlank()) {
                                    sendMessage(inputText)
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_send),
                            contentDescription = "Send",
                            tint = Color(0xFF00594C),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(6.dp))

                // Privacy footnote
                Text(
                    text = "Speak or type • Your responses are private",
                    fontSize = 11.sp,
                    color = Color(0xFF94A3B8),
                    fontWeight = FontWeight.Normal
                )
            }
        }
    }
}

@Composable
fun BotMessageBubble(msg: ChatMessage) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(end = 48.dp),
        contentAlignment = Alignment.CenterStart
    ) {
        Column(
            modifier = Modifier
                .background(
                    Color.White,
                    RoundedCornerShape(
                        topStart = 4.dp,
                        topEnd = 20.dp,
                        bottomEnd = 20.dp,
                        bottomStart = 20.dp
                    )
                )
                .border(
                    1.dp,
                    Color(0xFFE2E8F0),
                    RoundedCornerShape(
                        topStart = 4.dp,
                        topEnd = 20.dp,
                        bottomEnd = 20.dp,
                        bottomStart = 20.dp
                    )
                )
                .padding(14.dp)
        ) {
            Text(
                text = msg.text,
                fontSize = 14.sp,
                color = Color(0xFF1E293B),
                lineHeight = 20.sp,
                fontWeight = if (msg.isGreeting) FontWeight.SemiBold else FontWeight.Normal
            )

            if (msg.showListen) {
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier
                        .clickable { /* TTS readout */ }
                        .padding(vertical = 2.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_volume_speaker),
                        contentDescription = "Listen",
                        tint = Color(0xFF94A3B8),
                        modifier = Modifier.size(14.dp)
                    )
                    Text(
                        text = "Listen",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF64748B)
                    )
                }
            }
        }
    }
}

@Composable
fun UserMessageBubble(text: String) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(start = 56.dp),
        contentAlignment = Alignment.CenterEnd
    ) {
        Box(
            modifier = Modifier
                .background(
                    Color(0xFF00594C),
                    RoundedCornerShape(
                        topStart = 18.dp,
                        topEnd = 4.dp,
                        bottomEnd = 18.dp,
                        bottomStart = 18.dp
                    )
                )
                .padding(horizontal = 16.dp, vertical = 10.dp)
        ) {
            Text(
                text = text,
                fontSize = 14.sp,
                color = Color.White,
                lineHeight = 20.sp,
                fontWeight = FontWeight.Normal
            )
        }
    }
}

@Composable
fun QuickChipsRow(
    chips: List<String>,
    onChipClick: (String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Wrap chips cleanly
        val rows = chips.chunked(3)
        rows.forEach { rowChips ->
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                rowChips.forEach { chip ->
                    Box(
                        modifier = Modifier
                            .background(Color.White, CircleShape)
                            .border(1.5.dp, Color(0xFF00594C), CircleShape)
                            .clickable { onChipClick(chip) }
                            .padding(horizontal = 14.dp, vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = chip,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF00594C)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun BotTypingIndicator() {
    val infiniteTransition = rememberInfiniteTransition(label = "dots")
    val dot1Alpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dot1"
    )
    val dot2Alpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, delayMillis = 200, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dot2"
    )
    val dot3Alpha by infiniteTransition.animateFloat(
        initialValue = 0.3f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(600, delayMillis = 400, easing = LinearEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "dot3"
    )

    Box(
        modifier = Modifier
            .background(Color.White, RoundedCornerShape(16.dp))
            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(16.dp))
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Row(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(Color(0xFF00594C).copy(alpha = dot1Alpha), CircleShape)
            )
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(Color(0xFF00594C).copy(alpha = dot2Alpha), CircleShape)
            )
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(Color(0xFF00594C).copy(alpha = dot3Alpha), CircleShape)
            )
        }
    }
}
