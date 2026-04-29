type AnalysisMessageProps = {
  title?: string;
  descriptionLine1?: string;
  descriptionLine2?: string;
};

export function AnalysisMessage({
  title = "Acci가 분석중입니다",
  descriptionLine1 = "업로드한 블랙박스 영상을 분석하여",
  descriptionLine2 = "과실비율, 판단근거, 관련판례를 제공합니다",
}: AnalysisMessageProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      {/* 분석 진행 안내 문구 */}
      <p className="text-body1 font-semibold text-gray-900 md:text-title4">{title}</p>
      <div className="text-body10 text-gray-500 md:text-body6">
        <p>{descriptionLine1}</p>
        <p>{descriptionLine2}</p>
      </div>
    </div>
  );
}
