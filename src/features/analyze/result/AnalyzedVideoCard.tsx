"use client";

import axiosInstance from "@/shared/api/axios-instance";
import { useEffect, useState } from "react";
import { Card } from "@/shared/ui/card";

type AnalyzedVideoCardProps = {
  title: string;
  analysisId: string;
};

type VideoUrlResponse = string | { videoUrl?: string; url?: string; data?: unknown };

export function extractVideoUrl(payload: VideoUrlResponse): string | null {
  if (typeof payload === "string") {
    const trimmed = payload.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (payload && typeof payload === "object") {
    if (typeof payload.videoUrl === "string" && payload.videoUrl.trim().length > 0) {
      return payload.videoUrl.trim();
    }
    if (typeof payload.url === "string" && payload.url.trim().length > 0) {
      return payload.url.trim();
    }
    if (typeof payload.data === "string" && payload.data.trim().length > 0) {
      return payload.data.trim();
    }
    if (payload.data && typeof payload.data === "object") {
      const nestedData = payload.data as { videoUrl?: string; url?: string };
      if (typeof nestedData.videoUrl === "string" && nestedData.videoUrl.trim().length > 0) {
        return nestedData.videoUrl.trim();
      }
      if (typeof nestedData.url === "string" && nestedData.url.trim().length > 0) {
        return nestedData.url.trim();
      }
    }
  }

  return null;
}

export function AnalyzedVideoCard({ title, analysisId }: AnalyzedVideoCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(true);
  const [hasVideoError, setHasVideoError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadVideoUrl = async () => {
      setIsLoadingVideo(true);
      setHasVideoError(false);
      setVideoUrl(null);

      try {
        const response = await axiosInstance.get<VideoUrlResponse>(`/api/v1/analyses/${analysisId}/video`, {
          responseType: "text",
        });
        const resolvedVideoUrl = extractVideoUrl(response.data);
        if (!isMounted) {
          return;
        }
        if (!resolvedVideoUrl) {
          setHasVideoError(true);
          return;
        }
        setVideoUrl(resolvedVideoUrl);
      } catch {
        if (!isMounted) {
          return;
        }
        setHasVideoError(true);
      } finally {
        if (isMounted) {
          setIsLoadingVideo(false);
        }
      }
    };

    void loadVideoUrl();

    return () => {
      isMounted = false;
    };
  }, [analysisId]);

  return (
    <Card className="w-full max-w-xl rounded-lg border-0 bg-white p-4 shadow-none md:rounded-2xl md:p-6">
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-md px-1 py-1 text-left transition-colors hover:bg-black/5"
        aria-expanded={isExpanded}
        aria-label="분석 영상 접기/펼치기"
      >
        <p className="text-body7 text-gray-900 md:text-body3">{title}</p>
        <svg
          aria-hidden="true"
          className={`h-4 w-4 text-gray-300 transition-transform duration-300 ${isExpanded ? "rotate-180" : "rotate-0"}`}
          viewBox="0 0 16 16"
        >
          <path d="M8 12L2 4h12L8 12z" fill="currentColor" />
        </svg>
      </button>

      <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <div className="mt-2 rounded-lg bg-gray-50 md:mt-6 md:rounded-2xl" aria-label="분석한 영상 미리보기">
            {videoUrl ? (
              <video key={videoUrl} className="aspect-3/2 w-full rounded-lg object-cover md:rounded-2xl" src={videoUrl} controls preload="metadata" />
            ) : (
              <div className="flex aspect-3/2 w-full items-center justify-center rounded-lg bg-gray-50 text-body9 text-gray-500 md:rounded-2xl md:text-body7">
                {isLoadingVideo && !hasVideoError ? "영상을 불러오는 중입니다." : "영상을 재생할 수 없습니다."}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
