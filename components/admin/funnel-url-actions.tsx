"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

type FunnelUrlActionsProps = {
  pagePath: string;
  absoluteUrl: string;
};

export function FunnelUrlActions({ pagePath, absoluteUrl }: FunnelUrlActionsProps) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [absoluteUrl]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <code className="rounded-md bg-secondary px-2 py-1 text-xs text-muted-foreground">
        {pagePath}
      </code>
      <Button variant="outline" size="sm" asChild>
        <Link href={pagePath} target="_blank" rel="noopener noreferrer">
          <ExternalLink className="mr-1.5 size-3.5" />
          Отвори
        </Link>
      </Button>
      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? (
          <Check className="mr-1.5 size-3.5" />
        ) : (
          <Copy className="mr-1.5 size-3.5" />
        )}
        {copied ? "Копирано" : "Копирай URL"}
      </Button>
    </div>
  );
}
