"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { PlanId } from "@/lib/data/plans";
import { addPlanToCart } from "@/lib/store/cart";
import { useTransitionRouter } from "@/components/transitions/useTransitionRouter";
import { Button } from "@/components/ui/button";

interface PlanSelectButtonProps {
  planId: PlanId;
  variant?: "default" | "outline" | "secondary";
  className?: string;
  children?: React.ReactNode;
}

export function PlanSelectButton({
  planId,
  variant = "default",
  className,
  children = "Избери план",
}: PlanSelectButtonProps) {
  const { push } = useTransitionRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    const result = addPlanToCart(planId);
    setLoading(false);
    if (!result.added) {
      if (result.reason === "duplicate") {
        toast.info("Този план вече е в количката.");
        push("/cart");
      }
      return;
    }
    toast.success("Планът е добавен в количката.");
    push("/cart");
  };

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      disabled={loading}
      onClick={handleClick}
    >
      {loading ? "Добавяне..." : children}
    </Button>
  );
}
