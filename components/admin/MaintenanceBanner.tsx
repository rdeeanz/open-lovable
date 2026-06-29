"use client";

import { useEffect, useState } from "react";

export default function MaintenanceBanner() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.maintenanceMode) setMaintenanceMode(true);
      })
      .catch(() => undefined);
  }, []);

  if (!maintenanceMode) return null;

  return (
    <div className="bg-heat-100 text-white text-center text-body-small py-10 px-16">
      Website sedang dalam mode maintenance. Beberapa fitur mungkin terbatas.
    </div>
  );
}
