"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "../../components/SupabaseProvider";

export default function ProfilePage() {
  const { supabase } = useSupabase();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // 🔹 Load logged-in user + profile
  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    // Fetch profile row
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) console.error(error);

    const mergedProfile = {
      ...data,
      email: user.email || data?.email, // fallback
      phone: user.phone || data?.phone,
    };

    setProfile(mergedProfile);

    // Preview avatar
    if (mergedProfile?.avatar_url) {
      setAvatarPreview(mergedProfile.avatar_url);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  // 🔹 Update avatar
  async function uploadAvatar(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${profile.id}-${Date.now()}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (uploadErr) {
      alert("Failed to upload photo");
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", profile.id);

    setAvatarPreview(publicUrl);
  }

  // 🔹 Update profile fields
  async function updateProfile(e: any) {
    e.preventDefault();
    setLoading(true);

    const updates = {
      full_name: e.target.full_name.value,
      bio: e.target.bio.value,
      city: e.target.city.value,
      email: profile.email,
      phone: profile.phone,
    };

    await supabase.from("profiles").update(updates).eq("id", profile.id);

    alert("Profile updated!");
    setLoading(false);
  }

  if (loading) {
    return <p className="text-center mt-20">Loading Profile...</p>;
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-6 space-y-6">

      {/* ---------- Avatar + Basic ---------- */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20">
          <img
            src={avatarPreview || "/default-avatar.png"}
            className="w-20 h-20 rounded-full border object-cover"
          />
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={uploadAvatar}
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold">
            {profile.full_name || "New User"}
          </h2>
          <p className="text-sm text-slate-500">{profile.email || "No email"}</p>
        </div>
      </div>

      {/* ---------- Edit Profile Form ---------- */}
      <form
        onSubmit={updateProfile}
        className="space-y-4 bg-white p-5 rounded-xl shadow"
      >
        {/* Full Name */}
        <div>
          <label className="font-semibold">Full Name</label>
          <input
            type="text"
            name="full_name"
            defaultValue={profile.full_name || ""}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        {/* Bio */}
        <div>
          <label className="font-semibold">About You</label>
          <textarea
            name="bio"
            rows={3}
            defaultValue={profile.bio || ""}
            className="w-full border p-2 rounded-lg"
            placeholder="Write something about yourself..."
          />
        </div>

        {/* City */}
        <div>
          <label className="font-semibold">City</label>
          <input
            type="text"
            name="city"
            defaultValue={profile.city || ""}
            className="w-full border p-2 rounded-lg"
            placeholder="Chennai, Coimbatore, etc."
          />
        </div>

        {/* Private Fields */}
        <div className="bg-slate-50 p-3 rounded-lg text-sm border">
          <p className="text-slate-600 font-semibold">Private Information</p>
          <p>Email: {profile.email || "-"}</p>
          <p>Phone: {profile.phone || "-"}</p>
        </div>

        <button className="w-full bg-black text-white py-3 rounded-xl font-semibold">
          Save Changes
        </button>
      </form>
    </div>
  );
}
