export type UserRole = "student" | "teacher" | "admin";

export type SocietyMembership = {
  society_id: number;
  name: string;
};

export type Society = {
  id: number;
  name: string;
  category: string;
  description: string;
  contact_email: string | null;
  meeting_day: string | null;
  published: boolean;
};

export type SocietyJoinRecord = {
  id: number;
  user_id: string;
  society_id: number;
  created_at: string;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string;
  role: UserRole;
  course: string | null;
  campus: string | null;
  academic_group: string | null;
  interests: string[] | null;
  preferred_event_categories: string[] | null;
  preferred_society_categories: string[] | null;
  bio?: string | null;
  year_of_study: number | null;
  start_year: number | null;
  avatar_url?: string | null;
  societies: SocietyMembership[] | null;
  created_at: string;
  updated_at: string;
};

export type EventTagRecord = {
  id: number;
  event_id: number;
  tag: string;
};

export type EventRegistrationRecord = {
  id: number;
  user_id: string;
  event_id: number;
  created_at: string;
};

export type EventRecord = {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
  campus: string | null;
  event_date: string;
  start_time: string;
  end_time: string;
  audience: string;
  capacity: number | null;
  published: boolean;
  created_by?: string | null;
};

export type EventWithTags = EventRecord & {
  tags: string[];
};

export type LocationRecord = {
  id: number;
  name: string;
  type: string;
  description: string;
  campus: string | null;
  building_code?: string | null;
  opening_hours: string | null;
  accessibility_notes: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  published?: boolean;
};

export type TimetableRecord = {
  id: number;
  course_code: string;
  course_name: string;
  year_of_study: number | null;
  semester: number;
  day_of_week: string;
  module_code: string;
  module_name: string;
  lecturer_name: string;
  lecturer_email: string | null;
  room: string;
  building: string;
  start_time: string;
  end_time: string;
  delivery_mode: string;
  owner_role: "student" | "teacher";
  published: boolean;
};

export type HelpdeskTicketRecord = {
  id: number;
  user_id: string;
  category: string;
  urgency: "low" | "medium" | "high";
  subject: string;
  description: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  assigned_to: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};
