"use client";

import { useMemo, useState } from "react";
import { Card } from "@/shared/ui/card";

type AnalyzedVideoCardProps = {
  title: string;
  analysisId: string;
};

export function AnalyzedVideoCard({ title, analysisId }: AnalyzedVideoCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const videoUrl = useMemo(
    () => `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/api/v1/analyses/${analysisId}/video`,
    [analysisId]
  );

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
            <video
              key={videoUrl}
              className="aspect-3/2 w-full rounded-lg object-cover md:rounded-2xl"
              src={videoUrl}
              controls
              preload="metadata"
              crossOrigin="use-credentials"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
