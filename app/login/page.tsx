"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  async function sendOTP() {
    const { error } = await supabase.auth.signInWithOtp({
      phone: phone,
    });

    if (error) {
      alert(error.message);
    } else {
      setOtpSent(true);
    }
  }

  async function verifyOTP() {
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: "sms",
    });

    if (error) {
      alert(error.message);
    } else {
      window.location.href = "/profile";
    }
  }

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">Login with Phone</h1>

      {!otpSent ? (
        <>
          <input
            type="text"
            className="w-full border p-2 rounded-lg"
            placeholder="Enter Phone Number"
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            onClick={sendOTP}
            className="w-full bg-black text-white p-3 rounded-lg"
          >
            Send OTP
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            className="w-full border p-2 rounded-lg"
            placeholder="Enter OTP"
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            onClick={verifyOTP}
            className="w-full bg-indigo-600 text-white p-3 rounded-lg"
          >
            Verify OTP
          </button>
        </>
      )}
    </div>
  );
}
