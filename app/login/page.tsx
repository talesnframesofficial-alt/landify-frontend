"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  // 1️⃣ Send OTP
  async function sendOTP() {
    if (!phone) return alert("Enter phone number");

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setOtpSent(true);
    alert("OTP sent to your phone!");
  }

  // 2️⃣ Verify OTP
  async function verifyOTP() {
    if (!otp) return alert("Enter OTP");

    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone,
      token: otp,
      type: "sms",
    });

    if (error) {
      alert(error.message);
      return;
    }

    // Redirect after login
    window.location.href = "/profile";
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-10 bg-white rounded-xl shadow space-y-6">

      <h1 className="text-2xl font-bold text-center">Login</h1>

      {!otpSent && (
        <>
          <input
            type="text"
            placeholder="Phone Number"
            className="w-full border p-3 rounded-lg"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            onClick={sendOTP}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold"
          >
            Send OTP
          </button>
        </>
      )}

      {otpSent && (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            className="w-full border p-3 rounded-lg"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            onClick={verifyOTP}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold"
          >
            Verify & Login
          </button>
        </>
      )}
    </div>
  );
}
