import { useState } from "react";
import { ArrowRight, Building2, CheckCircle2, LockKeyhole, Mail } from "lucide-react";
import { Btn, Input } from "./ui";
import { loginRequest } from "../lib/api";

const highlights = [
  "Track sales, finance, and site progress in one place",
  "Manage documents, teams, and reporting workflows",
  "Stay aligned with a secure, role-ready dashboard",
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "admin@constructpro.in", password: "Admin@123", remember: true });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (error) setError("");
    if (fieldErrors[key]) {
      setFieldErrors((prev) => ({ ...prev, [key]: "" }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};
    const email = form.email.trim();
    const password = form.password.trim();

    if (!email) {
      nextErrors.email = "Email address is required.";
    } else if (!emailPattern.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters long.";
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      setError("Fix the highlighted fields and try again.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await loginRequest({
        email: form.email.trim(),
        password: form.password,
      });

      if (!response?.success || !response?.data?.token || !response?.data?.user) {
        throw new Error("Invalid login response received from the server.");
      }

      await Promise.resolve(onLogin(response.data, { remember: form.remember }));
    } catch (requestError) {
      const message =
        requestError.response?.data?.message ||
        requestError.response?.data?.error ||
        requestError.message ||
        "Unable to sign in right now. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen bg-neutral-100 lg:grid-cols-[minmax(0,1.1fr)_minmax(420px,520px)]">
      <div className="relative hidden overflow-hidden bg-[blueviolet] lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.1),transparent_30%)]" />
        <div className="relative flex w-full flex-col justify-between p-12 text-white">
          <div>
            <div className="inline-flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-red-700">
                <Building2 size={18} />
              </span>
              ConstructPro
            </div>
            <div className="mt-14 max-w-xl">
              <div className="text-sm font-semibold uppercase tracking-[0.26em] text-red-100/80">Welcome back</div>
              <h1 className="mt-5 text-5xl font-bold leading-tight">Operate every real-estate workflow from one dashboard.</h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-red-50/85">
                Sign in to access the same unified workspace for leads, projects, finance, and reporting.
              </p>
            </div>
          </div>

          <div className="grid gap-4 rounded-3xl border border-white/15 bg-white/8 p-6 backdrop-blur-sm">
            {highlights.map((item) => (
              <div key={item} className="flex items-start gap-3 text-sm leading-6 text-red-50/90">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-white" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
        <div className="w-full max-w-md rounded-[28px] border border-neutral-200 bg-white p-6 shadow-xl shadow-neutral-200/60 sm:p-8">
          <div className="flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blueviolet text-white">
              <Building2 size={18} />
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900">ConstructPro</div>
              <div className="text-xs text-neutral-500">Operations Suite</div>
            </div>
          </div>

          <div className="mt-8 lg:mt-0">
            <div className="text-sm font-semibold uppercase tracking-[0.22em] text-red-700/80">Sign in</div>
            <h2 className="mt-3 text-3xl font-bold text-neutral-900">Access your workspace</h2>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Use your company login to continue into the ConstructPro dashboard.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-neutral-600">
                <Mail size={14} className="text-neutral-400" />
                Email address
              </span>
              <Input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                placeholder="admin@easycolonizer.in"
                autoComplete="email"
                aria-invalid={Boolean(fieldErrors.email)}
                className={`h-12 ${fieldErrors.email ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
              {fieldErrors.email ? <span className="mt-1.5 block text-xs text-red-700">{fieldErrors.email}</span> : null}
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-neutral-600">
                <LockKeyhole size={14} className="text-neutral-400" />
                Password
              </span>
              <Input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={Boolean(fieldErrors.password)}
                className={`h-12 ${fieldErrors.password ? "border-red-300 focus:border-red-400 focus:ring-red-100" : ""}`}
              />
              {fieldErrors.password ? <span className="mt-1.5 block text-xs text-red-700">{fieldErrors.password}</span> : null}
            </label>

            <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(event) => updateField("remember", event.target.checked)}
                  className="h-4 w-4 rounded border-neutral-300 accent-red-700"
                />
                Keep me signed in
              </label>
              <button type="button" className="font-medium text-red-700 transition hover:text-red-800">
                Forgot password?
              </button>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            ) : null}

            <Btn type="submit" className="h-12 w-full justify-center rounded-2xl text-sm font-semibold" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
              <ArrowRight size={16} />
            </Btn>
          </form>

          <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-600">
            Demo access: <span className="font-semibold text-neutral-900">admin@easycolonizer.in</span> / <span className="font-semibold text-neutral-900">password</span>
          </div>
        </div>
      </div>
    </div>
  );
}
