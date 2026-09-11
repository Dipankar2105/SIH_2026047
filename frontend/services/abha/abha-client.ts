/**
 * ABHA (Ayushman Bharat Health Account) Client — Patient Web
 *
 * ABHA sandbox is not yet integrated with production credentials.
 * This adapter proxies ABHA requests through the backend identity service
 * to avoid exposing ABHA secrets in the frontend.
 *
 * Backend proxied endpoints:
 *   POST /identity/abha/generate-otp    — send OTP to mobile linked with ABHA
 *   POST /identity/abha/verify-otp      — verify OTP, get ABHA profile
 *   GET  /identity/abha/profile/{abha}  — fetch ABHA linked health profile
 *
 * Mock mode: simulates OTP flow with fixed OTP "123456".
 */

import { patientApiClient, IS_MOCK } from "../api/client";
import type { AbhaProfile } from "../../types/patient";

export interface AbhaOtpRequest {
  abhaNumber?: string;  // 14-digit ABHA number
  mobile?: string;      // Mobile number linked to ABHA
}

export interface AbhaOtpResponse {
  transactionId: string;
  message: string;
  otpSentTo?: string; // masked mobile
}

export interface AbhaVerifyRequest {
  transactionId: string;
  otp: string;
}

export interface AbhaVerifyResponse {
  verified: boolean;
  profile?: AbhaProfile;
  sessionToken?: string;
}

const MOCK_TRANSACTION_ID = "mock-txn-abha-001";

const MOCK_ABHA_PROFILE: AbhaProfile = {
  abhaNumber: "91-1111-2222-3333",
  name: "Demo Patient",
  gender: "M",
  dob: "1993-04-15",
  address: "123 Demo Street, New Delhi",
  mobile: "+91-9876543210",
  email: "demo@aarogyaflow.gov.in",
};

export const abhaClient = {
  /**
   * Step 1: Request OTP to ABHA-linked mobile.
   * Real: POST /identity/abha/generate-otp
   * Mock: returns fake transaction ID, accepts any input.
   */
  async generateOtp(request: AbhaOtpRequest): Promise<AbhaOtpResponse> {
    if (IS_MOCK) {
      return new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              transactionId: MOCK_TRANSACTION_ID,
              message: "OTP sent to registered mobile number",
              otpSentTo: "+91-XXXXXX3210",
            }),
          500
        )
      );
    }

    return await patientApiClient.post<AbhaOtpResponse>("/identity/abha/generate-otp", request);
  },

  /**
   * Step 2: Verify OTP, get ABHA profile.
   * Real: POST /identity/abha/verify-otp
   * Mock: OTP "123456" succeeds, anything else fails.
   */
  async verifyOtp(request: AbhaVerifyRequest): Promise<AbhaVerifyResponse> {
    if (IS_MOCK) {
      return new Promise((resolve) =>
        setTimeout(() => {
          if (request.otp === "123456") {
            resolve({ verified: true, profile: MOCK_ABHA_PROFILE, sessionToken: "mock-abha-token" });
          } else {
            resolve({ verified: false });
          }
        }, 600)
      );
    }

    return await patientApiClient.post<AbhaVerifyResponse>("/identity/abha/verify-otp", request);
  },

  /**
   * Fetch ABHA profile using ABHA number.
   * Real: GET /identity/abha/profile/{abhaNumber}
   */
  async getAbhaProfile(abhaNumber: string): Promise<AbhaProfile | null> {
    if (IS_MOCK) {
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_ABHA_PROFILE), 300));
    }

    try {
      return await patientApiClient.get<AbhaProfile>(
        `/identity/abha/profile/${encodeURIComponent(abhaNumber)}`
      );
    } catch (err) {
      console.warn("ABHA profile fetch failed:", err);
      return null;
    }
  },
};
