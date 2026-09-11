/** Safety evaluation / red-flag types */

export interface SafetyFlag {
  flagId: string;
  category: "cardiac" | "neurological" | "respiratory" | "abdominal" | "other";
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  recommendedAction: string;
}

export interface SafetyEvaluation {
  sessionId: string;
  patientId: string;
  redFlagDetected: boolean;
  flags: SafetyFlag[];
  overallRisk: "low" | "medium" | "high" | "critical";
  immediateAttentionRequired: boolean;
  evaluatedAt: string;
}
