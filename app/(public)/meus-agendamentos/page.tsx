import { Suspense } from "react";
import { MyBookingsPage } from "@/components/public/my-bookings";

export default function MeusAgendamentosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-arena-bg flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-arena-accent border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <MyBookingsPage />
    </Suspense>
  );
}
