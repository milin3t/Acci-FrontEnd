import { AnalyzedVideoCard } from "@/features/analyze/result/AnalyzedVideoCard";
import { FaultAnalysisCard } from "@/features/analyze/result/FaultAnalysisCard";
import { PrecedentList } from "@/features/analyze/result/PrecedentList";

type FaultRatioItem = {
  label: string;
  percent: string;
  reasons: string[];
  tone: "red" | "blue";
};

type PrecedentItem = {
  id: string;
  category: string[];
  title: string;
  date: string;
  summary: string;
};

type AnalyzeResultSectionProps = {
  analysisId: string;
  videoTitle: string;
  faultTitle: string;
  faultItems: FaultRatioItem[];
  sceneTitle: string;
  sceneTags: string[];
  sceneDescriptions: string[];
  legalTitle: string;
  legalLaw: string;
  legalDescription: string;
  precedentTitle: string;
  precedentTotalCount: number;
  precedents: PrecedentItem[];
};

export function AnalyzeResultSection({
  analysisId,
  videoTitle,
  faultTitle,
  faultItems,
  sceneTitle,
  sceneTags,
  sceneDescriptions,
  legalTitle,
  legalLaw,
  legalDescription,
  precedentTitle,
  precedentTotalCount,
  precedents,
}: AnalyzeResultSectionProps) {

  return (
      <section className="flex w-full max-w-xl flex-col items-center gap-4 md:gap-6">
      {/* 분석 영상 */}
      <AnalyzedVideoCard title={videoTitle} analysisId={analysisId} />

      {/* 과실 비율 분석 */}
      <FaultAnalysisCard
        faultTitle={faultTitle}
        faultItems={faultItems}
        sceneTitle={sceneTitle}
        sceneTags={sceneTags}
        sceneDescriptions={sceneDescriptions}
        legalTitle={legalTitle}
        legalLaw={legalLaw}
        legalDescription={legalDescription}
      />

      {/* 관련 판례 */}
      <PrecedentList title={precedentTitle} totalCount={precedentTotalCount} items={precedents} />
    </section>
  );
}
