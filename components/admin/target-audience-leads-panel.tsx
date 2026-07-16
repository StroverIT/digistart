"use client";

import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TARGET_AUDIENCES_PAGE_PATH } from "@/lib/data/target-audiences-content";

export function TargetAudienceLeadsPanel() {
  return (
    <Card data-admin-animate className="border-border bg-card">
      <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <CardTitle>3 потенциални целеви аудитории</CardTitle>
          <p className="text-sm text-muted-foreground">
            Заявки от страницата за безплатен анализ на аудитории
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={TARGET_AUDIENCES_PAGE_PATH} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Форма
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/admin/target-audiences">
              Виж всички
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Пълният списък със заявки, търсене и детайли е в отделната секция{" "}
          <Link href="/admin/target-audiences" className="font-medium text-primary underline">
            Целеви аудитории
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
