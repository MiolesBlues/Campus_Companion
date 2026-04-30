export type UserRole = "user" | "admin";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string;
  role: UserRole;
  student_id: string | null;
  course: string | null;
  year_of_study: number | null;
  created_at: string;
  updated_at: string;
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
};

export type TimetableRecord = {
  id: number;
  course_code: string;
  course_name: string;
  year_of_study: number;
  semester: number;
  day_of_week: string;
  module_code: string;
  module_name: string;
  lecturer_name: string;
  room: string;
  building: string;
  start_time: string;
  end_time: string;
  delivery_mode: string;
  published: boolean;
};
