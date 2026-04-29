import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";

type Precedent = {
  id: string;
  category: string[];
  title: string;
  date: string;
  summary: string;
};

type PrecedentListProps = {
  title: string;
  totalCount: number;
  items: Precedent[];
};

export function PrecedentList({ title, totalCount, items }: PrecedentListProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasMoreItems = items.length > 3;
  const alwaysVisibleItems = useMemo(() => items.slice(0, 3), [items]);
  const extraItems = useMemo(() => items.slice(3), [items]);

  return (
    <Card className="w-full max-w-xl rounded-lg border-0 bg-white p-4 shadow-none md:rounded-2xl md:p-6">
      <div className="flex items-center justify-between">
        <p className="text-body7 text-gray-900 md:text-body3">{title}</p>
        <span className="text-body9 text-gray-300 md:text-body7">총 {totalCount}건</span>
      </div>
      <div className="mt-4 space-y-4 md:mt-6">
        {alwaysVisibleItems.map((item) => (
          <div key={item.id} className="rounded-lg border border-gray-100 bg-white p-4 md:p-6">
            <div className="flex flex-wrap gap-1 text-body11 text-gray-500">
              {item.category.map((tag) => (
                <span key={tag} className="rounded bg-gray-100 px-2 py-1">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
              <p className="text-body7 text-gray-900 md:text-body5">{item.title}</p>
              <span className="text-body9 text-gray-300 md:text-body7">{item.date}</span>
            </div>
            <p className="mt-2 text-body9 text-gray-500 md:text-body7">{item.summary}</p>
          </div>
        ))}

        <div className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <div className="space-y-4">
              {extraItems.map((item) => (
                <div key={item.id} className="rounded-lg border border-gray-100 bg-white p-4 md:p-6">
                  <div className="flex flex-wrap gap-1 text-body11 text-gray-500">
                    {item.category.map((tag) => (
                      <span key={tag} className="rounded bg-gray-100 px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                    <p className="text-body7 text-gray-900 md:text-body5">{item.title}</p>
                    <span className="text-body9 text-gray-300 md:text-body7">{item.date}</span>
                  </div>
                  <p className="mt-2 text-body9 text-gray-500 md:text-body7">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {hasMoreItems ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="mt-4 w-full rounded-lg border-gray-100 bg-white px-6 py-2 text-body9 text-gray-900 hover:border-gray-100 hover:bg-white hover:text-gray-900 md:text-body7"
        >
          {isExpanded ? "접기" : "더보기"}
        </Button>
      ) : null}
    </Card>
  );
}
