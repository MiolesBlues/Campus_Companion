import type { EventWithTags, Society } from "@/types/database";

export function eventRecommendationScore(
  event: EventWithTags,
  campus: string | null | undefined,
  interests: string[] | null | undefined,
  preferredCategories: string[] | null | undefined,
) {
  let score = 0;
  if (campus && event.campus === campus) score += 3;
  if (preferredCategories?.includes(event.category)) score += 3;
  if (interests?.includes(event.category)) score += 2;
  return score;
}

export function societyRecommendationScore(
  society: Society,
  interests: string[] | null | undefined,
  preferredSocietyCategories: string[] | null | undefined,
) {
  let score = 0;
  if (preferredSocietyCategories?.includes(society.category)) score += 3;
  if (interests?.includes(society.category)) score += 2;
  return score;
}

export function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}
