// src/app/components/Testimonials.js
import React from "react";

const testimonials = [
  {
    id: 1,
    author: "Jane Doe",
    title: "This platform changed my investment game.",
    subtitle: "STAQK gave me all the tools I needed.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    tag: "Investor"
  },
  {
    id: 2,
    author: "Tom Smith",
    title: "Superb trading experience!",
    subtitle: "I finally feel in control of my money.",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg",
    tag: "Pro Trader"
  },
  {
    id: 3,
    author: "Lisa M.",
    title: "Clean UI & advanced tools.",
    subtitle: "Nothing else like it on the market.",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    tag: "Analyst"
  },
  {
    id: 4,
    author: "Musa Okoye",
    title: "Trusted. Fast. Reliable.",
    subtitle: "Perfect for African markets too.",
    avatar: "https://randomuser.me/api/portraits/men/77.jpg",
    tag: "Entrepreneur"
  }
];

export default function Testimonials() {
  return (
    <section className="w-full bg-[#181B23] rounded-xl p-6 my-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold tracking-wide text-gray-200">
          What users are saying
        </h2>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {testimonials.map((t) => (
          <div key={t.id} className="flex gap-4 bg-[#23263a] p-4 rounded-lg shadow-sm">
            <img src={t.avatar} alt={t.author} className="w-14 h-14 rounded-full object-cover"/>
            <div>
              <div className="text-white font-bold">{t.title}</div>
              <div className="text-gray-400 text-sm">{t.subtitle}</div>
              <div className="text-xs mt-2 text-blue-400 font-semibold">{t.author} &middot; {t.tag}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}