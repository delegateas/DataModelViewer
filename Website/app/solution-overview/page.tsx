import { SolutionOverviewView } from "@/components/solutionoverviewview/SolutionOverviewView";
import { TouchProvider } from "@/components/shared/ui/hybridtooltop";
import { Loading } from "@/components/shared/ui/loading";
import { TooltipProvider } from "@/components/shared/ui/tooltip";
import { Suspense } from "react";

export default function SolutionOverview() {
  return <Suspense fallback={<Loading />}>
      <TouchProvider>
        <TooltipProvider>
            <SolutionOverviewView />
        </TooltipProvider>
      </TouchProvider>
    </Suspense>
}