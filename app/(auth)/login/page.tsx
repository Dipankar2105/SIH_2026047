"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PillInput } from "@/components/ui/PillInput";
import { ContinueButton } from "@/components/ui/ContinueButton";
import { Checkbox } from "@/components/ui/Checkbox";
import { useAuth } from "@/providers/auth-provider";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [hprId, setHprId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ hprId?: string; password?: string }>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const validate = () => {
    const newErrors: { hprId?: string; password?: string } = {};
    if (!hprId.trim()) {
      newErrors.hprId = "HPR ID is required";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({
        hprId: hprId.trim(),
        password: password.trim(),
        rememberMe,
      });
      router.push("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setApiError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full flex flex-col lg:flex-row">
      {/* Left Clinical Hero Panel */}
      <section
        className="w-full lg:w-[48%] xl:w-[46%] bg-brand-700 text-white flex flex-col p-6 sm:p-8 lg:p-10 relative overflow-hidden shadow-2xl shrink-0"
        data-purpose="brand-presentation-panel"
      >
        {/* Decorative background glows */}
        <div
          aria-hidden="true"
          className="absolute -top-20 -left-20 w-80 h-80 bg-brand-600/20 rounded-full blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 w-72 h-72 bg-brand-900/40 rounded-full blur-2xl pointer-events-none"
        />

        {/* Top Branding */}
        <div className="relative z-10" data-purpose="left-brand-header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-brand-accent shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">
                  AarogyaFlow
                </h1>
                <p className="text-[9px] font-semibold tracking-widest text-brand-100/90 uppercase">
                  Clinical Edition
                </p>
              </div>
            </div>
            {/* HPR Validated badge */}
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-brand-900/60 border border-brand-400/30 text-brand-100">
              <svg
                className="w-3 h-3 text-brand-accent"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  fillRule="evenodd"
                />
              </svg>
              HPR Validated
            </span>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 py-4 space-y-5">
          {/* Doctor Image */}
          <div data-purpose="hero-image" className="relative group rounded-2xl overflow-hidden shadow-xl border border-white/15 bg-brand-900/40 max-w-lg mx-auto w-full shrink-0">
            <Image
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBA1kw4MuDptQ-ejJ5UoH8acyGde1P1vELIpuWuTGHB_00ztS082DTdhekdpCs4MjvB6htCqf6p1GE9JFDihkrpWj1KqY7NPdgKgHU2NPddkLwD3wv628pksqFDQMjygZD0r-Piy54YvHw6Ids6dT_Qz269_g8BW01dWjtzrhP3I3sj7PUfR4CDIaRvqv528wl1LctC29AeHdrZy_-LJOMW7rPL25T0datu9tmWD0jF5kJ1wNJ5Yf4"
              alt="Two professional Indian doctors in white lab coats"
              width={600}
              height={400}
              className="w-full h-40 sm:h-48 object-cover object-top filter brightness-[1.02] contrast-[1.02] transform transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-[11px] text-brand-100 font-medium">
              <span className="flex items-center gap-1.5 backdrop-blur-md bg-brand-900/60 px-2 py-0.5 rounded-md border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                OPD Session Live
              </span>
              <span className="backdrop-blur-md bg-brand-900/60 px-2 py-0.5 rounded-md border border-white/10 text-brand-200">
                Verified Clinical Staff
              </span>
            </div>
          </div>

          {/* Headline & Description */}
          <div data-purpose="left-content-text" className="space-y-2 pt-1">
            <h2 data-purpose="left-headline" className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
              Your clinical workspace, structured and ready.
            </h2>
            <p data-purpose="left-description" className="text-xs sm:text-sm text-brand-100/90 leading-relaxed font-normal">
              AarogyaFlow brings structured patient history to your consultation
              before the patient walks in — reducing OPD burden and enabling
              focused clinical decision-making.
            </p>
          </div>

          {/* Feature Badges */}
          <div data-purpose="feature-list" className="pt-1 space-y-2">
            {[
              "AI-structured patient intake — verified before consultation",
              "Voice, touch & multilingual patient interaction",
              "ABHA health record integration",
              "Supports Modern Medicine & AYUSH consultations",
            ].map((feature) => (
              <div
                key={feature}
                className="flex items-center gap-2.5 text-xs sm:text-sm text-brand-50"
              >
                <span className="flex-shrink-0 w-4 h-4 rounded-full bg-brand-400/20 border border-brand-300/40 flex items-center justify-center text-brand-accent">
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </span>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Compliance Footnote */}
        <div data-purpose="brand-footer" className="relative z-10 pt-3 border-t border-brand-600/30 text-[11px] text-brand-200/80 flex items-center justify-between">
          <span>Compliant with ABDM M1, M2 & M3 Standards</span>
          <span className="font-mono text-[10px] text-brand-300">v2.4-PROD</span>
        </div>
      </section>

      {/* Right Sign-In Panel */}
      <section
        className="flex-1 bg-clinical-bg flex flex-col justify-center items-center p-6 sm:p-8 lg:p-10 relative"
        data-purpose="sign-in-panel"
      >
        <div className="w-full mx-auto space-y-5 max-w-lg">
          {/* Header */}
          <header className="space-y-1" data-purpose="form-header">
            <div className="flex items-center gap-2">
              <img src="/logo.svg" alt="AarogyaFlow Logo" className="w-8 h-8 rounded-lg object-contain bg-slate-100 p-0.5 border border-slate-200 shadow-sm" />
              <span className="text-sm font-bold tracking-tight text-brand-700 uppercase">AarogyaFlow</span>
              <span className="text-[9px] tracking-wider text-clinical-muted font-semibold uppercase">· CLINICAL EDITION</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-clinical-text tracking-tight pt-2">
              Doctor Sign In
            </h2>
            <p className="text-xs sm:text-sm text-clinical-muted">
              Access your clinical workspace
            </p>
          </header>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
            data-purpose="doctor-auth-form"
          >
            {/* HPR ID */}
            <PillInput
              id="hprId"
              label={
                <>
                  HPR ID{" "}
                  <span className="text-clinical-muted font-normal lowercase">
                    (healthcare professional ID)
                  </span>
                </>
              }
              type="text"
              placeholder="XX-XXXX-XXXX-XXXX"
              value={hprId}
              onChange={(e) => {
                setHprId(e.target.value.toUpperCase());
                if (errors.hprId) setErrors({ ...errors, hprId: undefined });
              }}
              error={errors.hprId}
              leftIcon={
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                  />
                </svg>
              }
              autoComplete="username"
            />

            {/* Password */}
            <div className="space-y-1.5">
              <label
                className="block text-xs font-semibold text-clinical-text-secondary tracking-wide uppercase"
                htmlFor="password"
              >
                Password
              </label>
              <div className="relative rounded-[var(--radius-pill)] shadow-[var(--shadow-clinical-sm)]">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-clinical-muted">
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password)
                      setErrors({ ...errors, password: undefined });
                  }}
                  className={[
                    "block w-full pl-11 pr-12 py-3 text-sm bg-clinical-surface border border-clinical-border rounded-[var(--radius-pill)]",
                    "text-clinical-text placeholder-clinical-muted",
                    "focus:border-brand-700 focus:ring-2 focus:ring-brand-700/10 transition duration-150",
                    errors.password && "border-status-redflag focus:border-status-redflag",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-clinical-muted hover:text-clinical-text-secondary focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.292-4.292M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-status-redflag font-medium ml-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between pt-0.5">
              <Checkbox
                id="remember-me"
                label="Stay signed in on this device"
                checked={rememberMe}
                onChange={setRememberMe}
              />
              <a
                href="#"
                className="text-xs sm:text-sm font-medium text-brand-700 hover:text-brand-800 hover:underline transition"
              >
                Forgot password?
              </a>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="rounded-[var(--radius-clinical-md)] bg-status-redflag-bg border border-status-redflag-border p-3 text-xs text-status-redflag font-medium">
                {apiError}
              </div>
            )}

            {/* Submit */}
            <div className="pt-1">
              <ContinueButton type="submit" isLoading={isLoading}>
                Continue
              </ContinueButton>
            </div>
          </form>

          {/* Security Callout */}
          <div
            className="rounded-[var(--radius-clinical-md)] bg-clinical-hover border border-clinical-border p-3 flex items-start gap-3"
            data-purpose="security-notice-callout"
          >
            <div className="flex-shrink-0 text-clinical-muted mt-0.5">
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  fillRule="evenodd"
                />
              </svg>
            </div>
            <p className="text-xs text-clinical-text-secondary leading-relaxed">
              Access is restricted to registered clinical staff. For access
              issues or HPR linking, contact your facility administrator.
            </p>
          </div>

          {/* ABDM Footer */}
          <footer
            className="text-center pt-1"
            data-purpose="sign-in-card-footer"
          >
            <p className="text-[11px] text-clinical-muted flex items-center justify-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-status-emerald inline"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  clipRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  fillRule="evenodd"
                />
              </svg>
              <span>
                Integrated with{" "}
                <strong className="text-clinical-text-secondary">Ayushman Bharat Digital Mission (ABDM)</strong>
              </span>
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}
