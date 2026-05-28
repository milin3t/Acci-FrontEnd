import { render, screen, waitFor } from "@testing-library/react";

import { AnalyzedVideoCard, extractVideoUrl } from "./AnalyzedVideoCard";
import axiosInstance from "@/shared/api/axios-instance";

jest.mock("@/shared/api/axios-instance", () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

describe("extractVideoUrl", () => {
  it("문자열 응답에서 URL을 추출한다", () => {
    expect(extractVideoUrl("  https://example.com/video.mp4  ")).toBe("https://example.com/video.mp4");
  });

  it("객체 응답(videoUrl, url, data)에서 URL을 추출한다", () => {
    expect(extractVideoUrl({ videoUrl: "https://example.com/video-a.mp4" })).toBe("https://example.com/video-a.mp4");
    expect(extractVideoUrl({ url: "https://example.com/video-b.mp4" })).toBe("https://example.com/video-b.mp4");
    expect(extractVideoUrl({ data: "https://example.com/video-c.mp4" })).toBe("https://example.com/video-c.mp4");
    expect(extractVideoUrl({ data: { videoUrl: "https://example.com/video-d.mp4" } })).toBe("https://example.com/video-d.mp4");
    expect(extractVideoUrl({ data: { url: "https://example.com/video-e.mp4" } })).toBe("https://example.com/video-e.mp4");
  });

  it("유효한 URL이 없으면 null을 반환한다", () => {
    expect(extractVideoUrl("   ")).toBeNull();
    expect(extractVideoUrl({})).toBeNull();
    expect(extractVideoUrl({ data: { unknown: "value" } })).toBeNull();
  });
});

describe("AnalyzedVideoCard", () => {
  const mockedAxiosInstance = axiosInstance as jest.Mocked<typeof axiosInstance>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("초기에는 로딩 placeholder를 렌더링한다", () => {
    mockedAxiosInstance.get.mockReturnValue(new Promise(() => undefined));

    render(<AnalyzedVideoCard title="분석한 영상" analysisId="analysis-1" />);

    expect(screen.getByText("영상을 불러오는 중입니다.")).toBeInTheDocument();
  });

  it("URL 조회 성공 시 video 태그를 렌더링한다", async () => {
    mockedAxiosInstance.get.mockResolvedValue({
      data: "https://example.com/video.mp4",
    } as never);

    const { container } = render(<AnalyzedVideoCard title="분석한 영상" analysisId="analysis-1" />);

    const video = await waitFor(() => {
      const element = container.querySelector("video");
      expect(element).not.toBeNull();
      return element;
    });
    expect(video).toHaveAttribute("src", "https://example.com/video.mp4");
    expect(mockedAxiosInstance.get).toHaveBeenCalledWith("/api/v1/analyses/analysis-1/video", {
      responseType: "text",
    });
  });

  it("URL 조회 실패 시 에러 placeholder를 렌더링한다", async () => {
    mockedAxiosInstance.get.mockRejectedValue(new Error("network error"));

    render(<AnalyzedVideoCard title="분석한 영상" analysisId="analysis-1" />);

    await waitFor(() => expect(screen.getByText("영상을 재생할 수 없습니다.")).toBeInTheDocument());
  });
});
