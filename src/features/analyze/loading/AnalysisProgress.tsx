import { LoadingSpinner } from "@/shared/ui/loading-spinner";

type AnalysisProgressProps = {
  timeText: string;
};

export function AnalysisProgress({ timeText }: AnalysisProgressProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* 로딩 스피너 혹시 몰라서 shared로 따로 빼서 구현해두었습니다 */}
      <LoadingSpinner aria-label="분석 진행 중" />
      {/* estimated time -- */}
      <div className="rounded bg-white px-2 py-1 text-body11 text-gray-600 md:text-body9">{timeText}</div>
    </div>
  );
}
