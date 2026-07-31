"use client";

import { Sidebar, execomNavItems } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default function ExecomLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F5F3]">
      <Sidebar items={execomNavItems} role="execom" />
      <div className="md:ml-20 lg:ml-[305px] flex flex-col min-h-screen">
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Header items={execomNavItems} role="execom" />
          {children}
        </main>
      </div>
    </div>
  );
}