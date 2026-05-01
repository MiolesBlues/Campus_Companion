import { ReactNode } from "react";

type AdminModalProps = {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
};

export function AdminModal({
  title,
  description,
  onClose,
  children,
}: AdminModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/50 p-4">
      <div className="w-full max-w-4xl rounded-xl border border-[#EAEAEA] bg-white p-6 shadow-[0_20px_60px_-40px_rgba(17,17,17,0.22)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#111111]">{title}</h2>
            <p className="mt-1 text-sm text-[#64615C]">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#D8D6D0] px-3 py-2 text-sm font-medium text-[#111111] transition hover:bg-[#FBFBFA]"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
