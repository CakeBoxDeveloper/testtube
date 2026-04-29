"use client";

import { MaterialCard } from "./MaterialCard";
import { SAMPLE_WORKOUTS } from "./sample-data";

export function WorkoutsView() {
  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
      {SAMPLE_WORKOUTS.map((item) => (
        <MaterialCard key={item.id} item={item} />
      ))}
    </div>
  );
}
