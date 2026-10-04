import { createFileRoute } from "@tanstack/react-router";
import { SignalDesk } from "@/components/signal-desk";
import { BalanceCalculator } from "@/components/calculator";
import { StatRow } from "@/components/stats";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="space-y-5">
      <div className="rise">
        <StatRow />
      </div>
      <div className="rise rise-2">
        <SignalDesk />
      </div>
      <div className="rise rise-3 mx-auto w-full max-w-md">
        <BalanceCalculator />
      </div>
    </div>
  );
}