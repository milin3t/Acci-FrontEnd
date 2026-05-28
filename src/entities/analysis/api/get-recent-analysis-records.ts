import { cookies } from "next/headers";

type AnalysisHistoryResponse = {
  content: Array<{
    analysisId?: string;
    id?: string;
    title?: string;
    analysisTitle?: string;
    analysis_title?: string;
    faultRatio?: string;
    fault_ratio?: string;
    negligenceRatio?: string;
    negligence_ratio?: string;
    accidentRateA?: number;
    accidentRateB?: number;
    accident_rate_a?: number;
    accident_rate_b?: number;
    status?: string;
    analysisStatus?: string;
    analysis_status?: string;
    createdAt?: string;
    created_at?: string;
  }>;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

export type AnalysisRecordItem = {
  id: string;
  title: string;
  date: string;
  detail: string;
  href: string;
  faultRateA?: number;
  faultRateB?: number;
  status?: string;
  dotColorClassName?: string;
};
export type AnalysisRecordPage = {
  items: AnalysisRecordItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function pickFirst<T>(...values: Array<T | null | undefined>) {
  for (const value of values) {
    if (value !== undefined && value !== null) {
      return value;
    }
  }
  return undefined;
}

function formatDate(dateValue?: string) {
  if (!dateValue) {
    return "-";
  }
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function mapStatusToDetail(status?: string, ratio?: string) {
  if (ratio) {
    return `과실비율 ${ratio}`;
  }
  if (!status) {
    return "상태 확인 필요";
  }
  const statusMap: Record<string, string> = {
    COMPLETED: "분석 완료",
    PROCESSING: "분석 진행중",
    PENDING: "분석 대기중",
    FAILED: "분석 실패",
  };
  return statusMap[status] ?? `상태 ${status}`;
}

function formatFaultTitle(rateA?: number, rateB?: number, fallbackTitle?: string) {
  if (typeof rateA === "number" && typeof rateB === "number") {
    return `차량 A 과실 ${rateA}%, 차량 B 과실 ${rateB}%`;
  }
  return fallbackTitle ?? "영상 분석 기록";
}

function mapStatusToDotColorClassName(status?: string) {
  if (status === "FAILED") {
    return "bg-secondary-700";
  }
  return "bg-[#00C853]";
}

export async function getRecentAnalysisRecords(page = 0, size = 5): Promise<AnalysisRecordItem[]> {
  const data = await getAnalysisRecordPage(page, size);
  return data.items;
}

export async function getAnalysisRecordPage(page = 0, size = 5): Promise<AnalysisRecordPage> {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();

    const response = await fetch(`${API_BASE_URL}/api/v1/analyses?page=${page}&size=${size}`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return { items: [], page, size, totalElements: 0, totalPages: 0 };
    }

    const rawData = (await response.json()) as
      | AnalysisHistoryResponse
      | { data?: AnalysisHistoryResponse }
      | { content?: AnalysisHistoryResponse["content"]; page?: number; size?: number; totalElements?: number; totalPages?: number };
    const data = ("data" in rawData && rawData.data ? rawData.data : rawData) as AnalysisHistoryResponse;
    const content = Array.isArray(data.content) ? data.content : [];

    const items = content.map((item, index) => {
      const analysisId = pickFirst(item.analysisId, item.id) ?? String(index);
      const ratio = pickFirst(item.faultRatio, item.fault_ratio, item.negligenceRatio, item.negligence_ratio);
      const status = pickFirst(item.status, item.analysisStatus, item.analysis_status);
      const fallbackTitle = pickFirst(item.title, item.analysisTitle, item.analysis_title);
      const createdAt = pickFirst(item.createdAt, item.created_at);
      const faultRateA = pickFirst(item.accidentRateA, item.accident_rate_a);
      const faultRateB = pickFirst(item.accidentRateB, item.accident_rate_b);
      const isFailed = status === "FAILED";
      const title = isFailed ? "영상 오류로 인한 분석 실패" : formatFaultTitle(faultRateA, faultRateB, fallbackTitle);
      const detail = isFailed ? "분석 실패" : mapStatusToDetail(status, ratio);

      return {
        id: analysisId,
        title,
        date: formatDate(createdAt),
        detail,
        href: `/analyze/result/${analysisId}`,
        faultRateA,
        faultRateB,
        status,
        dotColorClassName: mapStatusToDotColorClassName(status),
      };
    });
    return {
      items,
      page: data.page ?? page,
      size: data.size ?? size,
      totalElements: data.totalElements ?? items.length,
      totalPages: data.totalPages ?? 1,
    };
  } catch {
    return { items: [], page, size, totalElements: 0, totalPages: 0 };
  }
}
