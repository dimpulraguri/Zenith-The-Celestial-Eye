import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZENITH – Sky View | Real-Time Celestial Tracker",
  description:
    "Track the ISS, satellites, planets, and constellations in real time from your location.",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#050816]">
      {children}
    </div>
  );
}
