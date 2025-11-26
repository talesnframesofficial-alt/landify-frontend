"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "../../components/SupabaseProvider";

export default function ProfilePage() {
  const { supabase } = useSupabase();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  async function loadProfile() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    setProfile({
      ...data,
      email: user.email, // private
      phone: user.phone, // private
    });

    if (data?.avatar_url) {
      setAvatarPreview(data.avatar_url);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadProfile();
  }, []);

  async function updateProfile(e: any) {
    e.preventDefault();
    setLoading(true);

    const full_name = e.target.full_name.value;
    const bio = e.target.bio.value;

    await supabase
      .from("profiles")
      .update({ full_name, bio })
      .eq("id", profile.id);

    alert("Profile updated!");
    setLoading(false);
  }

  async function uploadAvatar(e: any) {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${profile.id}-${Date.now()}`;

    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file);

    if (error) {
      alert("Upload failed");
      return;
    }

    const url = supabase.storage.from("avatars").getPublicUrl(fileName).data?.publicUrl;

    await supabase
      .from("profiles")
      .update({ avatar_url: url })
      .eq("id", profile.id);

    setAvatarPreview(url);
  }

  if (loading) return <p className="text-center mt-20">Loading Profile...</p>;

  return (
    <div className="max-w-xl mx-auto px-5 py-6 space-y-6">

      {/* Avatar */}
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
          <h2 className="text-xl font-semibold">{profile.full_name || "Unnamed User"}</h2>
          <p className="text-sm text-slate-500">{profile.email}</p>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={updateProfile} className="space-y-4 bg-white p-5 rounded-xl shadow">

        <div>
          <label className="font-semibold">Full Name</label>
          <input
            type="text"
            name="full_name"
            defaultValue={profile.full_name || ""}
            className="w-full border p-2 rounded-lg"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="font-semibold">About You</label>
          <textarea
            name="bio"
            className="w-full border p-2 rounded-lg"
            rows={3}
            defaultValue={profile.bio || ""}
            placeholder="A short bio..."
          />
        </div>

        {/* Private fields */}
        <div className="bg-slate-50 p-3 rounded-lg text-sm border">
          <p className="text-slate-600">📌 Private Information (not shown to users):</p>
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
