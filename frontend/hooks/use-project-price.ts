import { useEffect, useState } from "preact/hooks";

import { fetchJsonOrToast } from "../lib/api.js";

export type ProjectPrice = {
  material_cost: number;
  machine_cost: number;
  labor_cost: number;
  extra_labor_cost: number;
  final_price: number;
};

const projectPriceCache = new Map<number, ProjectPrice>();

export function useProjectPrice(projectId: number, jobCount: number): ProjectPrice | null {
  const [price, setPrice] = useState<ProjectPrice | null>(
    () => projectPriceCache.get(projectId) ?? null,
  );

  useEffect(() => {
    setPrice(projectPriceCache.get(projectId) ?? null);
    if (!jobCount) {
      projectPriceCache.delete(projectId);
      setPrice(null);
      return;
    }

    let cancelled = false;
    fetchJsonOrToast<ProjectPrice>(
      `/projects/${projectId}/price`,
      "Failed to load project price.",
    ).then((data) => {
      if (!data || cancelled) return;
      projectPriceCache.set(projectId, data);
      setPrice(data);
    });

    return () => {
      cancelled = true;
    };
  }, [projectId, jobCount]);

  return price;
}
