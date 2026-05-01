import type { Profile } from "@/types/database";

export function calculateAcademicYear(startYear: number, now = new Date()) {
  const currentYear = now.getFullYear();
  const month = now.getMonth();
  const academicYearOffset = month >= 7 ? currentYear - startYear + 1 : currentYear - startYear;
  return Math.max(1, academicYearOffset);
}

export function currentAcademicStartYear(now = new Date()) {
  const month = now.getMonth();
  const year = now.getFullYear();
  return month >= 7 ? year : year - 1;
}

export function getEffectiveYearOfStudy(profile: Profile | null) {
  if (!profile) {
    return null;
  }

  if (typeof profile.start_year === "number") {
    return calculateAcademicYear(profile.start_year);
  }

  return profile.year_of_study ?? null;
}
