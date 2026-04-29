import LoadingPage from "@/pages/analyze/loading/LoadingPage";
import { getUserInfo } from "@/entities/user/api/get-user-info";

type LoadingRoutePageProps = {
  searchParams?: Promise<{
    analysisId?: string;
  }>;
};

export default async function Page({ searchParams }: LoadingRoutePageProps) {
  const initialUserInfo = await getUserInfo();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const analysisId = typeof resolvedSearchParams?.analysisId === "string" ? resolvedSearchParams.analysisId : null;

  return <LoadingPage initialUserInfo={initialUserInfo} analysisId={analysisId} />;
}
