import { AnalysisMessage } from "@/features/analyze/loading/AnalysisMessage";
import { AnalysisProgress } from "@/features/analyze/loading/AnalysisProgress";
import { AnalysisTip } from "@/features/analyze/loading/AnalysisTip";

type AnalyzeLoadingSectionProps = {
  timeText: string;
  title?: string;
  descriptionLine1?: string;
  descriptionLine2?: string;
};

export function AnalyzeLoadingSection({ timeText, title, descriptionLine1, descriptionLine2 }: AnalyzeLoadingSectionProps) {
  return (
    <section className="flex w-full flex-col items-center justify-center gap-4 py-10 md:gap-6">
      {/* 분석 진행 상태 */}
      <AnalysisProgress timeText={timeText} />
      <AnalysisMessage title={title} descriptionLine1={descriptionLine1} descriptionLine2={descriptionLine2} />
      <AnalysisTip />
    </section>
  );
}
