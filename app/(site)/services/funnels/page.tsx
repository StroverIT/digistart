import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";
import { FunnelUrlActions } from "@/components/admin/funnel-url-actions";
import { FunnelSlotsEditor } from "@/components/admin/funnel-slots-editor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFunnelsGroupedByService } from "@/config/service-funnels";
import { authOptions } from "@/lib/auth";
import { SITE_METADATA_BASE } from "@/lib/seo/open-graph";

export const metadata: Metadata = {
  title: "Фунии по услуги",
  robots: { index: false, follow: false },
};

export default async function ServiceFunnelsAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/admin/login");
  }

  if (session.user.role !== "admin") {
    redirect("/");
  }

  const groups = getFunnelsGroupedByService();
  const siteOrigin = SITE_METADATA_BASE.origin;

  return (
    <div className="container mx-auto max-w-4xl px-4 pb-10 pt-site-header md:px-8 md:pb-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Фунии по услуги</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Публични landing страници за реклами и кампании. Добавяй нови фунии в{" "}
            <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">
              config/service-funnels/
            </code>
            .
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin">
            <ArrowLeft className="mr-1.5 size-3.5" />
            Към админ панела
          </Link>
        </Button>
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Няма конфигурирани фунии.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groups.map((group) => (
            <Card key={group.serviceId}>
              <CardHeader>
                <CardTitle className="text-lg">{group.serviceName}</CardTitle>
                <p className="text-sm text-muted-foreground">/services/{group.serviceSlug}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.funnels.map((funnel) => (
                  <div
                    key={funnel.id}
                    className="rounded-xl border border-border bg-secondary/20 p-4"
                  >
                    <p className="font-medium text-foreground">{funnel.adminLabel}</p>
                    <div className="mt-3">
                      <FunnelUrlActions
                        pagePath={funnel.pagePath}
                        absoluteUrl={`${siteOrigin}${funnel.pagePath}`}
                      />
                    </div>
                    <FunnelSlotsEditor funnelId={funnel.id} adminLabel={funnel.adminLabel} />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
