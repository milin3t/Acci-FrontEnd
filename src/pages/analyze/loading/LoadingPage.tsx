"use client";

import type { UserInfo } from "@/entities/user/model/user-info";
import { AnalyzeLoadingSection } from "@/widgets/analyze-loading/AnalyzeLoadingSection";
import { Header } from "@/widgets/header/Header";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type LoadingPageProps = {
  initialUserInfo?: UserInfo | null;
  analysisId?: string | null;
};

type AnalysisStatus = "PROCESSING" | "COMPLETED" | "FAILED";

type AnalysisEventPayload = {
  analysisStatus?: AnalysisStatus;
  ragStatus?: string;
  isCompleted?: boolean;
};

function parseEventPayload(rawData: string): AnalysisEventPayload | null {
  if (!rawData) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawData) as AnalysisEventPayload;
    if (parsed && typeof parsed === "object") {
      return parsed;
    }
  } catch {
    if (rawData === "PROCESSING" || rawData === "COMPLETED" || rawData === "FAILED") {
      return { analysisStatus: rawData };
    }
  }

  return null;
}

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

async function waitUntilResultReady(analysisId: string, maxRetries = 10) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

  for (let retryCount = 0; retryCount < maxRetries; retryCount += 1) {
    try {
      const response = await fetch(`${apiBaseUrl}/api/v1/analyses/${analysisId}`, {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        return true;
      }
    } catch {
      // 네트워크 변동 케이스는 다음 재시도로 흡수합니다.
    }

    await wait(Math.min(800 + retryCount * 300, 3000));
  }

  return false;
}

export default function LoadingPage({ initialUserInfo = null, analysisId = null }: LoadingPageProps) {
  const router = useRouter();
  const isTransitioningRef = useRef(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [analysisStatus, setAnalysisStatus] = useState<AnalysisStatus>("PROCESSING");
  const [ragStatus, setRagStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedSeconds((prevSeconds) => prevSeconds + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!analysisId) {
      setErrorMessage("분석 정보를 찾을 수 없습니다. 업로드 페이지에서 다시 시도해주세요.");
      return;
    }

    const sseUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/v1/analyses/${analysisId}/events`;
    const eventSource = new EventSource(sseUrl, { withCredentials: true });

    const handleStatusChange = async (payload: AnalysisEventPayload | null) => {
      if (!payload) return;

      if (payload.analysisStatus) {
        setAnalysisStatus(payload.analysisStatus);
      }
      if (payload.ragStatus) {
        setRagStatus(payload.ragStatus);
      }
      if (payload.analysisStatus === "COMPLETED" || payload.isCompleted) {
        if (isTransitioningRef.current) {
          return;
        }
        isTransitioningRef.current = true;
        eventSource.close();
        const isReady = await waitUntilResultReady(analysisId);
        if (isReady) {
          router.replace(`/analyze/result/${analysisId}`);
          return;
        }
        setErrorMessage("분석은 완료되었지만 결과 반영이 지연되고 있습니다. 잠시 후 다시 시도해주세요.");
        isTransitioningRef.current = false;
      }
      if (payload.analysisStatus === "FAILED") {
        setErrorMessage("분석 처리에 실패했습니다. 다시 시도해주세요.");
      }
    };

    const handleMessageEvent = async (event: MessageEvent) => {
      await handleStatusChange(parseEventPayload(event.data));
    };

    const handleStatusEvent = async (event: MessageEvent) => {
      await handleStatusChange(parseEventPayload(event.data));
    };

    eventSource.onmessage = handleMessageEvent;
    eventSource.addEventListener("status", handleStatusEvent);

    eventSource.onerror = () => {
      setErrorMessage("분석 상태를 수신하지 못했습니다. 잠시 후 다시 시도해주세요.");
      eventSource.close();
    };

    return () => {
      eventSource.removeEventListener("status", handleStatusEvent);
      eventSource.close();
    };
  }, [analysisId, router]);

  const loadingTitle = errorMessage ? "분석 상태 확인이 필요합니다" : "Acci가 분석중입니다";
  const loadingDescriptionLine1 = errorMessage
    ? errorMessage
    : analysisStatus === "PROCESSING"
      ? "업로드한 블랙박스 영상을 분석하여"
      : "분석 결과를 정리하고 있습니다";
  const loadingDescriptionLine2 = errorMessage
    ? "업로드 페이지에서 영상을 다시 전송해주세요"
    : ragStatus
      ? `현재 단계: ${ragStatus}`
      : "과실비율, 판단근거, 관련판례를 제공합니다";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* 공통 헤더 */}
      <Header initialUserInfo={initialUserInfo} />
      <main className="flex flex-1 items-center justify-center px-4 py-24 md:py-40">
        {/* 분석 로딩 섹션 */}
        <AnalyzeLoadingSection
          timeText={`경과시간 ${elapsedSeconds}초`}
          title={loadingTitle}
          descriptionLine1={loadingDescriptionLine1}
          descriptionLine2={loadingDescriptionLine2}
        />
      </main>
      {/* [Notice] 푸터는 해당 로딩 섹션에서 불편한 요소가 되어서 그냥 지운 상태로 두었습니다. */}
    </div>
  );
}
