"use client";

import { Sidebar, facultyNavItems } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F5F3] font-['Hanken_Grotesk'] text-[#1A0D0C]">
      <Sidebar items={facultyNavItems} role="faculty" />
      <div className="md:ml-20 lg:ml-[305px] flex flex-col min-h-screen">
        <main className="flex-1 p-4 md:p-6 lg:p-8 font-['Hanken_Grotesk']">
          <Header items={facultyNavItems} role="faculty" />
          {children}
        </main>
      </div>
    </div>
  );
}