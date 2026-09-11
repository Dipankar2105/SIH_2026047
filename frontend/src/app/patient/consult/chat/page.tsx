"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MobileContainer } from "@/components/patient/MobileContainer";
import { PatientTopBar } from "@/components/patient/PatientTopBar";
import { ChatBubble } from "@/components/patient/ChatBubble";
import { ChipButtonGroup } from "@/components/patient/ChipButton";
import { ChatInputBar } from "@/components/patient/ChatInputBar";
import { usePatient } from "@/context/PatientContext";
import { ChatMessage, ChatIntakeStage } from "@/types/patient";
import { sendIntakeMessage } from "@/lib/api/patientApi";

export default function PatientChatConsultPage() {
  const router = useRouter();
  const { patient, language, setRedFlagAlert } = usePatient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState<ChatIntakeStage>("CHIEF_COMPLAINT");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [activeChips, setActiveChips] = useState<string[]>([
    "Fever",
    "Cough",
    "Pain",
    "Stomach problem",
    "Headache",
    "Other/Type",
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "bot",
      text: `Hello ${patient.fullName || "Rahul"} 👋\nLet's understand what you're feeling today.`,
      timestamp: "9:41 AM",
      isAudioAvailable: true,
    },
    {
      id: "m-2",
      sender: "bot",
      text: "What brings you here?",
      timestamp: "9:41 AM",
      isAudioAvailable: true,
    },
  ]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  const handleUserMessage = async (userText: string) => {
    // 1. Post user bubble
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: "Just now",
    };
    setMessages((prev) => [...prev, userMsg]);
    setActiveChips([]);
    setIsAiTyping(true);

    try {
      // 2. Call backend intake service
      const res = await sendIntakeMessage({
        message: userText,
        language,
        step: getStepNumber(stage),
      });

      // Emergency Red-Flag check
      if (res.is_urgent || res.triage_priority === "emergency") {
        setRedFlagAlert({
          patientReportedText: userText,
          triggerKeywords: ["chest pain", "breathing"],
          severity: "emergency",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
        router.push("/patient/consult/triage-alert");
        return;
      }

      // State Machine progression based on current stage
      setTimeout(() => {
        progressStateMachine(userText);
        setIsAiTyping(false);
      }, 600);
    } catch {
      setTimeout(() => {
        progressStateMachine(userText);
        setIsAiTyping(false);
      }, 600);
    }
  };

  const getStepNumber = (s: ChatIntakeStage): number => {
    switch (s) {
      case "CHIEF_COMPLAINT":
        return 0;
      case "PAIN_LOCATION":
        return 1;
      case "PAIN_CHARACTER":
        return 2;
      case "ASSOCIATED_SYMPTOMS":
        return 3;
      case "FINAL_CONFIRMATION":
        return 4;
      default:
        return 0;
    }
  };

  const progressStateMachine = (lastAnswer: string) => {
    switch (stage) {
      case "CHIEF_COMPLAINT": {
        // Transition to Pain Location (Screen 9)
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: "I'm sorry to hear you're not feeling well. Where exactly do you feel the pain?",
          timestamp: "Just now",
          isAudioAvailable: true,
        };
        setMessages((prev) => [...prev, botMsg]);
        setActiveChips([
          "Upper abdomen",
          "Lower abdomen",
          "Around the navel",
          "Right side",
          "Left side",
          "Not sure",
          "Other/Type",
        ]);
        setStage("PAIN_LOCATION");
        break;
      }

      case "PAIN_LOCATION": {
        // Transition to Duration and Character (Screen 7)
        const botMsg1: ChatMessage = {
          id: `bot-${Date.now()}-1`,
          sender: "bot",
          text: "When did the pain start?",
          timestamp: "Just now",
          isAudioAvailable: true,
        };
        setMessages((prev) => [...prev, botMsg1]);
        setActiveChips([
          "Today",
          "Yesterday",
          "A few days ago",
          "More than a week ago",
        ]);
        setStage("PAIN_CHARACTER");
        break;
      }

      case "PAIN_CHARACTER": {
        // Follow-up pain descriptor
        const botMsg2: ChatMessage = {
          id: `bot-${Date.now()}-2`,
          sender: "bot",
          text: "How would you describe the pain?",
          timestamp: "Just now",
          isAudioAvailable: true,
        };
        setMessages((prev) => [...prev, botMsg2]);
        setActiveChips([
          "Sharp / stabbing",
          "Burning",
          "Cramping",
          "Other/Type",
          "Not sure",
        ]);
        setStage("ASSOCIATED_SYMPTOMS");
        break;
      }

      case "ASSOCIATED_SYMPTOMS": {
        // Transition to Associated Symptoms (Screen 8)
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: "bot",
          text: "Have you had any of these with the pain?",
          timestamp: "Just now",
          isAudioAvailable: true,
        };
        setMessages((prev) => [...prev, botMsg]);
        setActiveChips([
          "Nausea",
          "Vomiting",
          "Fever",
          "Loose stools",
          "None of these",
        ]);
        setStage("FINAL_CONFIRMATION");
        break;
      }

      case "FINAL_CONFIRMATION": {
        if (lastAnswer.toLowerCase().includes("no") || lastAnswer.includes("that's all")) {
          // Intake complete! Move to Report Upload (Screen 15)
          router.push("/patient/consult/upload");
        } else {
          // Asks final confirmation question (Screen 8)
          const botMsg: ChatMessage = {
            id: `bot-${Date.now()}`,
            sender: "bot",
            text: "Is there anything else you'd like to tell us?",
            timestamp: "Just now",
            isAudioAvailable: true,
          };
          setMessages((prev) => [...prev, botMsg]);
          setActiveChips(["Yes, add something", "No, that's all"]);
        }
        break;
      }

      default:
        router.push("/patient/consult/upload");
    }
  };

  return (
    <MobileContainer bgClassName="bg-white">
      {/* Top Header */}
      <PatientTopBar
        title="AarogyaFlow"
        subtitle="Health Assistant"
        showBack={true}
        backHref="/patient/consult/pathway"
      />

      {/* Scrollable Chat Message Stream */}
      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-2.5">
        {messages.map((msg) => (
          <ChatBubble
            key={msg.id}
            sender={msg.sender}
            text={msg.text}
            timestamp={msg.timestamp}
            isAudioAvailable={msg.isAudioAvailable}
          />
        ))}

        {/* AI Typing Indicator */}
        {isAiTyping && (
          <div className="flex items-center gap-1.5 px-4 py-3 bg-[#F4FAF8] border border-[#E6F4F1] rounded-2xl rounded-tl-xs w-20">
            <span className="w-2 h-2 rounded-full bg-[#005F4B] animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-[#005F4B] animate-bounce [animation-delay:0.2s]" />
            <span className="w-2 h-2 rounded-full bg-[#005F4B] animate-bounce [animation-delay:0.4s]" />
          </div>
        )}

        {/* Interactive Quick-Choice Chips */}
        {!isAiTyping && activeChips.length > 0 && (
          <div className="pt-2">
            <ChipButtonGroup
              chips={activeChips}
              onSelectChip={(chip) => handleUserMessage(chip)}
            />
          </div>
        )}

        {/* Demo Quick-Trigger for Red-Flag (Screen 10 -> 11) */}
        {stage === "CHIEF_COMPLAINT" && (
          <div className="pt-3 pb-1">
            <button
              type="button"
              onClick={() => handleUserMessage("I am having sharp chest pain on my left side")}
              className="text-[11px] text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-full border border-red-200 transition cursor-pointer"
            >
              ⚡ Test Emergency Red-Flag Trigger (Screen 10/11)
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Dock */}
      <ChatInputBar
        onSendMessage={handleUserMessage}
        disabled={isAiTyping}
      />
    </MobileContainer>
  );
}
