import { campusOptions, courseOptions, yearOptions } from "@/lib/constants";
import type { Society } from "@/types/database";

type SignupFieldsProps = {
  fullName: string;
  setFullName: (value: string) => void;
  course: string;
  setCourse: (value: string) => void;
  campus: string;
  setCampus: (value: string) => void;
  yearOfStudy: string;
  setYearOfStudy: (value: string) => void;
  startYear: string;
  setStartYear: (value: string) => void;
  societyOptions: Society[];
  selectedSocietyIds: string[];
  updateSociety: (index: number, value: string) => void;
  addSocietyField: () => void;
  removeSocietyField: (index: number) => void;
};

export function SignupFields({
  fullName,
  setFullName,
  course,
  setCourse,
  campus,
  setCampus,
  yearOfStudy,
  setYearOfStudy,
  startYear,
  setStartYear,
  societyOptions,
  selectedSocietyIds,
  updateSociety,
  addSocietyField,
  removeSocietyField,
}: SignupFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="full-name" className="mb-2 block text-sm font-medium text-slate-700">
          Full name
        </label>
        <input
          id="full-name"
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
          placeholder="Alex Student"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="course" className="mb-2 block text-sm font-medium text-slate-700">
            Course
          </label>
          <select
            id="course"
            value={course}
            onChange={(event) => setCourse(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
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
          <label htmlFor="campus" className="mb-2 block text-sm font-medium text-slate-700">
            Campus
          </label>
          <select
            id="campus"
            value={campus}
            onChange={(event) => setCampus(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
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
          <label htmlFor="year-of-study" className="mb-2 block text-sm font-medium text-slate-700">
            Current year
          </label>
          <select
            id="year-of-study"
            value={yearOfStudy}
            onChange={(event) => setYearOfStudy(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
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
          <label htmlFor="start-year" className="mb-2 block text-sm font-medium text-slate-700">
            Started in academic year
          </label>
          <input
            id="start-year"
            type="number"
            value={startYear}
            onChange={(event) => setStartYear(event.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
            min="2010"
            max="2100"
            required
          />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <label className="block text-sm font-medium text-slate-700">Societies (optional)</label>
          <button
            type="button"
            onClick={addSocietyField}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
          >
            + Add society
          </button>
        </div>

        {selectedSocietyIds.map((societyId, index) => (
          <div key={`${index}-${societyId}`} className="flex gap-2">
            <select
              value={societyId}
              onChange={(event) => updateSociety(index, event.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 focus:border-slate-500 focus:outline-none"
            >
              <option value="">Select a society</option>
              {societyOptions.map((society) => (
                <option key={society.id} value={String(society.id)}>
                  {society.name}
                </option>
              ))}
            </select>
            {selectedSocietyIds.length > 1 && (
              <button
                type="button"
                onClick={() => removeSocietyField(index)}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
