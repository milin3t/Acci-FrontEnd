import { cookies } from "next/headers";

import { getAnalysisRecordPage } from "./get-recent-analysis-records";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

describe("getAnalysisRecordPage", () => {
  const mockedCookies = cookies as jest.MockedFunction<typeof cookies>;
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.NEXT_PUBLIC_API_BASE_URL = "http://api.test";
    mockedCookies.mockResolvedValue({
      toString: () => "session=test",
    } as Awaited<ReturnType<typeof cookies>>);
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it("analysisStatus와 snake_case 필드를 정상 매핑한다", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          content: [
            {
              analysisId: "analysis-1",
              analysis_title: "교차로 사고 분석",
              analysis_status: "COMPLETED",
              accidentRateA: 70,
              accidentRateB: 30,
              created_at: "2026-05-28T09:00:00.000Z",
            },
          ],
          page: 0,
          size: 5,
          totalElements: 1,
          totalPages: 1,
        },
      }),
    } as Response);

    const result = await getAnalysisRecordPage(0, 5);

    expect(result.items).toEqual([
      {
        id: "analysis-1",
        title: "차량 A 과실 70%, 차량 B 과실 30%",
        date: "2026.05.28",
        detail: "분석 완료",
        href: "/analyze/result/analysis-1",
        faultRateA: 70,
        faultRateB: 30,
        status: "COMPLETED",
        dotColorClassName: "bg-[#00C853]",
      },
    ]);
  });

  it("faultRatio가 있으면 상태 대신 과실비율을 우선 표시한다", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            id: "analysis-2",
            title: "후방 추돌",
            fault_ratio: "20:80",
            analysisStatus: "PROCESSING",
            createdAt: "2026-05-27T09:00:00.000Z",
          },
        ],
        page: 0,
        size: 5,
        totalElements: 1,
        totalPages: 1,
      }),
    } as Response);

    const result = await getAnalysisRecordPage(0, 5);

    expect(result.items[0]).toMatchObject({
      id: "analysis-2",
      detail: "과실비율 20:80",
    });
  });

  it("FAILED 상태면 실패용 제목/상태/색상을 사용한다", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            analysisId: "analysis-3",
            analysisStatus: "FAILED",
            createdAt: "2026-05-27T10:00:00.000Z",
          },
        ],
        page: 0,
        size: 5,
        totalElements: 1,
        totalPages: 1,
      }),
    } as Response);

    const result = await getAnalysisRecordPage(0, 5);

    expect(result.items[0]).toMatchObject({
      id: "analysis-3",
      title: "영상 오류로 인한 분석 실패",
      detail: "분석 실패",
      dotColorClassName: "bg-secondary-700",
    });
  });
});
