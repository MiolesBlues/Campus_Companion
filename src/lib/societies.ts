import type { Society } from "@/types/database";

export const fallbackSocieties: Society[] = [
  { id: 1, name: "Computer Society", category: "Technology", description: "Coding, hackathons, and student tech events.", contact_email: "computing@campuscompanion.edu", meeting_day: "Wednesday", published: true },
  { id: 2, name: "Drama Society", category: "Arts", description: "Performances, workshops, and stage productions.", contact_email: "drama@campuscompanion.edu", meeting_day: "Thursday", published: true },
  { id: 3, name: "Basketball Club", category: "Sports", description: "Training sessions and friendly competition.", contact_email: "basketball@campuscompanion.edu", meeting_day: "Tuesday", published: true },
  { id: 4, name: "Debate Society", category: "Academic", description: "Debates, public speaking, and competitions.", contact_email: "debate@campuscompanion.edu", meeting_day: "Monday", published: true },
  { id: 5, name: "Music Society", category: "Arts", description: "Jams, rehearsals, and live music nights.", contact_email: "music@campuscompanion.edu", meeting_day: "Friday", published: true },
  { id: 6, name: "Entrepreneurship Society", category: "Business", description: "Startup ideas, networking, and founder talks.", contact_email: "startup@campuscompanion.edu", meeting_day: "Wednesday", published: true },
  { id: 7, name: "Gaming Society", category: "Social", description: "Console, PC, board game, and esports events.", contact_email: "gaming@campuscompanion.edu", meeting_day: "Saturday", published: true },
  { id: 8, name: "International Students Society", category: "Community", description: "Support and social events for international students.", contact_email: "international@campuscompanion.edu", meeting_day: "Thursday", published: true }
];
