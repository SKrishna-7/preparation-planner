import { Suspense } from "react";
import DashboardContent from "@/src/DashboardContent"; // Move your UI here

export default function Page() {
  return (
    <Suspense fallback={<div>Initializing System...</div>}>
      <DashboardContent />
    </Suspense>
  );
}