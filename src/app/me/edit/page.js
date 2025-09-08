"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { HiUserCircle } from "react-icons/hi";
import { FiArrowLeft, FiCamera } from "react-icons/fi";

export default function EditProfilePage() {
  const router = useRouter();

  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState("Henry");
  const [email, setEmail] = useState("henry@example.com");
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(URL.createObjectURL(file));
    }
  };

  const handleSave = () => {
    // TODO: connect to backend / API to save profile
    console.log("Profile saved:", { name, email, avatar });
    router.back(); // Return to previous page
  };

  return (
    <main className="bg-[#10141c] min-h-screen p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition"
        >
          <FiArrowLeft size={22} />
        </button>
        <h1 className="text-white text-lg font-bold">Edit Profile</h1>
      </div>

      {/* Avatar */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt="avatar"
              className="w-28 h-28 rounded-full object-cover border-4 border-blue-500/30"
            />
          ) : (
            <HiUserCircle className="w-28 h-28 text-blue-400" />
          )}
          <button
            onClick={() => fileInputRef.current.click()}
            className="absolute bottom-1 right-1 bg-blue-600 p-2 rounded-full shadow-lg hover:bg-blue-700 transition"
          >
            <FiCamera className="text-white" size={16} />
          </button>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Name Field */}
      <div className="mb-5">
        <label className="block text-gray-300 text-sm mb-1">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-[#181d2b] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Email Field */}
      <div className="mb-5">
        <label className="block text-gray-300 text-sm mb-1">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-[#181d2b] text-white rounded-lg px-4 py-2 border border-gray-700 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Save Changes
        </button>
        <button
          onClick={() => router.back()}
          className="flex-1 bg-gray-700 hover:bg-gray-800 text-gray-200 font-semibold py-3 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </main>
  );
}