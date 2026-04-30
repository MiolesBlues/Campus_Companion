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

export type Profile = {
  id: string;
  email: string | null;
  full_name: string;
  role: UserRole;
  student_id: string | null;
  course: string | null;
  year_of_study: number | null;
  start_year: number | null;
  societies: SocietyMembership[] | null;
  created_at: string;
  updated_at: string;
};

export type EventTagRecord = {
  id: number;
  event_id: number;
  tag: string;
};

export type EventRecord = {
  id: number;
  title: string;
  category: string;
  description: string;
  location: string;
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
