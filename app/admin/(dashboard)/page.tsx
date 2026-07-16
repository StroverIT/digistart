import { AdminDashboard } from "@/components/admin/admin-dashboard";

const DASHBOARD_TABS = [
  "overview",
  "engagement",
  "funnels",
  "revenue",
  "traffic",
  "conversion",
  "operations",
] as const;

type DashboardTabId = (typeof DASHBOARD_TABS)[number];

function isDashboardTab(value: string | undefined): value is DashboardTabId {
  return Boolean(value && DASHBOARD_TABS.includes(value as DashboardTabId));
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;

  return <AdminDashboard initialTab={isDashboardTab(tab) ? tab : undefined} />;
}
