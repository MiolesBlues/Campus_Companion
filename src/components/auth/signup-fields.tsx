import {
  academicGroupOptions,
  campusOptions,
  courseOptions,
  eventCategoryOptions,
  interestOptions,
  yearOptions,
} from "@/lib/constants";

type SignupFieldsProps = {
  fullName: string;
  setFullName: (value: string) => void;
  course: string;
  setCourse: (value: string) => void;
  campus: string;
  setCampus: (value: string) => void;
  academicGroup: string;
  setAcademicGroup: (value: string) => void;
  selectedInterests: string[];
  setSelectedInterests: (value: string[]) => void;
  preferredEventCategories: string[];
  setPreferredEventCategories: (value: string[]) => void;
  yearOfStudy: string;
  setYearOfStudy: (value: string) => void;
  startYear: string;
  setStartYear: (value: string) => void;
};

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function SignupFields({
  fullName,
  setFullName,
  course,
  setCourse,
  campus,
  setCampus,
  academicGroup,
  setAcademicGroup,
  selectedInterests,
  setSelectedInterests,
  preferredEventCategories,
  setPreferredEventCategories,
  yearOfStudy,
  setYearOfStudy,
  startYear,
  setStartYear,
}: SignupFieldsProps) {
  return (
    <>
      <div>
        <label
          htmlFor="full-name"
          className="mb-2 block text-sm font-medium text-[#4A4844]"
        >
          Full name
        </label>
        <input
          id="full-name"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
          placeholder="Alex Student"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="course"
            className="mb-2 block text-sm font-medium text-[#4A4844]"
          >
            Course
          </label>
          <select
            id="course"
            value={course}
            onChange={(event) => setCourse(event.target.value)}
            className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
            required
          >
            {courseOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="campus"
            className="mb-2 block text-sm font-medium text-[#4A4844]"
          >
            Campus
          </label>
          <select
            id="campus"
            value={campus}
            onChange={(event) => setCampus(event.target.value)}
            className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
            required
          >
            {campusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="year-of-study"
            className="mb-2 block text-sm font-medium text-[#4A4844]"
          >
            Current year
          </label>
          <select
            id="year-of-study"
            value={yearOfStudy}
            onChange={(event) => setYearOfStudy(event.target.value)}
            className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
            required
          >
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                Year {year}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="start-year"
            className="mb-2 block text-sm font-medium text-[#4A4844]"
          >
            Started in academic year
          </label>
          <input
            id="start-year"
            type="number"
            value={startYear}
            onChange={(event) => setStartYear(event.target.value)}
            className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
            min="2010"
            max="2100"
            required
          />
        </div>

        <div>
          <label
            htmlFor="academic-group"
            className="mb-2 block text-sm font-medium text-[#4A4844]"
          >
            Group
          </label>
          <select
            id="academic-group"
            value={academicGroup}
            onChange={(event) => setAcademicGroup(event.target.value)}
            className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111] focus:border-[#787774] focus:outline-none"
          >
            <option value="">Select group</option>
            {academicGroupOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-[#EAEAEA] bg-[#FBFBFA] p-4 sm:p-5">
          <p className="mb-2 block text-sm font-medium text-[#4A4844]">
            Interests
          </p>
          <p className="mb-3 text-sm text-[#787774]">
            Used to recommend events and societies for you.
          </p>
          <div className="flex flex-wrap gap-2">
            {interestOptions.map((option) => {
              const active = selectedInterests.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setSelectedInterests(toggleValue(selectedInterests, option))
                  }
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${active ? "bg-[#1F6C9F] text-white" : "border border-[#D8D6D0] bg-white text-[#4A4844] hover:bg-[#FBFBFA]"}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-xl border border-[#EAEAEA] bg-[#FBFBFA] p-4 sm:p-5">
          <p className="mb-2 block text-sm font-medium text-[#4A4844]">
            Preferred event categories
          </p>
          <p className="mb-3 text-sm text-[#787774]">
            We will use this to rank more relevant events higher.
          </p>
          <div className="flex flex-wrap gap-2">
            {eventCategoryOptions.map((option) => {
              const active = preferredEventCategories.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() =>
                    setPreferredEventCategories(
                      toggleValue(preferredEventCategories, option),
                    )
                  }
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${active ? "bg-[#111111] text-white" : "border border-[#D8D6D0] bg-white text-[#4A4844] hover:bg-[#FBFBFA]"}`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
