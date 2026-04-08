import type {
  AuthorityResult,
  BrandDescriptionResult,
  ConsistencyAssessment,
  CoverageResult,
  DetectInput,
  ResultItem,
  Score,
} from "@/lib/detect/types";

function getLevel(total: number): Score["level"] {
  if (total < 40) return "L1";
  if (total < 60) return "L2";
  if (total < 80) return "L3";
  return "L4";
}

export function scoreCoverage(result: CoverageResult) {
  if (!result.isMentioned) return 0;
  if (result.mentionPosition === 1) return 80;
  if (result.mentionPosition && result.mentionPosition <= 3) return 60;
  return 30;
}

export function scoreConsistency(
  description: BrandDescriptionResult,
  consistencyAssessment: ConsistencyAssessment
) {
  if (!description.knowsBrand) return 0;
  if (consistencyAssessment.hasMajorConflict) return 30;
  if (!consistencyAssessment.hitsCoreNarrative) return 60;
  return 80;
}

export function scoreAuthority(result: AuthorityResult) {
  if (!result.hasVerifiableSource) return 0;
  if (result.sourceNames.length >= 2) return 80;
  if (result.sourceNames.length === 1) return 60;
  return 30;
}

export function scoreTotal(input: { consistency: number; coverage: number; authority: number }) {
  return Math.round(input.consistency * 0.4 + input.coverage * 0.3 + input.authority * 0.3);
}

export function scoreResultItem(item: ResultItem): ResultItem {
  const coverage = scoreCoverage(item.coverage);
  const consistency = scoreConsistency(item.description, item.consistencyAssessment);
  const authority = scoreAuthority(item.authority);
  const total = scoreTotal({ coverage, consistency, authority });

  return {
    ...item,
    scoreBreakdown: {
      coverage,
      consistency,
      authority,
      total,
    },
  };
}

function average(values: number[]) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function scoreReport(_input: DetectInput, results: ResultItem[]): Score {
  const coverage = average(results.map((item) => item.scoreBreakdown.coverage));
  const consistency = average(results.map((item) => item.scoreBreakdown.consistency));
  const authority = average(results.map((item) => item.scoreBreakdown.authority));
  const total = scoreTotal({ coverage, consistency, authority });

  return {
    consistency,
    coverage,
    authority,
    total,
    level: getLevel(total),
  };
}
