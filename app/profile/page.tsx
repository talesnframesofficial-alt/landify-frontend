"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "../../components/SupabaseProvider";

export default function ProfilePage() {
  const { supabase } = useSupabase();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Load or create profile if missing
  async function loadProfile() {
    setLoading(true);

    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;

    if (!user) {
      window.location.href = "/login";
      return;
    }

    // Fetch profile row
    let { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    // Auto-create missing profile
    if (!profileData) {
      const { data: newProfile } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          full_name: "",
          email: user.email,
          phone: user.phone,
        })
        .select()
        .single();

      profileData = newProfile;
    }

    // Merge user metadata
    const merged = {
      ...profileData,
      email: user.email ?? profileData?.email,
      phone: user.phone ?? profileData?.phone,
    };

    setProfile(merged);

    if (merged.avatar_url) setAvatarPreview(merged.avatar_url);

    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  // Upload avatar
  async function uploadAvatar(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${profile.id}-${Date.now()}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (uploadErr) {
      alert("Upload failed");
      return;
    }

    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    const publicUrl = data.publicUrl;

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl })
      .eq("id", profile.id);

    setAvatarPreview(publicUrl);
  }

  // Update profile fields
  async function updateProfile(e: any) {
    e.preventDefault();
    setLoading(true);

    const updates = {
      full_name: e.target.full_name.value,
      bio: e.target.bio.value,
      city: e.target.city.value,
    };

    await supabase.from("profiles").update(updates).eq("id", profile.id);

    alert("Profile updated!");
    setLoading(false);
  }

  if (loading) return <p className="text-center mt-20">Loading Profile...</p>;

  return (
    <div className="max-w-xl mx-auto px-5 py-6 space-y-6">

      {/* Avatar Section */}
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
          <p className="text-sm text-slate-500">
            {profile.email || "No email"}
          </p>
        </div>
      </div>

      {/* Edit Form */}
      <form
        onSubmit={updateProfile}
        className="space-y-4 bg-white p-5 rounded-xl shadow"
      >
        <div>
          <label className="font-semibold">Full Name</label>
          <input
            type="text"
            name="full_name"
            defaultValue={profile.full_name}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div>
          <label className="font-semibold">About You</label>
          <textarea
            name="bio"
            defaultValue={profile.bio || ""}
            rows={3}
            className="w-full border p-2 rounded-lg"
            placeholder="Tell something about yourself..."
          />
        </div>

        <div>
          <label className="font-semibold">City</label>
          <input
            type="text"
            name="city"
            defaultValue={profile.city || ""}
            className="w-full border p-2 rounded-lg"
            placeholder="Chennai, Bangalore..."
          />
        </div>

        {/* Private section */}
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
