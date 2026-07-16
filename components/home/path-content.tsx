import type { PathContent as PathContentType } from "@/lib/data/home-paths";
import { PathFitChecklist } from "@/components/home/path-fit-checklist";
import { PathStoryStepper } from "@/components/home/path-story-stepper";

export function PathContent({ path }: { path: PathContentType }) {
  return (
    <div className="space-y-12">
      <PathStoryStepper
        problem={path.problem}
        agitate={path.agitate}
        solution={path.solution}
      />
      <PathFitChecklist fitTitle={path.fitTitle} fits={path.fits} />
    </div>
  );
}
