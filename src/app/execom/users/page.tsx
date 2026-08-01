"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Loader2,
  UserPlus,
  ShieldCheck,
  Users,
  Search,
  Sparkles,
  Mail,
  UserCheck,
  Filter,
  GraduationCap,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface StaffEmail {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

const EXECOM_ROLES_LIST = [
  { value: "ceo", label: "CEO (Chief Executive Officer)", category: "c-suite" },
  { value: "cto", label: "CTO (Chief Technical Officer)", category: "c-suite" },
  { value: "to", label: "TO (Technical Officer)", category: "officer" },
  { value: "cfo", label: "CFO (Chief Finance Officer)", category: "c-suite" },
  { value: "fo", label: "FO (Finance Officer)", category: "officer" },
  { value: "cco", label: "CCO (Chief Creative Officer)", category: "c-suite" },
  { value: "co", label: "CO (Creative Officer)", category: "officer" },
  { value: "cio", label: "CIO (Chief Innovation Officer)", category: "c-suite" },
  { value: "io", label: "IO (Innovation Officer)", category: "officer" },
  { value: "cmo", label: "CMO (Chief Marketing Officer)", category: "c-suite" },
  { value: "mo", label: "MO (Marketing Officer)", category: "officer" },
  { value: "coo", label: "COO (Chief Operations Officer)", category: "c-suite" },
  { value: "oo", label: "OO (Operations Officer)", category: "officer" },
  { value: "cso", label: "CSO (Chief Skills Officer)", category: "c-suite" },
  { value: "so", label: "SO (Skills Officer)", category: "officer" },
  { value: "cvo", label: "CVO (Chief Vibes Officer)", category: "c-suite" },
  { value: "vo", label: "VO (Vibes Officer)", category: "officer" },
  { value: "cwit", label: "CWIT (Chief Women in Tech)", category: "c-suite" },
  { value: "wit", label: "WIT (Women in Tech)", category: "officer" },
];

const FILTER_ITEMS = [
  { key: "all", label: "All Roles" },
  { key: "faculty", label: "Faculty" },
  { key: "c-suite", label: "C-Suite Chiefs" },
  { key: "officer", label: "Executive Officers" },
];

export default function ExecomUsersPage() {
  const [staffEmails, setStaffEmails] = useState<StaffEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      setLoading(true);
      const res = await fetch("/api/users/staff");
      if (res.ok) {
        setStaffEmails(await res.json());
      }
    } catch (err) {
      console.error("Error fetching staff emails:", err);
    } finally {
      setLoading(false);
    }
  }

  async function addStaff(e: React.FormEvent) {
    e.preventDefault();
    setAdding(true);
    setError("");

    try {
      const res = await fetch("/api/users/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim(), role: newRole }),
      });

      if (res.ok) {
        setNewEmail("");
        setNewRole("");
        fetchStaff();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to add staff email");
      }
    } catch {
      setError("Something went wrong while adding staff email");
    } finally {
      setAdding(false);
    }
  }

  const getRoleCategory = (roleValue: string) => {
    if (roleValue === "faculty") return "faculty";
    const found = EXECOM_ROLES_LIST.find((r) => r.value === roleValue);
    return found ? found.category : "officer";
  };

  const getRoleLabel = (roleValue: string) => {
    if (roleValue === "faculty") return "Faculty Member";
    const found = EXECOM_ROLES_LIST.find((r) => r.value === roleValue);
    return found ? found.label : roleValue.toUpperCase();
  };

  const getRoleBadgeStyle = (roleValue: string) => {
    if (roleValue === "faculty") {
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    }
    const cat = getRoleCategory(roleValue);
    if (cat === "c-suite") {
      return "bg-rose-50 text-[#D9383A] border-rose-200/60 font-bold uppercase";
    }
    return "bg-purple-50 text-purple-700 border-purple-200/60 font-semibold";
  };

  // Filtered staff emails
  const filteredStaff = staffEmails.filter((staff) => {
    const matchesSearch =
      staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getRoleLabel(staff.role).toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "all") return true;
    if (activeTab === "faculty") return staff.role === "faculty";
    if (activeTab === "c-suite") return getRoleCategory(staff.role) === "c-suite";
    if (activeTab === "officer") return getRoleCategory(staff.role) === "officer";

    return true;
  });

  const facultyCount = staffEmails.filter((s) => s.role === "faculty").length;
  const cSuiteCount = staffEmails.filter((s) => getRoleCategory(s.role) === "c-suite").length;
  const officerCount = staffEmails.filter((s) => getRoleCategory(s.role) === "officer").length;

  return (
    <div className="w-full space-y-6 font-['Hanken_Grotesk'] text-[#1A0D0C] pb-16">
      <div className="w-full max-w-[1014px] min-h-[200px] rounded-[38px] bg-white p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center relative overflow-hidden shadow-sm border border-gray-100/80 my-8 gap-6 group">
        <div className="z-10 max-w-xl space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-0.5 rounded-full bg-[#D9383A]/10 text-[#D9383A] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Execom Governance
            </span>
          </div>
          <h1 className="text-[36px] md:text-[46px] font-semibold text-[#1A0D0C] tracking-[-1.38px] leading-tight">
            User Whitelist Management
          </h1>
          <p className="text-[16px] md:text-[20px] font-semibold text-[#B0B0B0] tracking-[-0.6px] leading-snug">
            Manage staff email whitelist, assign executive roles, and control platform access.
          </p>
        </div>

        <div className="z-10 flex items-center gap-3">
          <div className="bg-[#100A0A] text-white px-5 py-3 rounded-[31px] text-sm font-medium flex items-center gap-2.5 shadow-sm shrink-0">
            <Users className="w-4 h-4 text-[#D9383A]" />
            <span>{loading ? "..." : `${staffEmails.length} Whitelisted Staff`}</span>
          </div>
        </div>

        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-[#D9383A]/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-[1014px] bg-white rounded-[38px] border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#D9383A] flex items-center justify-center font-bold shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-[#1A0D0C] tracking-tight">
              Add Whitelisted Staff Email
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Authorize institutional email addresses for faculty and Execom leadership roles
            </p>
          </div>
        </div>

        <form onSubmit={addStaff} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 space-y-2">
              <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                Institutional Email
              </Label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-3.5 text-gray-400 pointer-events-none" />
                <Input
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="h-[50px] rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#D9383A] focus:ring-1 focus:ring-[#D9383A] text-sm text-[#1A0D0C] transition-all pl-11 pr-4"
                  placeholder="staff@college.edu.in"
                  type="email"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-4 space-y-2">
              <Label className="text-xs font-bold text-gray-700 uppercase tracking-wider ml-1">
                Designated Role
              </Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="h-[50px] rounded-2xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-[#D9383A] text-sm text-[#1A0D0C] transition-all px-4">
                  <SelectValue placeholder="Select assigned role" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl max-h-72">
                  <SelectGroup>
                    <SelectLabel className="text-xs font-bold text-emerald-600 px-3 py-1">
                      Faculty Leadership
                    </SelectLabel>
                    <SelectItem value="faculty" className="rounded-xl cursor-pointer">
                      Faculty
                    </SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="text-xs font-bold text-[#D9383A] px-3 py-1 mt-1">
                      C-Suite Chiefs
                    </SelectLabel>
                    {EXECOM_ROLES_LIST.filter((r) => r.category === "c-suite").map((r) => (
                      <SelectItem key={r.value} value={r.value} className="rounded-xl cursor-pointer">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel className="text-xs font-bold text-purple-600 px-3 py-1 mt-1">
                      Executive Officers
                    </SelectLabel>
                    {EXECOM_ROLES_LIST.filter((r) => r.category === "officer").map((r) => (
                      <SelectItem key={r.value} value={r.value} className="rounded-xl cursor-pointer">
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-3">
              <Button
                type="submit"
                disabled={adding || !newRole || !newEmail}
                suppressHydrationWarning
                className="h-[50px] w-full rounded-[31px] bg-[#100A0A] hover:bg-[#2A2020] active:scale-98 text-white font-medium text-sm tracking-tight transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#D9383A]" />
                    <span>Whitelisting...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-[#D9383A]" />
                    <span>Add to Whitelist</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-red-50 border border-red-100 text-xs font-medium text-red-600 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
              {error}
            </div>
          )}
        </form>
      </div>

      <div className="max-w-[1014px] bg-white rounded-[38px] border border-gray-100 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
          <div>
            <h2 className="text-2xl font-bold text-[#1A0D0C] tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#D9383A]" /> Authorized Staff Roster
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live index of all staff accounts permitted to register and access Execom capabilities
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[42px] bg-gray-50/60 border border-gray-200 rounded-2xl pl-10 pr-4 text-xs text-[#1A0D0C] placeholder-gray-400 focus:outline-none focus:border-[#D9383A] focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {FILTER_ITEMS.map((item) => {
              const isActive = activeTab === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={cn(
                    "inline-flex items-center justify-center px-4 py-1.5 rounded-[26.92px] border text-[12px] font-normal tracking-[-0.39px] whitespace-nowrap transition-all duration-200 cursor-pointer h-[34px]",
                    isActive
                      ? "bg-[#100A0A] border-[#A5A5A5] text-white shadow-sm"
                      : "bg-[#E2E2E2] border-[#A5A5A5] text-[#3C3C3C] hover:bg-gray-200"
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4 text-xs font-medium text-gray-500 px-2">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" /> {facultyCount} Faculty
            </span>
            <span className="h-3 w-px bg-gray-200" />
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#D9383A]" /> {cSuiteCount} Chiefs
            </span>
            <span className="h-3 w-px bg-gray-200" />
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-purple-600" /> {officerCount} Officers
            </span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 pt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-[24px] animate-pulse" />
            ))}
          </div>
        ) : filteredStaff.length > 0 ? (
          <div className="space-y-3 pt-2">
            {filteredStaff.map((staff) => {
              const roleLabel = getRoleLabel(staff.role);
              const badgeStyle = getRoleBadgeStyle(staff.role);
              return (
                <div
                  key={staff.id}
                  className="p-4 sm:p-5 rounded-[24px] border border-gray-100/90 hover:border-gray-300 hover:bg-gray-50/60 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm group-hover:bg-[#100A0A] group-hover:text-white transition-colors shrink-0">
                      {staff.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-[#1A0D0C] group-hover:text-[#D9383A] transition-colors">
                        {staff.email}
                      </p>
                      <p className="text-[11px] text-gray-400 font-medium">
                        Whitelisted on{" "}
                        {new Date(staff.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge
                      className={cn(
                        "px-3.5 py-1 rounded-full text-xs border shadow-2xs tracking-tight flex items-center gap-1.5",
                        badgeStyle
                      )}
                      variant="secondary"
                    >
                      <Sparkles className="w-3 h-3 opacity-70" />
                      <span>{roleLabel}</span>
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-gray-50/50 rounded-[28px] border border-gray-100 my-4 flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-red-50 text-[#D9383A] flex items-center justify-center">
              <Filter className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <p className="text-gray-800 font-bold text-base">No staff emails match search</p>
              <p className="text-gray-400 text-xs max-w-sm">
                Try adjusting your search query or role filter tab above to view other whitelisted users.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="max-w-[1014px] pt-12 flex justify-end">
        <p className="w-[242px] h-[26px] text-[#AAA] text-right font-['Hanken_Grotesk'] text-[16px] font-normal leading-[94.331%] tracking-[-0.48px]">
          IEDC 2026 SJCET - TECH TEAM
        </p>
      </div>
    </div>
  );
}