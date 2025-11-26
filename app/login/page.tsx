"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [phone, setPhone] = useState("+91");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // -----------------------
  // SEND OTP
  // -----------------------
  async function sendOTP() {
    if (!phone || phone.length < 10) {
      alert("Enter a valid phone number");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      phone,
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
    if (!otp || otp.length < 4) {
      alert("Enter the OTP");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    setLoading(false);

    if (error) {
      alert(error.message);
      return;
    }

    // SUCCESS → Redirect to Profile
    router.push("/profile");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-6">Login</h1>

      {/* PHONE INPUT */}
      {!otpSent && (
        <div className="w-full max-w-sm space-y-4">
          <label className="block font-semibold">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border p-3 rounded-lg"
            placeholder="+91 9876543210"
          />

          <button
            onClick={sendOTP}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </div>
      )}

      {/* OTP INPUT */}
      {otpSent && (
        <div className="w-full max-w-sm space-y-4">
          <label className="block font-semibold">Enter OTP</label>
          <input
            type="number"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full border p-3 rounded-lg tracking-widest text-center text-xl"
            placeholder="123456"
          />

          <button
            onClick={verifyOTP}
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}
    </div>
  );
}
