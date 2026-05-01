type AvatarProps = {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-20 w-20 text-xl",
};

export function Avatar({ src, alt, size = "md" }: AvatarProps) {
  const classes = sizeClasses[size];

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${classes} rounded-full object-cover border border-slate-200 bg-slate-100`}
      />
    );
  }

  return (
    <div
      className={`${classes} flex items-center justify-center rounded-full border border-slate-200 bg-slate-100 font-semibold text-slate-500`}
      aria-label={alt}
      title={alt}
    >
      👤
    </div>
  );
}
