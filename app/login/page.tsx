"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function LoginPage() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [sentTo, setSentTo] = useState("");

  const sendOtp = async () => {
    const fullPhone = "+91" + phone.trim();

    const { data, error } = await supabase.auth.signInWithOtp({
      phone: fullPhone,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setSentTo(fullPhone);
    setStep("otp");
  };

  const verifyOtp = async () => {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: sentTo,
      token: otp,
      type: "sms",
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Login successful!");
    window.location.href = "/profile";
  };

  return (
    <div className="max-w-md mx-auto p-5">
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      {step === "phone" && (
        <div className="space-y-4">
          <label className="block font-medium">Phone Number</label>
          <div className="flex gap-2">
            <span className="p-2 border rounded bg-gray-100">+91</span>
            <input
              type="tel"
              className="border p-2 rounded flex-1"
              placeholder="10-digit number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
              }
            />
          </div>

          <button
            onClick={sendOtp}
            className="w-full bg-black text-white p-3 rounded"
          >
            Send OTP
          </button>
        </div>
      )}

      {step === "otp" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            OTP sent to <strong>{sentTo}</strong>
          </p>

          <label className="block font-medium">Enter OTP</label>
          <input
            type="text"
            className="border p-2 rounded w-full"
            placeholder="6 digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          />

          <button
            onClick={verifyOtp}
            className="w-full bg-indigo-600 text-white p-3 rounded"
          >
            Verify OTP
          </button>
        </div>
      )}
    </div>
  );
}
