import { db } from "@/db";
import { idCounters, studentProfiles } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

const DEPT_CODES: Record<string, string> = {
  // Canonical Codes
  CSE: "CSE",
  CA: "CA",
  CC: "CC",
  AD: "AD",
  CE: "CE",
  ME: "ME",
  ECE: "ECE",
  ER: "ER",
  EEE: "EEE",
  MCA: "MCA",
  "INT.MCA": "INT.MCA",
  INTMCA: "INT.MCA",
  MBA: "MBA",
  CY: "CY",
  AI: "AI",
  EC: "ECE",
  ECS: "ECS",
  CIV: "CE",
  MEE: "ME",
  AIDS: "AD",

  // Lowercase map
  cse: "CSE",
  ca: "CA",
  cc: "CC",
  ad: "AD",
  ce: "CE",
  me: "ME",
  ece: "ECE",
  er: "ER",
  eee: "EEE",
  mca: "MCA",
  "int.mca": "INT.MCA",
  intmca: "INT.MCA",
  mba: "MBA",
  cy: "CY",
  ai: "AI",
  ec: "ECE",
  ecs: "ECS",
  civ: "CE",

  // Full Department Labels
  "COMPUTER SCIENCE & ENGINEERING - CSE": "CSE",
  "COMPUTER SCIENCE & ENGINEERING (ARTIFICIAL INTELLIGENCE) - CA": "CA",
  "COMPUTER SCIENCE & ENGINEERING (CYBER SECURITY) - CC": "CC",
  "ARTIFICIAL INTELLIGENCE & DATA SCIENCE - AD": "AD",
  "CIVIL ENGINEERING - CE": "CE",
  "MECHANICAL ENGINEERING - ME": "ME",
  "ELECTRONICS & COMMUNICATION ENGINEERING - ECE": "ECE",
  "ELECTRONICS & COMPUTER ENGINEERING - ER": "ER",
  "ELECTRICAL & ELECTRONICS ENGINEERING - EEE": "EEE",
  "COMPUTER APPLICATIONS - MCA": "MCA",
  "INTEGRATED MCA - INT.MCA": "INT.MCA",
  "MASTERS IN BUSINESS ADMINISTRATION - MBA": "MBA",

  "COMPUTER SCIENCE & ENGINEERING (CSE)": "CSE",
  "CS - CYBER SECURITY (CY)": "CY",
  "ARTIFICIAL INTELLIGENCE AND DATA SCIENCE (AD)": "AD",
  "CS - ARTIFICIAL INTELLIGENCE (AI)": "AI",
  "ELECTRONICS & COMMUNICATION (EC)": "ECE",
  "ELECTRONICS & COMPUTER SCIENCE (ECS)": "ECS",
  "MECHANICAL ENGINEERING (ME)": "ME",
  "CIVIL ENGINEERING (CE)": "CE",
  "ELECTRICAL & ELECTRONICS (EEE)": "EEE",
};

export function getDeptCode(department: string): string {
  if (!department) return "GEN";
  const trimmed = department.trim();
  const upper = trimmed.toUpperCase();

  if (DEPT_CODES[upper]) return DEPT_CODES[upper];
  if (DEPT_CODES[trimmed]) return DEPT_CODES[trimmed];

  const matchHyphen = upper.match(/-\s*([A-Z0-9.]+)\s*$/);
  if (matchHyphen && matchHyphen[1]) {
    const code = matchHyphen[1].trim();
    if (code.length <= 8) return code;
  }

  const matchParen = upper.match(/\(([^)]+)\)/);
  if (matchParen && matchParen[1]) {
    const code = matchParen[1].trim();
    if (code.length <= 8) return code;
  }

  const sanitized = upper.replace(/[^A-Z0-9.]/g, "");
  return sanitized.slice(0, 6) || "GEN";
}

export async function generateIEDCId(
  department: string,
  graduationYear?: number
): Promise<string> {
  const deptCode = getDeptCode(department);
  const year = graduationYear || (new Date().getFullYear() + 4);
  const key = `${deptCode}_${year}`;

  let attempts = 0;
  while (attempts < 200) {
    attempts++;

    // Atomic upsert with increment using returning
    const [updated] = await db
      .insert(idCounters)
      .values({ deptYear: key, count: 1 })
      .onConflictDoUpdate({
        target: idCounters.deptYear,
        set: {
          count: sql`${idCounters.count} + 1`,
          updatedAt: sql`NOW()`,
        },
      })
      .returning({ count: idCounters.count });

    let countVal = updated?.count;
    if (!countVal) {
      const [res] = await db
        .select()
        .from(idCounters)
        .where(eq(idCounters.deptYear, key));
      countVal = res?.count || attempts;
    }

    const paddedNum = String(countVal).padStart(5, "0");
    const candidateId = `IEDC-${year}-${deptCode}-${paddedNum}`;

    // Verify candidateId is not already taken in studentProfiles
    const [existing] = await db
      .select({ id: studentProfiles.id })
      .from(studentProfiles)
      .where(eq(studentProfiles.iecdId, candidateId));

    if (!existing) {
      return candidateId;
    }
  }

  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `IEDC-${year}-${deptCode}-${randomSuffix}`;
}