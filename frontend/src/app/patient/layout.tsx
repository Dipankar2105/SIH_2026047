import React from "react";
import { PatientProvider } from "@/context/PatientContext";

export const metadata = {
  title: "AarogyaFlow - Patient Portal",
  description: "Ayushman Bharat Digital Mission (ABDM) Patient Mobile Application",
};

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PatientProvider>{children}</PatientProvider>;
}
