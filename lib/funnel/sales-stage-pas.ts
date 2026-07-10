import type {
  SalesStagePickerConfig,
  ServiceFunnelWhoIsItFor,
} from "@/config/service-funnels/types";
import type { SalesStageAnswer } from "@/lib/funnel/sales-stage";

const PAS_PROBLEM_IMAGE = "/funnel/online-store/start-selling-online/problem.png";
const PAS_AGITATE_IMAGE = "/funnel/online-store/start-selling-online/agitate.png";

export function resolveSalesStagePasSection(
  picker: SalesStagePickerConfig,
  answer: SalesStageAnswer | null,
): ServiceFunnelWhoIsItFor | null {
  if (!answer) return null;

  const path = picker.paths[answer.pathId];
  if (!path) return null;

  return {
    title: "",
    subtitle: "",
    items: [
      {
        badge: "Проблем",
        title: path.problem.title,
        description: path.problem.description,
        image: PAS_PROBLEM_IMAGE,
        imageFirst: false,
      },
      {
        badge: "Натиск",
        title: path.agitate.title,
        description: path.agitate.description,
        image: PAS_AGITATE_IMAGE,
        imageFirst: true,
      },
    ],
  };
}
