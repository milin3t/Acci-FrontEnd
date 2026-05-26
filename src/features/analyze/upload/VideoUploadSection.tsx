"use client";

import { uploadAnalysis } from "@/features/analyze/upload/api/upload-analysis";
import { UploadCancelModal } from "@/features/analyze/upload/UploadCancelModal";
import { UploadLoading } from "@/features/analyze/upload/UploadLoading";
import { UploadReadyCard } from "@/features/analyze/upload/UploadReadyCard";
import { VideoUploadCard } from "@/features/analyze/upload/VideoUploadCard";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type UploadState = "idle" | "uploading" | "ready";

export function VideoUploadSection() {
  const router = useRouter();
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  const uploadAbortRef = useRef<AbortController | null>(null);

  const resetUpload = () => {
    uploadAbortRef.current?.abort();
    uploadAbortRef.current = null;
    setUploadState("idle");
    setUploadProgress(0);
    setUploadError(null);
    setSelectedFileName(null);
    setAnalysisId(null);
    setPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return null;
    });
  };

  const handleCancelRequest = () => {
    setIsCancelModalOpen(true);
  };

  const handleCancelClose = () => {
    setIsCancelModalOpen(false);
  };

  const handleCancelConfirm = () => {
    setIsCancelModalOpen(false);
    resetUpload();
  };

  const handleFileSelect = async (file: File) => {
    const allowedExtensions = [".mp4", ".avi"];
    const maxFileSize = 100 * 1024 * 1024;
    const minFileSize = 1 * 1024 * 1024;
    const lowerName = file.name.toLowerCase();
    const hasAllowedExtension = allowedExtensions.some((ext) => lowerName.endsWith(ext));
    if (!hasAllowedExtension) {
      setUploadError("MP4 또는 AVI 파일만 업로드할 수 있어요.");
      return;
    }
    if (file.size < minFileSize || file.size > maxFileSize) {
      setUploadError("영상 용량은 1MB 이상 100MB 이하만 업로드할 수 있어요.");
      return;
    }
    setUploadError(null);
    setSelectedFileName(file.name);
    setPreviewUrl((currentUrl) => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
      return URL.createObjectURL(file);
    });
    setUploadState("uploading");
    setUploadProgress(0);
    uploadAbortRef.current?.abort();
    const controller = new AbortController();
    uploadAbortRef.current = controller;

    try {
      const response = await uploadAnalysis({
        file,
        signal: controller.signal,
        onProgress: (percent) => setUploadProgress(percent),
      });

      console.log("[Upload] response:", response);
      setAnalysisId(response.analysisId);
      setUploadProgress(100);
      setUploadState("ready");
    } catch (error) {
      if ((error as { code?: string }).code === "ERR_CANCELED") {
        return;
      }
      setUploadError("업로드에 실패했습니다. 다시 시도해주세요.");
      setUploadState("idle");
    }
  };

  const handleAnalyzeStart = () => {
    if (!analysisId) {
      setUploadError("분석 식별자를 찾을 수 없습니다. 다시 업로드해주세요.");
      return;
    }
    setUploadError(null);
    router.push(`/analyze/loading?analysisId=${analysisId}`);
  };

  const handleDropError = (message: string) => {
    setUploadError(message);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex w-full flex-col items-center gap-4 md:gap-6">
      {uploadState === "uploading" && <UploadLoading progress={uploadProgress} onCancel={handleCancelRequest} />}
      {uploadState === "ready" && (
        <UploadReadyCard onCancel={handleCancelRequest} onAnalyze={handleAnalyzeStart} previewUrl={previewUrl} />
      )}
      {uploadState === "idle" && (
        <VideoUploadCard onFileSelect={handleFileSelect} onDropError={handleDropError} errorMessage={uploadError} />
      )}
      {uploadState === "ready" && (
        <div className="w-full max-w-xl md:hidden">
          <button type="button" onClick={handleAnalyzeStart} className="block w-full rounded-lg bg-gray-900 py-3 text-body7 text-white text-center">
            AI 분석하기
          </button>
        </div>
      )}
      <UploadCancelModal
        open={isCancelModalOpen}
        fileName={selectedFileName}
        onClose={handleCancelClose}
        onConfirm={handleCancelConfirm}
      />
    </div>
  );
}
