import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";
import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

const DEFAULT_POSTERS = [
  "/illustrations/Rectangle 1100.png",
  "/illustrations/Rectangle 1101.png",
  "/illustrations/Rectangle 1102(1).png",
  "/illustrations/Rectangle 1103.png",
  "/illustrations/Rectangle 1104.png",
];

export default async function LandingPage() {
  const activeEvents = await db
    .select()
    .from(events)
    .where(
      and(
        eq(events.isDeleted, false),
        inArray(events.status, ["published", "ongoing"])
      )
    )
    .orderBy(desc(events.startDatetime))
    .limit(6);

  return (
    <div className="min-h-screen bg-[#FAF4ED] text-[#130D0D] font-sans selection:bg-[#EB594C] selection:text-white flex flex-col overflow-x-hidden">
      {/* 1. NAVIGATION BAR */}
      <header className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-5 sm:py-6 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#EB594C] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 text-white transform -rotate-12"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M2.5 12a.75.75 0 01.442-.683l18-8.25a.75.75 0 011.002.946l-5 17.25a.75.75 0 01-1.396.126L11.5 14.5l-6.75-2.25A.75.75 0 012.5 12z" />
            </svg>
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl sm:text-2xl font-extrabold tracking-[-0.04em] text-[#000000]">
              IEDC
            </span>
            <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-[#EB594C] uppercase">
              PORTAL
            </span>
          </div>
        </Link>

        <nav className="hidden md:inline-flex items-center gap-6 sm:gap-9 px-6 sm:px-8 py-2.5 rounded-full border border-[#DE5A4F]/40 bg-white/50 backdrop-blur-md shadow-sm">
          <Link
            href="/"
            className="text-sm font-semibold text-[#000000] hover:text-[#EB594C] transition-colors"
          >
            Home
          </Link>
          <Link
            href="/student/events"
            className="text-sm font-semibold text-[#000000] hover:text-[#EB594C] transition-colors"
          >
            Events
          </Link>
          <Link
            href="#features"
            className="text-sm font-semibold text-[#000000] hover:text-[#EB594C] transition-colors"
          >
            What&apos;s this
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/auth/register">
            <Button
              className="rounded-full h-10 sm:h-11 px-5 sm:px-7 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-lg transition-all duration-200 border-none"
              style={{
                background:
                  "radial-gradient(133.5% 127.27% at 48.91% 127.27%, rgba(89, 7, 8, 0.23) 0%, rgba(102, 102, 102, 0.00) 100%), #EB594C",
              }}
            >
              Join the Network
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-4 sm:py-8 space-y-16 sm:space-y-24">
        {/* 2. DUAL HERO SECTION */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-stretch pt-2">
          {/* LEFT HERO CARD (Folder SVG Cut Shape) */}
          <div className="lg:col-span-7 relative min-h-[440px] sm:min-h-[460px] flex flex-col justify-between group overflow-visible">
            <svg
              viewBox="0 0 695 438"
              fill="none"
              className="absolute inset-0 w-full h-full drop-shadow-xl text-[#FF3830]"
              preserveAspectRatio="none"
            >
              <path
                d="M2.2017e-06 43.9507C2.21102e-06 32.2995 9.39966 22.8535 21.0508 22.8666C177.604 23.0421 394.048 25.0519 399.512 25.0519C403.694 25.0519 416.573 11.6284 423.176 4.4335C425.745 1.63397 429.348 -2.99659e-06 433.148 -2.99659e-06L673.325 -2.9966e-06C684.976 -2.9966e-06 694.421 9.44515 694.421 21.0963L694.421 416.213C694.421 427.864 684.976 437.31 673.325 437.31L21.0963 437.31C9.44509 437.31 1.89465e-06 427.864 1.90397e-06 416.213L2.05283e-06 230.082L2.2017e-06 43.9507Z"
                fill="#FF3830"
              />
              <path
                d="M2.2017e-06 43.9507C2.21102e-06 32.2995 9.39966 22.8535 21.0508 22.8666C177.604 23.0421 394.048 25.0519 399.512 25.0519C403.694 25.0519 416.573 11.6284 423.176 4.4335C425.745 1.63397 429.348 -2.99659e-06 433.148 -2.99659e-06L673.325 -2.9966e-06C684.976 -2.9966e-06 694.421 9.44515 694.421 21.0963L694.421 416.213C694.421 427.864 684.976 437.31 673.325 437.31L21.0963 437.31C9.44509 437.31 1.89465e-06 427.864 1.90397e-06 416.213L2.05283e-06 230.082L2.2017e-06 43.9507Z"
                fill="url(#hero_red_grad)"
              />
              <defs>
                <linearGradient
                  id="hero_red_grad"
                  x1="347.211"
                  y1="-200.855"
                  x2="43.9507"
                  y2="903.627"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#666666" stopOpacity="0" />
                  <stop offset="0.716346" stopColor="#DC0605" />
                </linearGradient>
              </defs>
            </svg>

            <div className="relative z-10 p-6 sm:p-10 md:p-12 flex flex-col justify-between h-full text-white min-h-[440px] sm:min-h-[460px]">
              <div className="self-end pt-1 pr-2">
                <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] sm:text-xs font-bold tracking-wider uppercase text-white border border-white/30 shadow-sm">
                  SJCET ONLY
                </span>
              </div>

              <div className="my-auto py-4 space-y-4 max-w-xl">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[66px] font-extrabold leading-[0.92] tracking-[-0.03em] uppercase drop-shadow-sm">
                  GROW YOUR <br />
                  INNOVATION <br />
                  EFFORTLESSLY
                </h1>

                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3">
                  <Link href="/auth/register">
                    <button className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-white text-[#000000] font-bold text-xs sm:text-sm shadow-lg hover:bg-[#FFEDD8] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                      Join the Network
                    </button>
                  </Link>
                  <Link href="/student/events">
                    <button className="px-5 sm:px-7 py-2.5 sm:py-3 rounded-full bg-black/20 hover:bg-black/30 backdrop-blur-md text-white font-semibold text-xs sm:text-sm border border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                      Explore events
                    </button>
                  </Link>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-white/90 font-medium max-w-md pt-3 border-t border-white/20">
                Participate in college events and earn points &amp; certificates
              </p>
            </div>

            <div className="absolute -bottom-8 -right-6 sm:-bottom-10 sm:-right-8 w-36 sm:w-48 md:w-56 aspect-square z-20 pointer-events-none drop-shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
              <Image
                src="/illustrations/Frame 1618873015.png"
                alt="IEDC Paper Plane Badge"
                fill
                sizes="(max-width: 640px) 144px, (max-width: 768px) 192px, 224px"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* RIGHT HERO CARD (Peach/Cream Legacy ID Container) */}
          <div
            className="lg:col-span-5 relative flex flex-col justify-between p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] bg-[#FFEFDE] text-[#130D0D] min-h-[440px] sm:min-h-[460px] overflow-hidden group border border-[#FFE7E7]"
            style={{
              boxShadow: "inset 0 0 35px 0 rgba(241, 40, 55, 0.20)",
            }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold leading-[1.05] tracking-[-0.03em] text-[#633333] z-10">
              More Than Events. <br />
              Build Your Legacy.
            </h2>

            <div className="relative w-full h-[320px] sm:h-[360px] flex items-end justify-center self-center overflow-visible z-0">
              <div className="relative w-[110%] h-[110%] transform translate-x-1 translate-y-3 rotate-3 group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
                <Image
                  src="/illustrations/Frame 1618873004.png"
                  alt="IEDC Student Legacy Card"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-contain object-bottom"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* 3. FEATURE PILL BADGES BAR */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
          <div
            className="flex-1 w-full flex items-center justify-between sm:justify-start gap-4 p-2 sm:p-2.5 pr-6 rounded-full border border-[#FFE7E7] shadow-sm hover:shadow-md transition-all"
            style={{
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(250, 212, 209, 0.85) 100%)",
            }}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E0574C] flex items-center justify-center flex-shrink-0 shadow-sm">
              <div className="relative w-6 h-6 sm:w-7 sm:h-7">
                <Image
                  src="/illustrations/File.png"
                  alt="Get Certificates"
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </div>
            </div>
            <span className="flex-1 text-center md:text-left text-base sm:text-lg font-medium text-[#130D0D]">
              Get Certificates
            </span>
          </div>

          <div
            className="flex-1 w-full flex items-center justify-between sm:justify-start gap-4 p-2 sm:p-2.5 pr-6 rounded-full border border-[#FFE7E7] shadow-sm hover:shadow-md transition-all"
            style={{
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(250, 212, 209, 0.85) 100%)",
            }}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E0574C] flex items-center justify-center flex-shrink-0 shadow-sm">
              <div className="relative w-6 h-6 sm:w-7 sm:h-7">
                <Image
                  src="/illustrations/Trending up.png"
                  alt="Realtime points"
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </div>
            </div>
            <span className="flex-1 text-center md:text-left text-base sm:text-lg font-medium text-[#130D0D]">
              Realtime points
            </span>
          </div>

          <div
            className="flex-1 w-full flex items-center justify-between sm:justify-start gap-4 p-2 sm:p-2.5 pr-6 rounded-full border border-[#FFE7E7] shadow-sm hover:shadow-md transition-all"
            style={{
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(250, 212, 209, 0.85) 100%)",
            }}
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#E0574C] flex items-center justify-center flex-shrink-0 shadow-sm">
              <div className="relative w-6 h-6 sm:w-7 sm:h-7">
                <Image
                  src="/illustrations/Cloud lightning.png"
                  alt="Secure QR Attendance"
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </div>
            </div>
            <span className="flex-1 text-center md:text-left text-base sm:text-lg font-medium text-[#130D0D]">
              Secure QR Attendance
            </span>
          </div>
        </section>

        {/* 4. EVERYTHING YOU NEED IN ONE HUB */}
        <section id="features" className="space-y-12 sm:space-y-16 py-6">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-[-0.04em] text-center text-[#130D0D] leading-tight">
            Everything You Need in One Hub
          </h2>

          {/* 3 Folder Cards - Overlapping Fan Spread */}
          <div className="relative flex items-center justify-center w-full min-h-[380px] sm:min-h-[420px] md:min-h-[460px] lg:min-h-[480px]">
            {/* Card 1: Event Ecosystem (Blue #3964AE Folder SVG) */}
            <div
              className="absolute left-[2%] sm:left-[4%] md:left-[6%] lg:left-[8%] w-[58%] sm:w-[50%] md:w-[44%] lg:w-[38%] aspect-[391/323] group hover:-translate-y-2 transition-all duration-300 z-10"
              style={{ transform: "rotate(-6deg)" }}
            >
              <svg
                viewBox="0 0 391 323"
                fill="none"
                className="absolute inset-0 w-full h-full drop-shadow-xl"
                preserveAspectRatio="none"
              >
                <path
                  d="M340.588 17.8382C340.198 16.1879 340.003 15.3627 339.843 14.8226C336.842 4.63952 327.123 -1.44755 316.651 0.296647C316.096 0.389154 315.288 0.569427 313.672 0.929974C279.063 8.65403 212.711 23.4626 184.165 29.8335C183.355 30.0142 182.95 30.1046 182.548 30.1778C175.256 31.5046 167.812 28.82 163.045 23.1441C162.782 22.831 162.511 22.4815 161.97 21.7825L149.565 5.76493C149.301 5.42356 149.168 5.25287 149.04 5.10001C146.712 2.32821 143.077 1.0172 139.516 1.66516C139.319 1.70089 139.109 1.74792 138.687 1.84197L17.5592 28.8754C16.2497 29.1676 15.5949 29.3138 15.0486 29.4677C4.91853 32.321 -1.44325 42.3383 0.281274 52.7203C0.374283 53.2802 0.520414 53.935 0.812676 55.2445L56.5085 304.8C56.8007 306.109 56.9469 306.764 57.1008 307.31C59.9541 317.44 69.9714 323.802 80.3534 322.078C80.9133 321.985 81.5681 321.839 82.8776 321.546L372.569 256.893C373.879 256.601 374.533 256.454 375.08 256.301C385.21 253.447 391.572 243.43 389.847 233.048C389.754 232.488 389.608 231.833 389.316 230.524L363.175 113.394L340.588 17.8382Z"
                  fill="#3964AE"
                />
              </svg>

              <div className="relative z-10 p-5 sm:p-6 md:p-8 text-white flex flex-col h-full">
                <h3
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium leading-[1.02] tracking-[-0.03em] italic"
                  style={{ transform: "rotate(-10deg)", transformOrigin: "left top" }}
                >
                  Event <br />
                  Ecosystem
                </h3>

                <div className="relative flex-1 w-full mt-2 sm:mt-4 overflow-visible">
                  <Image
                    src="/illustrations/student-laptop-blue.png"
                    alt="Event Ecosystem Student"
                    fill
                    sizes="(max-width: 640px) 58vw, (max-width: 1024px) 44vw, 38vw"
                    className="object-contain object-bottom group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Project Incubator (Green #42A35E Folder SVG) */}
            <div
              className="relative w-[54%] sm:w-[46%] md:w-[40%] lg:w-[36%] aspect-[393/346] group hover:-translate-y-2 transition-all duration-300 z-20"
            >
              <svg
                viewBox="0 0 393 346"
                fill="none"
                className="absolute inset-0 w-full h-full drop-shadow-xl"
                preserveAspectRatio="none"
              >
                <path
                  d="M392.09 68.7684C392.066 66.8115 392.054 65.8331 392.01 65.1847C391.189 52.9609 381.773 43.662 369.54 42.9942C368.891 42.9587 367.936 42.9587 366.025 42.9587C325.103 42.9587 246.648 42.9587 212.895 42.9587C211.937 42.9587 211.458 42.9587 210.987 42.9401C202.44 42.6014 194.731 37.7065 190.788 30.1154C190.571 29.6968 190.354 29.2351 189.92 28.3116L179.975 7.15279C179.763 6.70184 179.657 6.47637 179.551 6.27192C177.626 2.56487 173.861 0.174491 169.687 0.00912258C169.457 2.41148e-06 169.208 2.43682e-06 168.709 2.48751e-06L25.4864 1.70573e-05C23.938 1.72148e-05 23.1638 1.72935e-05 22.5097 0.036011C10.3829 0.703391 0.699585 10.3867 0.0321962 22.5136C-0.00378401 23.1676 -0.003784 23.9418 -0.00378399 25.4902L-0.0037818 320.566C-0.00378179 322.115 -0.00378178 322.889 0.0321984 323.543C0.699587 335.67 10.3829 345.353 22.5097 346.021C23.1638 346.057 23.938 346.057 25.4864 346.057L368.02 346.057C369.568 346.057 370.343 346.057 370.997 346.021C383.124 345.353 392.807 335.67 393.474 323.543C393.51 322.889 393.51 322.115 393.51 320.566L393.51 182.071L392.09 68.7684Z"
                  fill="#42A35E"
                />
              </svg>

              <div className="relative z-10 p-5 sm:p-6 md:p-8 text-white flex flex-col h-full">
                <h3
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium leading-[1.02] tracking-[-0.03em] italic"
                  style={{ transform: "rotate(-2deg)", transformOrigin: "left top" }}
                >
                  Project <br />
                  Incubator
                </h3>

                <div className="relative flex-1 w-full mt-2 sm:mt-4 overflow-visible">
                  <Image
                    src="/illustrations/student-laptop-green.png"
                    alt="Project Incubator Student"
                    fill
                    sizes="(max-width: 640px) 54vw, (max-width: 1024px) 40vw, 36vw"
                    className="object-contain object-bottom group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>

            {/* Card 3: Badges & Leaderboard (Coral Red #EC5A4E Folder SVG) */}
            <div
              className="absolute right-[2%] sm:right-[4%] md:right-[6%] lg:right-[8%] w-[58%] sm:w-[50%] md:w-[44%] lg:w-[38%] aspect-[387/369] group hover:-translate-y-2 transition-all duration-300 z-10"
              style={{ transform: "rotate(6deg)" }}
            >
              <svg
                viewBox="0 0 387 369"
                fill="none"
                className="absolute inset-0 w-full h-full drop-shadow-xl"
                preserveAspectRatio="none"
              >
                <path
                  d="M385.74 140.861C386.158 139.218 386.367 138.396 386.476 137.844C388.531 127.428 382.735 117.533 372.645 114.23C372.11 114.055 371.311 113.841 369.712 113.412C335.46 104.235 269.791 86.6388 241.54 79.0688C240.738 78.854 240.337 78.7466 239.947 78.6253C232.869 76.425 227.514 70.5988 225.917 63.3608C225.829 62.9617 225.751 62.5265 225.595 61.6563L222.016 41.7156C221.939 41.2906 221.901 41.0781 221.858 40.8832C221.078 37.3486 218.463 34.5034 215.007 33.4289C214.816 33.3697 214.608 33.3138 214.19 33.202L94.3113 1.0805C93.0153 0.733229 92.3673 0.559596 91.8118 0.44304C81.5118 -1.71812 71.235 4.21521 67.9566 14.2158C67.7798 14.7552 67.6061 15.4032 67.2589 16.6992L1.0802 263.681C0.732922 264.977 0.559288 265.625 0.442731 266.181C-1.71843 276.481 4.2149 286.758 14.2155 290.036C14.7549 290.213 15.4029 290.387 16.6989 290.734L303.404 367.556C304.7 367.903 305.348 368.077 305.903 368.194C316.203 370.355 326.48 364.421 329.758 354.421C329.935 353.881 330.109 353.233 330.456 351.937L361.517 236.015L385.74 140.861Z"
                  fill="#EC5A4E"
                />
              </svg>

              <div className="relative z-10 p-5 sm:p-6 md:p-8 text-white flex flex-col h-full">
                <h3
                  className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-medium leading-[1.02] tracking-[-0.03em] italic ml-6 sm:ml-12"
                  style={{ transform: "rotate(9deg)", transformOrigin: "left top" }}
                >
                  Badges <br />
                  &amp; Leaderboard
                </h3>

                <div className="relative flex-1 w-full mt-2 sm:mt-4 overflow-visible">
                  <Image
                    src="/illustrations/student-jumping-red.png"
                    alt="Badges and Leaderboard Student"
                    fill
                    sizes="(max-width: 640px) 58vw, (max-width: 1024px) 44vw, 38vw"
                    className="object-contain object-bottom group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto py-8 sm:py-12 text-center px-4">
          <p className="text-2xl sm:text-3xl md:text-[40px] font-medium leading-[1.12] tracking-[-0.03em] text-[#633333]">
            Whether you&apos;re attending workshops, building your first prototype,
            competing in hackathons, or launching a startup, the IEDC Portal
            keeps your entire innovation journey in one place.
          </p>
        </section>

        {/* 6. LATEST EVENTS DARK SECTION */}
        <section className="relative w-full text-white p-6 sm:p-10 md:p-14 space-y-10 sm:space-y-12 pt-14 sm:pt-18 lg:pt-20">
          {/* SVG Background Path for Dark Folder Container */}
          <svg
            viewBox="0 0 1270 650"
            fill="none"
            className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-2xl text-[#0E0909]"
            preserveAspectRatio="none"
          >
            <path
              d="M1265.01 110.202C1264.95 107.651 1264.93 106.376 1264.87 105.646C1263.81 91.7143 1253.36 81.4866 1239.41 80.7293C1238.68 80.6897 1237.52 80.6897 1235.19 80.6897C1123.02 80.6897 726.955 80.6897 648.667 80.6897C647.985 80.6897 647.645 80.6897 647.224 80.6765C639.657 80.4404 632.538 77.0387 627.6 71.3007C627.325 70.9814 627.048 70.638 626.493 69.9512L574.235 5.24405C573.964 4.90865 573.829 4.74094 573.695 4.58502C571.283 1.78291 567.807 0.121741 564.112 0.00642056C563.906 3.51954e-06 563.69 3.5323e-06 563.259 3.55782e-06L28.89 3.51929e-05C27.1351 3.52968e-05 26.2576 3.53487e-05 25.5164 0.0408298C11.7721 0.797223 0.797241 11.7721 0.0407716 25.5164C1.13308e-07 26.2576 1.17094e-07 27.1351 1.24667e-07 28.89L2.68024e-06 621.11C2.68781e-06 622.865 2.6916e-06 623.742 0.0407742 624.484C0.797244 638.228 11.7721 649.203 25.5164 649.959C26.2576 650 27.1351 650 28.89 650L1241.11 650C1242.86 650 1243.74 650 1244.48 649.959C1258.23 649.203 1269.2 638.228 1269.96 624.484C1270 623.742 1270 622.865 1270 621.11L1270 341.985L1265.01 110.202Z"
              fill="#0E0909"
            />
            <path
              d="M1265.01 110.202C1264.95 107.651 1264.93 106.376 1264.87 105.646C1263.81 91.7143 1253.36 81.4866 1239.41 80.7293C1238.68 80.6897 1237.52 80.6897 1235.19 80.6897C1123.02 80.6897 726.955 80.6897 648.667 80.6897C647.985 80.6897 647.645 80.6897 647.224 80.6765C639.657 80.4404 632.538 77.0387 627.6 71.3007C627.325 70.9814 627.048 70.638 626.493 69.9512L574.235 5.24405C573.964 4.90865 573.829 4.74094 573.695 4.58502C571.283 1.78291 567.807 0.121741 564.112 0.00642056C563.906 3.51954e-06 563.69 3.5323e-06 563.259 3.55782e-06L28.89 3.51929e-05C27.1351 3.52968e-05 26.2576 3.53487e-05 25.5164 0.0408298C11.7721 0.797223 0.797241 11.7721 0.0407716 25.5164C1.13308e-07 26.2576 1.17094e-07 27.1351 1.24667e-07 28.89L2.68024e-06 621.11C2.68781e-06 622.865 2.6916e-06 623.742 0.0407742 624.484C0.797244 638.228 11.7721 649.203 25.5164 649.959C26.2576 650 27.1351 650 28.89 650L1241.11 650C1242.86 650 1243.74 650 1244.48 649.959C1258.23 649.203 1269.2 638.228 1269.96 624.484C1270 623.742 1270 622.865 1270 621.11L1270 341.985L1265.01 110.202Z"
              fill="url(#paint0_linear_5_84)"
              fillOpacity="0.5"
            />
            <defs>
              <linearGradient
                id="paint0_linear_5_84"
                x1="635"
                y1="-298.543"
                x2="1010.27"
                y2="1383.14"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#666666" stopOpacity="0" />
                <stop offset="0.716346" stopColor="#DC0605" stopOpacity="0.44" />
              </linearGradient>
            </defs>
          </svg>

          {/* Section Header */}
          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 pt-4 sm:pt-6">
            <h2 className="text-5xl sm:text-7xl lg:text-[88px] font-medium leading-[0.88] tracking-[-0.04em] text-white">
              Latest <br />
              Events
            </h2>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 max-w-xl">
              <span className="hidden sm:inline text-3xl font-light text-white/30">
                //
              </span>
              <p className="text-sm sm:text-base text-[#D5D5D5] font-normal leading-relaxed">
                Whether you&apos;re attending workshops, building your first prototype,
                competing in hackathons, or launching a startup, the IEDC Portal
                keeps your entire innovation journey in one place.
              </p>
            </div>

            <Link href="/student/events" className="flex-shrink-0">
              <button className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white hover:bg-[#FFEDD8] text-black flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-200">
                <ArrowUpRight className="w-7 h-7 sm:w-8 sm:h-8 text-[#0E0909]" />
              </button>
            </Link>
          </div>

          {/* Dynamic Events Cards - Horizontal Scroll */}
          <div className="relative z-10 -mx-6 sm:-mx-10 md:-mx-14 pb-2">
            {activeEvents.length > 0 ? (
              <div className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 px-6 sm:px-10 md:px-14 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {activeEvents.map((event, idx) => {
                  const poster =
                    event.posterUrl || DEFAULT_POSTERS[idx % DEFAULT_POSTERS.length];
                  return (
                    <Link
                      key={event.id}
                      href={`/student/events/${event.id}`}
                      className="group flex-shrink-0 w-[190px] sm:w-[210px] md:w-[230px] flex flex-col gap-3"
                    >
                      <div className="relative w-full aspect-[3/4] drop-shadow-md">
                        <Image
                          src={poster}
                          alt={event.title}
                          fill
                          sizes="(max-width: 640px) 190px, (max-width: 768px) 210px, 230px"
                          className="object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-black flex items-center justify-center shadow-md z-10">
                          <ArrowUpRight className="w-4 h-4 text-[#0E0909]" />
                        </div>
                      </div>
                      <span className="font-mono text-xs text-white/50 font-medium px-1">
                        #event {idx + 1}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="flex gap-5 sm:gap-6 overflow-x-auto pb-4 px-6 sm:px-10 md:px-14 scrollbar-hide" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                {[
                  { id: "1", title: "Tech Workshop & Hackathon", img: "/illustrations/Rectangle 1100.png" },
                  { id: "2", title: "Wednesday Launch", img: "/illustrations/Rectangle 1101.png" },
                  { id: "3", title: "Execom Meetup 2026", img: "/illustrations/Rectangle 1102(1).png" },
                  { id: "4", title: "Entrepreneurial Thinking", img: "/illustrations/Rectangle 1103.png" },
                  { id: "5", title: "Linux Kernel Workshop", img: "/illustrations/Rectangle 1104.png" },
                ].map((item, idx) => (
                  <Link
                    key={item.id}
                    href="/student/events"
                    className="group flex-shrink-0 w-[190px] sm:w-[210px] md:w-[230px] flex flex-col gap-3"
                  >
                    <div className="relative w-full aspect-[3/4] drop-shadow-md">
                      <Image
                        src={item.img}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 190px, (max-width: 768px) 210px, 230px"
                        className="object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-black flex items-center justify-center shadow-md z-10">
                        <ArrowUpRight className="w-4 h-4 text-[#0E0909]" />
                      </div>
                    </div>
                    <span className="font-mono text-xs text-white/50 font-medium px-1">
                      #event {idx + 1}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* 7. FOOTER */}
      <footer className="w-full border-t border-[#DE5A4F]/20 bg-[#FAF4ED] py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col gap-2 max-w-md text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#EB594C] flex items-center justify-center shadow-sm">
                <svg
                  className="w-4 h-4 text-white transform -rotate-12"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M2.5 12a.75.75 0 01.442-.683l18-8.25a.75.75 0 011.002.946l-5 17.25a.75.75 0 01-1.396.126L11.5 14.5l-6.75-2.25A.75.75 0 012.5 12z" />
                </svg>
              </div>
              <span className="text-lg font-extrabold text-[#000000] tracking-tight">
                IEDC PORTAL
              </span>
            </div>
            <p className="text-xs text-[#130D0D]/70 font-medium leading-relaxed">
              Whether you&apos;re attending workshops, building your first prototype,
              competing in hackathons, or launching a startup, the IEDC Portal keeps
              your entire innovation journey in one place.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-[#130D0D]">
            <Link href="/" className="hover:text-[#EB594C] transition-colors">
              Home
            </Link>
            <Link
              href="/student/events"
              className="hover:text-[#EB594C] transition-colors"
            >
              Our Events
            </Link>
            <Link
              href="/student/dashboard"
              className="hover:text-[#EB594C] transition-colors"
            >
              My Dashboard
            </Link>
            <Link
              href="/student/leaderboard"
              className="hover:text-[#EB594C] transition-colors"
            >
              Leaderboard
            </Link>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mt-8 pt-6 border-t border-[#DE5A4F]/10 text-center">
          <p className="text-[11px] font-bold text-[#130D0D]/50 uppercase tracking-widest">
            IEDC 2026 SJCET - TECH TEAM
          </p>
        </div>
      </footer>
    </div>
  );
}