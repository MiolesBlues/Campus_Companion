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
        className={`${classes} rounded-lg object-cover border border-[#EAEAEA] bg-[#F7F6F3]`}
      />
    );
  }

  return (
    <div
      className={`${classes} flex items-center justify-center rounded-lg border border-[#EAEAEA] bg-[#F7F6F3] font-semibold text-[#787774]`}
      aria-label={alt}
      title={alt}
    >
      <span aria-hidden="true">CC</span>
    </div>
  );
}
