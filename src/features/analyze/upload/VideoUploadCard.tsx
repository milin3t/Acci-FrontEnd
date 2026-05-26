"use client";

import { UploadCardHeader } from "@/features/analyze/upload/UploadCardHeader";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type VideoUploadCardProps = {
  onFileSelect: (file: File) => void | Promise<void>;
  onDropError?: (message: string) => void;
  errorMessage?: string | null;
};

export function VideoUploadCard({ onFileSelect, onDropError, errorMessage }: VideoUploadCardProps) {
  const handleDrop = useCallback(
    (acceptedFiles: File[], fileRejections: { file: File }[]) => {
      const file = acceptedFiles[0] ?? fileRejections[0]?.file;
      if (!file) {
        onDropError?.("파일을 인식하지 못했어요. 다시 시도해주세요.");
        return;
      }
      void onFileSelect(file);
    },
    [onDropError, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    multiple: false,
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-xl rounded-2xl bg-white p-4 md:p-6">
      <UploadCardHeader title="영상 업로드" />
      <div
        {...getRootProps({
          className: `mt-4 flex aspect-3/2 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition-colors md:mt-6 md:aspect-auto md:h-52 ${
            isDragActive ? "border-gray-700 bg-gray-100" : "border-gray-200 bg-gray-50"
          }`,
        })}
      >
        <div className="flex flex-col items-center gap-1">
          <p className="text-body10 md:text-body7 text-gray-400">{isDragActive ? "여기에 파일을 놓아주세요" : "블랙박스 영상을 업로드하세요"}</p>
          <p className="text-body10 md:text-body7 text-gray-400">파일 드래그 혹은 선택</p>
        </div>
        <span className="mt-4 inline-flex items-center justify-center rounded-lg bg-gray-900 px-4 py-2 text-body9 md:text-body7 text-white">
          파일 선택하기
        </span>
        <input {...getInputProps()} />
      </div>
      {errorMessage && <p className="mt-2 text-body9 text-red-500">{errorMessage}</p>}
    </div>
  );
}
