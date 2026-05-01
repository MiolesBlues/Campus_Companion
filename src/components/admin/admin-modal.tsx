import { ReactNode } from "react";

type AdminModalProps = {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
};

export function AdminModal({ title, description, onClose, children }: AdminModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
