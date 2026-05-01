type AdminSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

export function AdminSearch({
  value,
  onChange,
  placeholder,
}: AdminSearchProps) {
  return (
    <div className="rounded-xl border border-[#EAEAEA] bg-white p-4 ">
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-[#D8D6D0] px-4 py-3 text-[#111111]"
      />
    </div>
  );
}
