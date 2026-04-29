"use client";

import type { UserInfo } from "@/entities/user/model/user-info";
import axiosInstance from "@/shared/api/axios-instance";
import { Button } from "@/shared/ui/button";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";
import { AnalyzeResultSection } from "@/widgets/analyze-result/AnalyzeResultSection";
import { Footer } from "@/widgets/footer/Footer";
import { Header } from "@/widgets/header/Header";
import type { AxiosError } from "axios";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

interface ResultPageProps {
  id: string;
  initialUserInfo?: UserInfo | null;
}

type AnalysisStatus = "PROCESSING" | "COMPLETED" | "FAILED";

type AnalysisResultResponse = {
  analysisId: string;
  aiJobId?: string | null;
  userId?: number;
  accidentAiResultResponse?: {
    accidentType?: string;
    accidentRateA?: number;
    accidentRateB?: number;
    place?: string;
    situation?: string;
    vehicleASituation?: string;
    vehicleBSituation?: string;
  } | null;
  accident_type?: {
    objectType?: string;
    place?: string;
    situation?: string;
    vehicleADirection?: string;
  } | null;
  ragSummaryResponse?: {
    accidentSituation?: string;
    accidentExplain?: string;
    relatedLaws?: Array<{
      lawName?: string;
      lawContent?: string;
    }> | null;
    precedentCases?: Array<{
      caseName?: string;
      summary?: string;
      dateOfJudgment?: string;
    }> | null;
  } | null;
  analysisStatus?: AnalysisStatus;
  ragStatus?: string;
  isCompleted?: boolean;
};

function pickFirst<T>(...values: Array<T | null | undefined>) {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

function formatDate(rawDate?: string) {
  if (!rawDate) return "-";
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return "-";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function shouldRetryAnalyzeResult(error: unknown) {
  const axiosError = error as AxiosError<{ name?: string; code?: number }>;
  const status = axiosError?.response?.status;
  const errorName = axiosError?.response?.data?.name;

  if (status === 404 || status === 425 || status === 429 || status === 500 || status === 502 || status === 503 || status === 504) {
    return true;
  }
  if (errorName === "ANALYSIS_NOT_FOUND" || errorName === "ANALYSIS_INTERRUPTED") {
    return true;
  }
  return false;
}

export default function ResultPage({ id, initialUserInfo = null }: ResultPageProps) {
  const { data, isLoading, isError, refetch } = useQuery<AnalysisResultResponse>({
    queryKey: ["analysis-result", id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/api/v1/analyses/${id}`);
      // 백엔드가 { data: {...} } 형태로 래핑할 수 있어 안전하게 언랩합니다.
      const payload = (response.data?.data ?? response.data) as AnalysisResultResponse & {
        accident_ai_result_response?: AnalysisResultResponse["accidentAiResultResponse"];
        rag_summary_response?: AnalysisResultResponse["ragSummaryResponse"];
      };
      return payload;
    },
    staleTime: 1000 * 60,
    retry: (failureCount, error) => {
      if (failureCount >= 8) {
        return false;
      }
      return shouldRetryAnalyzeResult(error);
    },
    retryDelay: (attemptIndex) => Math.min(1000 * (attemptIndex + 1), 3000),
  });

  const mappedResult = useMemo(() => {
    const typedData = data as
      | (AnalysisResultResponse & {
          accident_ai_result_response?: AnalysisResultResponse["accidentAiResultResponse"];
          rag_summary_response?: AnalysisResultResponse["ragSummaryResponse"];
        })
      | undefined;

    const accidentResult = pickFirst(typedData?.accidentAiResultResponse, typedData?.accident_ai_result_response);
    const accidentType = data?.accident_type;
    const ragSummary = pickFirst(typedData?.ragSummaryResponse, typedData?.rag_summary_response);
    const relatedLaws = pickFirst(
      ragSummary?.relatedLaws,
      (ragSummary as { related_laws?: Array<{ lawName?: string; lawContent?: string; law_name?: string; law_content?: string }> | null } | undefined)
        ?.related_laws
    );
    const precedentCases = pickFirst(
      ragSummary?.precedentCases,
      (ragSummary as { precedent_cases?: Array<{ caseName?: string; summary?: string; dateOfJudgment?: string; case_name?: string; date_of_judgment?: string }> | null } | undefined)
        ?.precedent_cases
    );
    const relatedLaw = relatedLaws?.[0];

    const sceneTags = [
      pickFirst(accidentType?.objectType, (accidentType as { object_type?: string } | undefined)?.object_type),
      pickFirst(accidentType?.place, accidentResult?.place),
      pickFirst(accidentType?.situation, accidentResult?.situation),
    ].filter((item): item is string => Boolean(item));
    const sceneDescriptions = [
      pickFirst(
        ragSummary?.accidentSituation,
        (ragSummary as { accident_situation?: string } | undefined)?.accident_situation
      ),
      accidentType?.vehicleADirection,
      pickFirst(
        ragSummary?.accidentExplain,
        (ragSummary as { accident_explain?: string } | undefined)?.accident_explain
      ),
    ].filter((item): item is string => Boolean(item));
    const faultItemAReasons = [
      pickFirst(
        accidentResult?.vehicleASituation,
        (accidentResult as { vehicle_a_situation?: string } | undefined)?.vehicle_a_situation
      ),
    ].filter((item): item is string => Boolean(item));
    const faultItemBReasons = [
      pickFirst(
        accidentResult?.vehicleBSituation,
        (accidentResult as { vehicle_b_situation?: string } | undefined)?.vehicle_b_situation
      ),
    ].filter((item): item is string => Boolean(item));

    return {
      videoTitle: "분석한 영상",
      faultTitle: "과실 비율 분석",
      faultItems: [
        {
          label: "A차량",
          percent: `${pickFirst(
            accidentResult?.accidentRateA,
            (accidentResult as { accident_rate_a?: number } | undefined)?.accident_rate_a
          ) ?? 0}%`,
          reasons: faultItemAReasons.length > 0 ? faultItemAReasons : ["차량 A 분석 근거가 없습니다."],
          tone: "red" as const,
        },
        {
          label: "B차량",
          percent: `${pickFirst(
            accidentResult?.accidentRateB,
            (accidentResult as { accident_rate_b?: number } | undefined)?.accident_rate_b
          ) ?? 0}%`,
          reasons: faultItemBReasons.length > 0 ? faultItemBReasons : ["차량 B 분석 근거가 없습니다."],
          tone: "blue" as const,
        },
      ],
      sceneTitle: "사고 장소 및 특징",
      sceneTags: sceneTags.length > 0 ? sceneTags : ["분석 정보 없음"],
      sceneDescriptions: sceneDescriptions.length > 0 ? sceneDescriptions : ["사고 설명 정보가 아직 준비되지 않았습니다."],
      legalTitle: "법적 근거",
      legalLaw: pickFirst(
        relatedLaw?.lawName,
        (relatedLaw as { law_name?: string } | undefined)?.law_name
      ) ?? "법적 근거 정보 없음",
      legalDescription: pickFirst(
        relatedLaw?.lawContent,
        (relatedLaw as { law_content?: string } | undefined)?.law_content
      ) ?? "법적 근거 상세 내용이 없습니다.",
      precedentTitle: "관련 판례",
      precedents:
        precedentCases?.map((item, index) => ({
          id: `${pickFirst(item.caseName, (item as { case_name?: string }).case_name) ?? "precedent"}-${index}`,
          category: ["판례"],
          title: pickFirst(item.caseName, (item as { case_name?: string }).case_name) ?? "판례 정보 없음",
          date: formatDate(
            pickFirst(item.dateOfJudgment, (item as { date_of_judgment?: string }).date_of_judgment)
          ),
          summary: item.summary ?? "판례 요약 정보가 없습니다.",
        })) ?? [],
    };
  }, [data]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 공통 헤더 */}
      <Header initialUserInfo={initialUserInfo} />
      <main className="flex flex-1 justify-center px-4 pb-10 pt-4 md:pb-16 md:pt-10">
        {isLoading ? (
          <div className="flex w-full max-w-xl flex-col items-center justify-center gap-3 rounded-2xl bg-white p-8">
            <LoadingSpinner className="h-10 w-10" />
            <p className="text-body7 text-gray-500">분석 결과를 불러오는 중입니다.</p>
          </div>
        ) : null}

        {isError ? (
          <div className="flex w-full max-w-xl flex-col items-center justify-center gap-3 rounded-2xl bg-white p-8">
            <p className="text-body7 text-gray-500">분석 결과를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.</p>
            <Button type="button" onClick={() => refetch()} className="bg-gray-900 text-white hover:bg-gray-800">
              다시 시도
            </Button>
          </div>
        ) : null}

        {!isLoading && !isError ? (
          <AnalyzeResultSection
            analysisId={id}
            videoTitle={mappedResult.videoTitle}
            faultTitle={mappedResult.faultTitle}
            faultItems={mappedResult.faultItems}
            sceneTitle={mappedResult.sceneTitle}
            sceneTags={mappedResult.sceneTags}
            sceneDescriptions={mappedResult.sceneDescriptions}
            legalTitle={mappedResult.legalTitle}
            legalLaw={mappedResult.legalLaw}
            legalDescription={mappedResult.legalDescription}
            precedentTitle={mappedResult.precedentTitle}
            precedentTotalCount={mappedResult.precedents.length}
            precedents={mappedResult.precedents}
          />
        ) : null}
      </main>
      {/* 공통 푸터 */}
      <Footer />
    </div>
  );
}
