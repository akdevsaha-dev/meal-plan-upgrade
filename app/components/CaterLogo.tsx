import Link from "next/link";

type CaterLogoProps = {
  size?: number;
  className?: string;
  href?: string | null;
};

export default function CaterLogo({
  size = 28,
  className = "",
  href = "/",
}: CaterLogoProps) {
  const logo = (
    <svg
      width={size * 1.4}
      height={size}
      viewBox="0 0 32 24"
      fill="currentColor"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Abstract fingerprint / grip parallel rounded lines */}
      <rect x="2" y="3" width="8" height="3" rx="1.5" />
      <rect x="12" y="3" width="18" height="3" rx="1.5" />
      
      <rect x="2" y="9" width="22" height="3" rx="1.5" />
      <rect x="26" y="9" width="4" height="3" rx="1.5" />
      
      <rect x="2" y="15" width="14" height="3" rx="1.5" />
      <rect x="18" y="15" width="12" height="3" rx="1.5" />
      
      <rect x="2" y="21" width="28" height="3" rx="1.5" />
    </svg>
  );

  if (href === null) {
    return logo;
  }

  return (
    <Link href={href} className="inline-flex items-center gap-2 shrink-0 group">
      {logo}
    </Link>
  );
}
