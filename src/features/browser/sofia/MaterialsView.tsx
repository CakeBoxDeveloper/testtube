"use client";

import { MaterialCard } from "./MaterialCard";
import { SAMPLE_MATERIALS } from "./sample-data";

export function MaterialsView() {
  return (
    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 min-h-0">
      {SAMPLE_MATERIALS.map((item) => (
        <MaterialCard key={item.id} item={item} />
      ))}
    </div>
  );
}
