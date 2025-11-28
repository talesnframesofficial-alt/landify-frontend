"use client";

import { useState } from "react";
import { useSupabase } from "@/components/SupabaseProvider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { supabase } = useSupabase();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  // -----------------------
  // FORMAT PHONE TO +91
  // -----------------------
  function formatPhone(input: string) {
    let cleaned = input.replace(/\D/g, "");
    if (!cleaned.startsWith("91")) cleaned = "91" + cleaned;
    return "+" + cleaned;
  }

  // -----------------------
  // SEND OTP
  // -----------------------
  async function sendOTP() {
    if (phone.length < 10) {
      alert("Enter your 10-digit mobile number");
      return;
    }

    const formatted = formatPhone(phone);

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      phone: formatted,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    setOtpSent(true);
  }

  // -----------------------
  // VERIFY OTP
  // -----------------------
  async function verifyOTP() {
    if (otp.length < 4) {
      alert("Enter valid OTP");
      return;
    }

    const formatted = formatPhone(phone);

    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token: otp,
      type: "sms",
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // Success → redirect
    router.push("/profile");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">

      <h1 className="text-2xl font-bold mb-6">Login</h1>

      {/* PHONE INPUT */}
      {!otpSent && (
        <div className="w-full max-w-sm space-y-4">
          <label className="font-semibold">Mobile Number</label>

          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border p-3 rounded-lg"
            placeholder="9876543210"
          />

          <button
            onClick={sendOTP}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </div>
      )}

      {/* OTP INPUT */}
      {otpSent && (
        <div className="w-full max-w-sm space-y-4">
          <label className="font-semibold">Enter OTP</label>

          <input
            type="number"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border p-3 rounded-lg text-center tracking-widest text-xl"
            placeholder="123456"
          />

          <button
            onClick={verifyOTP}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            onClick={() => setOtpSent(false)}
            className="w-full text-slate-600 text-sm underline mt-2"
          >
            Edit phone number
          </button>
        </div>
      )}
    </div>
  );
}
