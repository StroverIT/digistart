import ConsultationsAdminClient from "@/components/admin/ConsultationsAdminClient";
import { getConsultationBookings } from "@/lib/server/consultation-bookings";

export default async function ConsultationsPage() {
  const consultations = await getConsultationBookings();

  return <ConsultationsAdminClient consultations={consultations} />;
}
