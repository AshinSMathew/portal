"use client";

import { Sidebar, coordinatorNavItems } from "@/components/layout/sidebar";
import { MobileNav, coordinatorMobileNav } from "@/components/layout/mobile-nav";
import { Header } from "@/components/layout/header";

export default function CoordinatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F6F5F3]">
      <Sidebar items={coordinatorNavItems} role="coordinator" />
      <div className="md:ml-20 lg:ml-[305px] flex flex-col min-h-screen">
        <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8">
          <Header items={coordinatorNavItems} role="coordinator" />
          {children}
        </main>
      </div>
      <MobileNav items={coordinatorMobileNav} />
    </div>
  );
}