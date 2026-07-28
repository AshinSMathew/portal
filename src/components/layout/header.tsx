"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, Menu, X, LogOut, ArrowUpRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { signOut } from "@/lib/auth-client";
import { fetchProfilePoints } from "@/lib/profile-cache";

interface NavItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface HeaderProps {
  items?: NavItem[];
  role?: string;
}

const DEFAULT_ICONS: Record<string, { bg: string; icon: string }> = {
  Home: { bg: "bg-[#E52600]", icon: "/illustrations/Home.svg" },
  Dashboard: { bg: "bg-[#E52600]", icon: "/illustrations/Home.svg" },
  Events: { bg: "bg-[#1D60C8]", icon: "/illustrations/File.png" },
  Leaderboard: { bg: "bg-[#CE322D]", icon: "/illustrations/Hash.svg" },
  Certificates: { bg: "bg-[#20A300]", icon: "/illustrations/File.png" },
  Badges: { bg: "bg-[#EAA100]", icon: "/illustrations/Trello.svg" },
  Projects: { bg: "bg-[#10B981]", icon: "/illustrations/File.png" },
  Profile: { bg: "bg-[#F59E0B]", icon: "/illustrations/User.svg" },
};

export function Header({ items = [], role = "user" }: HeaderProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const [points, setPoints] = useState<number | null>(null);

  const name = session?.user?.name || "User";
  const userRole = ((session?.user as Record<string, unknown>)?.role as string) || role;
  const execomRoles = [
    "ceo", "cto", "to", "cfo", "fo", "cco", "co", "cio", "io", "cmo", "mo", "coo", "oo", "cso", "so", "cvo", "vo", "cwit", "wit"
  ];
  const isExecom = execomRoles.includes(userRole || "");
  const roleDisplay = isExecom ? (userRole || "").toUpperCase() : "";

  useEffect(() => {
    if (session?.user && (userRole === "student" || isExecom)) {
      fetchProfilePoints().then((pts) => {
        if (pts !== null) setPoints(pts);
      });
    }
  }, [session, userRole, isExecom]);

  const initials = name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/auth/login");
            router.refresh();
          },
        },
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <>
      <header className="flex items-center justify-between px-4 md:px-8 py-4 bg-[#F6F5F3]/80 backdrop-blur-xl border-b border-[#EAE3D2]/40 sticky top-0 z-30 font-sans" style={{ fontFamily: '"Hanken Grotesk", sans-serif' }}>
        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden p-2.5 rounded-full bg-[#130D0D] text-white hover:bg-[#2B2B2B] transition-colors shrink-0 mr-2 shadow-md"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="hidden md:flex items-center relative w-full max-w-sm">
          <Search className="absolute left-3 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search events, students..."
            className="pl-10 bg-[#FAF6EE]/60 border border-[#EAE3D2]/50 focus-visible:ring-1 focus-visible:ring-[#1A1A2E] rounded-xl h-10"
          />
        </div>

        {/* Mobile Title / Logo */}
        <div className="md:hidden flex-1 text-left flex items-center gap-2.5">
          <div className="w-8 h-8 flex items-center justify-center shrink-0">
            <svg
              width="36"
              height="36"
              viewBox="0 0 62 62"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full object-contain"
            >
              <path
                d="M48.7472 15.5221C48.9006 15.4759 49.243 15.4996 49.3676 15.6172C49.9526 16.1695 49.2689 17.8819 49.1014 18.5477L47.6603 24.2642L43.3148 41.4147L41.8745 47.0892C41.561 48.3355 41.2832 49.6725 40.8514 50.8489C40.719 51.2095 40.3312 51.1979 40.088 51.064C39.1097 50.5252 38.1595 49.7994 37.2235 49.1439L33.3257 46.4493L30.8246 44.7193C30.3977 44.4242 29.6131 43.9066 29.2458 43.5501C28.5733 44.4294 23.8124 50.8697 23.4258 51.042C23.2122 51.1373 22.9655 51.1743 22.7565 51.038C22.6496 50.9684 22.5791 50.8745 22.527 50.7349C22.3262 50.1969 22.2105 49.5157 22.0647 48.943C21.5745 47.0177 21.1515 45.0621 20.6724 43.1328C20.2592 41.6379 19.9445 40.0455 19.5405 38.534C19.3538 37.8353 19.2616 37.2829 19.0231 36.578C18.5843 36.1374 17.2869 35.2728 16.7506 34.8984L10.9464 30.8667C10.3755 30.4679 8.03924 28.9507 7.7703 28.4571C7.72845 27.996 7.74394 27.8446 7.88698 27.4197C8.28276 27.1194 9.19582 26.9419 9.67419 26.8019L12.968 25.8514L29.6799 21.0286L42.5995 17.2844C44.3978 16.765 46.2029 16.2193 47.9985 15.6812C48.2357 15.6101 48.5044 15.5638 48.7472 15.5221Z"
                fill="#E60B09"
              />
              <path
                d="M44.9092 18.5977L44.9504 18.6346C44.8928 18.77 40.0524 23.6186 39.6181 24.0551L29.1009 34.7017C28.4585 35.3546 25.3801 38.2187 25.0457 38.9905C24.6286 39.953 24.1935 43.0464 23.9038 44.2644C23.6835 45.1904 23.2664 47.07 23.1779 48.0477C22.9843 47.0361 22.6395 45.9477 22.4175 44.8417C22.0371 43.0329 21.4575 40.988 21.0567 39.1483C20.8761 38.319 20.4136 36.174 20.1504 35.459C21.1541 34.6847 22.3576 33.8985 23.3962 33.1924L28.7701 29.5491L44.9092 18.5977Z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-base font-semibold tracking-tight text-[#1A1A2E]">IEDC Portal</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Points display */}
          {points !== null && (
            <div className="bg-[#1A1A2E] text-[#FBF5E8] px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 border border-[#1A1A2E]/10 shrink-0">
              <span className="opacity-90">✨</span>
              <span>{points} pts</span>
            </div>
          )}

          {/* Execom role display */}
          {roleDisplay && (
            <div className="bg-[#D8615C] text-white px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider shadow-sm border border-[#D8615C]/15 shrink-0">
              👑 {roleDisplay}
            </div>
          )}

          <Link href={`/${role === "user" ? "student" : role}/profile`} className="shrink-0">
            <Avatar className="h-9 w-9 bg-[#1A1A2E] cursor-pointer ring-2 ring-[#1A1A2E]/10">
              {session?.user?.image && (
                <AvatarImage src={session.user.image} alt={name} className="object-cover" />
              )}
              <AvatarFallback className="bg-[#1A1A2E] text-[#FBF5E8] text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </header>

      {/* Side Panel Drawer for Mobile (Matching Sidebar Figma Specs) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-start font-sans md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content (Width 305px, Dark Gradient Background) */}
          <div
            className="relative w-[305px] max-w-[85vw] h-full bg-[#0F0A0A] text-white shadow-2xl z-10 flex flex-col justify-between p-6 overflow-y-auto border-r border-[#2B2B2B]"
            style={{
              background: "linear-gradient(182deg, #0F0A0A 0%, #000000 100%)",
              fontFamily: '"Hanken Grotesk", sans-serif',
            }}
          >
            {/* Top Row: Logo + Close Button */}
            <div className="space-y-6">
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                    <svg
                      width="42"
                      height="42"
                      viewBox="0 0 62 62"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full object-contain"
                    >
                      <path
                        d="M48.7472 15.5221C48.9006 15.4759 49.243 15.4996 49.3676 15.6172C49.9526 16.1695 49.2689 17.8819 49.1014 18.5477L47.6603 24.2642L43.3148 41.4147L41.8745 47.0892C41.561 48.3355 41.2832 49.6725 40.8514 50.8489C40.719 51.2095 40.3312 51.1979 40.088 51.064C39.1097 50.5252 38.1595 49.7994 37.2235 49.1439L33.3257 46.4493L30.8246 44.7193C30.3977 44.4242 29.6131 43.9066 29.2458 43.5501C28.5733 44.4294 23.8124 50.8697 23.4258 51.042C23.2122 51.1373 22.9655 51.1743 22.7565 51.038C22.6496 50.9684 22.5791 50.8745 22.527 50.7349C22.3262 50.1969 22.2105 49.5157 22.0647 48.943C21.5745 47.0177 21.1515 45.0621 20.6724 43.1328C20.2592 41.6379 19.9445 40.0455 19.5405 38.534C19.3538 37.8353 19.2616 37.2829 19.0231 36.578C18.5843 36.1374 17.2869 35.2728 16.7506 34.8984L10.9464 30.8667C10.3755 30.4679 8.03924 28.9507 7.7703 28.4571C7.72845 27.996 7.74394 27.8446 7.88698 27.4197C8.28276 27.1194 9.19582 26.9419 9.67419 26.8019L12.968 25.8514L29.6799 21.0286L42.5995 17.2844C44.3978 16.765 46.2029 16.2193 47.9985 15.6812C48.2357 15.6101 48.5044 15.5638 48.7472 15.5221Z"
                        fill="#E60B09"
                      />
                      <path
                        d="M44.9092 18.5977L44.9504 18.6346C44.8928 18.77 40.0524 23.6186 39.6181 24.0551L29.1009 34.7017C28.4585 35.3546 25.3801 38.2187 25.0457 38.9905C24.6286 39.953 24.1935 43.0464 23.9038 44.2644C23.6835 45.1904 23.2664 47.07 23.1779 48.0477C22.9843 47.0361 22.6395 45.9477 22.4175 44.8417C22.0371 43.0329 21.4575 40.988 21.0567 39.1483C20.8761 38.319 20.4136 36.174 20.1504 35.459C21.1541 34.6847 22.3576 33.8985 23.3962 33.1924L28.7701 29.5491L44.9092 18.5977Z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <div className="flex flex-col leading-none">
                    <span
                      className="text-2xl font-semibold tracking-[-1.154px] text-white leading-[94.051%]"
                      style={{ fontFamily: '"Hanken Grotesk", sans-serif' }}
                    >
                      IEDC
                    </span>
                    <span
                      className="text-[11px] font-semibold tracking-[-0.353px] text-white leading-[94.051%]"
                      style={{ fontFamily: '"Hanken Grotesk", sans-serif' }}
                    >
                      PORTAL
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Main Menu Label */}
              <div className="pt-2">
                <span
                  className="text-white text-[15px] font-normal tracking-[-0.45px]"
                  style={{ fontFamily: '"Hanken Grotesk", sans-serif' }}
                >
                  Main Menu
                </span>
              </div>

              {/* Drawer Nav links */}
              {items.length > 0 && (
                <nav className="space-y-2.5">
                  {items.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                    const iconConfig = DEFAULT_ICONS[item.label] || { bg: "bg-[#EB594C]", icon: "/illustrations/File.png" };

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3.5 h-[49px] px-[18px] rounded-[30px] transition-all duration-200",
                          isActive
                            ? "bg-white/10 text-white font-semibold shadow-md"
                            : "bg-black border border-[#2B2B2B] text-white/80 hover:text-white hover:border-white/30"
                        )}
                      >
                        <div className={cn("w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm", iconConfig.bg)}>
                          <Image
                            src={iconConfig.icon}
                            alt={item.label}
                            width={14}
                            height={14}
                            className="object-contain"
                          />
                        </div>
                        <span className="text-base font-medium tracking-[-0.4px]" style={{ fontFamily: '"Hanken Grotesk", sans-serif' }}>
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
              )}
            </div>

            {/* Drawer User & Sign Out Section */}
            <div className="pt-6 pb-2 border-t border-[#2B2B2B] space-y-3">
              {session?.user && (
                <div className="flex items-center gap-3 p-3.5 rounded-[24px] bg-[#140A0A] border border-[#EB594C]/30 shadow-lg">
                  <div className="h-10 w-10 rounded-full bg-[#EB594C] flex items-center justify-center shrink-0 overflow-hidden text-white font-bold text-sm shadow-md">
                    {session.user.image ? (
                      <img src={session.user.image} alt={name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate text-white leading-tight">{name}</p>
                    <div className="flex flex-wrap items-center gap-1 mt-1">
                      {roleDisplay && (
                        <span className="text-[10px] font-bold text-[#EB594C] bg-[#EB594C]/15 px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {roleDisplay}
                        </span>
                      )}
                      {points !== null && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                          ✨ {points} pts
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  setIsOpen(false);
                  handleSignOut();
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-full text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all duration-200 w-full"
              >
                <LogOut className="w-5 h-5 shrink-0" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}