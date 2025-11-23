"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function Login() {
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const sendOtp = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      phone: "+91" + phone,
    });

    if (error) alert(error.message);
    else setOtpSent(true);
  };

  const verifyOtp = async () => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: "+91" + phone,
      token: otp,
      type: "sms",
    });

    if (error) alert(error.message);
    else window.location.href = "/profile";
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Login / Signup</h1>

      {!otpSent ? (
        <div className="space-y-4">
          <input
            className="border p-3 w-full rounded-lg"
            placeholder="Phone number (10 digits)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            className="bg-black text-white w-full p-3 rounded-lg"
            onClick={sendOtp}
          >
            Send OTP
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            className="border p-3 w-full rounded-lg"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          <button
            className="bg-green-600 text-white w-full p-3 rounded-lg"
            onClick={verifyOtp}
          >
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );
}
