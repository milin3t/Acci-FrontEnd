import { cookies } from "next/headers";

import { getRepairRecordPage } from "./get-recent-repair-records";

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

describe("getRepairRecordPage", () => {
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

  it("vehicleModel이 VEHICLES에 있으면 brand/logoSrc를 매핑한다", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            estimateId: "estimate-1",
            vehicleModel: "G90",
            totalEstimate: 350000,
            createdAt: "2026-05-20T10:00:00.000Z",
            status: "COMPLETED",
          },
        ],
        page: 0,
        size: 5,
        totalElements: 1,
        totalPages: 1,
      }),
    } as Response);

    const result = await getRepairRecordPage(0, 5);

    expect(result.items).toEqual([
      {
        id: "estimate-1",
        title: "G90",
        date: "2026.05.20",
        detail: "예상 수리비 350,000원",
        href: "/repair-estimate/result/estimate-1",
        brand: "genesis",
        logoSrc: "/images/brand-logos/genesis.svg",
      },
    ]);
  });

  it("vehicleModel을 찾지 못하면 logoSrc 없이 반환한다", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [
          {
            estimateId: "estimate-2",
            vehicleModel: "알수없음모델",
            status: "PENDING",
            createdAt: "2026-05-21T10:00:00.000Z",
          },
        ],
        page: 0,
        size: 5,
        totalElements: 1,
        totalPages: 1,
      }),
    } as Response);

    const result = await getRepairRecordPage(0, 5);

    expect(result.items[0]).toMatchObject({
      id: "estimate-2",
      title: "알수없음모델",
      brand: undefined,
      logoSrc: undefined,
    });
  });
});
