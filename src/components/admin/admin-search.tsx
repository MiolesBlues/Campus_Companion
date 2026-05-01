type AdminSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function AdminSearch({ value, onChange, placeholder }: AdminSearchProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900"
      />
    </div>
  );
}
