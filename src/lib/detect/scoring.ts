import type { DetectInput, ResultItem, Score } from "@/lib/detect/types";

function getLevel(total: number): Score["level"] {
  if (total < 40) return "L1";
  if (total < 60) return "L2";
  if (total < 80) return "L3";
  return "L4";
}

export function scoreReport(_input: DetectInput, results: ResultItem[]): Score {
  const total = Math.max(results.length, 1);

  const mentionedCount = results.filter((item) => item.mentioned).length;
  const positioningCount = results.filter((item) => item.positioningMatch).length;
  const consistentCount = results.filter((item) => item.descriptionConsistent).length;
  const authorityCount = results.filter((item) => item.authoritySignal).length;

  const consistency = Math.round(
    ((positioningCount * 0.6 + consistentCount * 0.4) / total) * 100
  );
  const coverage = Math.round((mentionedCount / total) * 100);
  const authority = Math.round((authorityCount / total) * 100);
  const combined = Math.round(consistency * 0.4 + coverage * 0.35 + authority * 0.25);

  return {
    consistency,
    coverage,
    authority,
    total: combined,
    level: getLevel(combined),
  };
}
