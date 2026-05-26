"use client";

import Link from "next/link";
import { CircleAlert, PackageCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type UserNavItemLinkProps = {
  href: string;
  label: string;
  showSetupAlert: boolean;
  missingCount?: number;
};

export function UserNavItemLink({
  href,
  label,
  showSetupAlert,
  missingCount = 0,
}: UserNavItemLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-start gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <PackageCheck className="mt-0.5 h-4 w-4 shrink-0" />
      <span className="line-clamp-2 flex-1">{label}</span>
      {showSetupAlert ? (
        <span
          className="relative mt-0.5 flex shrink-0 items-center"
          title={
            missingCount > 0
              ? `${missingCount} стъпки за довършване`
              : "Има стъпки за довършване"
          }
        >
          <CircleAlert className="h-4 w-4 text-red-500" aria-label="Има незавършени стъпки" />
          {missingCount > 0 ? (
            <span className="absolute -right-1.5 -top-1.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
              {missingCount > 9 ? "9+" : missingCount}
            </span>
          ) : null}
        </span>
      ) : null}
    </Link>
  );
}
