# AarogyaFlow Mobile App — Development & Build Requirements

This document outlines everything required to develop, package, and deploy the **AarogyaFlow Patient Mobile App** (based on the 19-screen Stitch UI design).

---

## 1. System Prerequisites & Environment

| Tool | Recommended Version | Purpose |
|---|---|---|
| **Node.js** | `>= 18.18.0` or `>= 20.0.0` | JavaScript runtime |
| **npm** / **pnpm** | `npm >= 9.0` or `pnpm >= 8.0` | Package manager |
| **Java JDK** | `OpenJDK 17` or `Oracle JDK 17` | Android build system (Gradle) |
| **Android Studio** | `Hedgehog` / `Iguana` (2023.2+) | Android emulator, SDK manager & APK compiler |
| **Android SDK** | `API Level 34` (Android 14) min `API 26` (Android 8) | Target mobile OS runtime |
| **Xcode** *(Optional for iOS)* | `Xcode 15+` (macOS required) | iOS build, simulator & CocoaPods |

---

## 2. Environment Configuration (`.env`)

Create a `frontend/.env.local` based on the following:

```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1  # Note: 10.0.2.2 for Android Emulator, localhost for web/iOS

# WebSocket Queue URL for live OPD tokens
NEXT_PUBLIC_WS_URL=ws://10.0.2.2:8000/hospital/mock-hospital/queue/ws

# ABDM Gateway / Sandbox Config
NEXT_PUBLIC_ABDM_BASE_URL=https://dev.abdm.gov.in/gateway
NEXT_PUBLIC_ABDM_CLIENT_ID=sbx-aarogyaflow-client
```

---

## 3. Option A: Package as a Native Android / iOS App via Capacitor (Turn-Key)

Because the project is built with standard Next.js, React, and Tailwind CSS in a responsive mobile frame (`max-w-md`), it can be converted directly into an **Android APK/AAB** or **iOS IPA** using **Capacitor**.

### Step 3.1: Install Capacitor in `frontend/`
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/app @capacitor/status-bar
npm install @capacitor/camera @capacitor/filesystem @capacitor/push-notifications
```

### Step 3.2: Initialize Capacitor
```bash
npx cap init AarogyaFlow com.aarogyaflow.patient --web-dir out
```

### Step 3.3: Configure `frontend/next.config.mjs` for Static Mobile Export
For a local standalone app without a Node server:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Produces standalone HTML/JS/CSS in the /out folder
  images: { unoptimized: true },
};
export default nextConfig;
```

### Step 3.4: Build and Sync to Android Project
```bash
npm run build
npx cap add android
npx cap sync
npx cap open android
```
*This will launch Android Studio ready to compile an APK or run on an emulator/connected USB device.*

---

## 4. Hardware & OS Device Permissions

If packaging for Android or iOS, configure the following native permissions:

### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<!-- Network for Backend API & Live Queue WebSocket -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

<!-- Camera for ABHA QR Scanning & Medical Prescription/Report Capture -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-feature android:name="android.hardware.camera" android:required="false" />

<!-- Audio Recording for Voice AI Clinical Intake -->
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />

<!-- Photo & File Storage for Health Records Upload (S14, S15) -->
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />

<!-- Push Notifications for Live Token Queue & Emergency Red-Flag Triage -->
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

### iOS (`ios/App/App/Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>AarogyaFlow requires camera access to scan your ABHA QR code and upload lab reports.</string>
<key>NSMicrophoneUsageDescription</key>
<string>AarogyaFlow requires microphone access for voice-based clinical symptom intake.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>AarogyaFlow requires photo library access to upload prescriptions and medical records.</string>
```

---

## 5. Option B: Native React Native / Expo Architecture (If Re-writing Native)

If you choose to develop a 100% native React Native/Expo app from scratch rather than wrapping Next.js, install the following matching ecosystem packages:

```bash
npx create-expo-app@latest aarogyaflow-native
cd aarogyaflow-native
npx expo install \
  expo-router \
  react-native-safe-area-context \
  react-native-screens \
  lucide-react-native \
  expo-camera \
  expo-image-picker \
  expo-av \
  expo-speech \
  @react-native-async-storage/async-storage
```

### Component Mapping (Web to React Native):
| Web (AarogyaFlow Next.js) | React Native / Expo Equivalent |
|---|---|
| `<MobileContainer>` | `<SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>` |
| `<PatientTopBar>` | Custom header with `<TouchableOpacity>` and `<Text>` |
| `<ChatBubble>` | `<View className="rounded-2xl p-3.5">` with native animations |
| `<AudioListenButton>` | `expo-speech` (`Speech.speak(text, { language: 'hi-IN' })`) |
| `<OtpInputGrid>` | 6-box `<TextInput>` with `ref` forwarding |
| `<UploadCards>` | `expo-image-picker` (`launchImageLibraryAsync`) |
| Icons (`lucide-react`) | `lucide-react-native` |

---

## 6. Backend Integration Requirements

The mobile app expects the following FastAPI endpoints (already structured in `frontend/src/lib/api/patientApi.ts`):

1. **Authentication**:
   - `POST /api/v1/auth/patient/abha/send-otp` — `{ abhaId, mobileNumber }`
   - `POST /api/v1/auth/patient/abha/verify-otp` — `{ txnId, otp, patientId }`
2. **AI Clinical Intake**:
   - `POST /api/v1/clinical-intake/chat` — `{ sessionId, message, language, pathway }`
   - `GET /api/v1/clinical-intake/session/{id}`
3. **ABDM Consent**:
   - `POST /api/v1/abdm/consent/request` — `{ patientId, purposes, hiTypes }`
4. **Health Records**:
   - `GET /api/v1/patients/{id}/records` — List FHIR documents & lab tests
   - `POST /api/v1/patients/{id}/records/upload` — Multipart form (`file`, `title`, `category`)
5. **Live Queue & Appointments**:
   - `GET /api/v1/patients/{id}/appointments`
   - `WebSocket /hospital/{hospitalId}/queue/ws` — Real-time token queue position updates

---

## 7. 19-Screen Stitch UI Reference Map

All 19 screens are mapped to the routes inside `frontend/src/app/patient/`:

| Screen # | Stitch Design Name | App Route |
|---|---|---|
| 1 | Enter your ABHA ID | `/patient/auth/abha` |
| 2 | Verify your mobile number | `/patient/auth/verify-otp` |
| 3 | Your consent matters | `/patient/auth/consent` |
| 4 | Home - AarogyaFlow | `/patient` |
| 5–10 | AI Chatbot & Clinical Intake Steps | `/patient/consult/chat` |
| 11 | Alert - Red Flag Triage | `/patient/consult/triage-alert` |
| 12 | Care Pathway - Choose Diagnostics | `/patient/consult/pathway` |
| 13 | Appointments - AarogyaFlow | `/patient/appointments` |
| 14 | Upload Records - AarogyaFlow | `/patient/records/upload` |
| 15–16| Report Upload & Uploaded Confirmation | `/patient/consult/upload` |
| 17 | My Health Records - AarogyaFlow | `/patient/records` |
| 18 | Saved Success - AarogyaFlow | `/patient/records/success` |
| 19 | Done - Consultation Success | `/patient/consult/success` |
