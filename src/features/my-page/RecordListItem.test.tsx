import { render } from "@testing-library/react";

import { RecordListItem } from "./RecordListItem";

describe("RecordListItem", () => {
  it("logoSrc가 없으면 기본 placeholder를 렌더링한다", () => {
    const { container } = render(<RecordListItem title="G90" date="2026.05.27" detail="견적 완료" />);
    const thumbnail = container.querySelector(".h-12.w-12");

    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveClass("bg-gray-100");
    expect(container.querySelector(".h-8.w-8.rounded-full")).not.toBeInTheDocument();
  });

  it("logoSrc가 있으면 브랜드 로고를 배경 이미지로 렌더링한다", () => {
    const { container } = render(
      <RecordListItem title="G90" date="2026.05.27" detail="견적 완료" logoSrc="/images/brand-logos/genesis.svg" />
    );
    const wrapper = container.querySelector(".h-12.w-12");
    const thumbnail = container.querySelector(".h-12.w-12 > .h-full.w-full");

    expect(wrapper).toHaveClass("bg-black");
    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveStyle("background-image: url(/images/brand-logos/genesis.svg)");
  });

  it("faultRateA/B가 있으면 원형 차트 썸네일을 렌더링한다", () => {
    const { container } = render(<RecordListItem title="분석 기록" date="2026.05.28" detail="분석 완료" faultRateA={80} faultRateB={20} />);
    const wrapper = container.querySelector(".h-12.w-12");
    const chart = container.querySelector("svg.h-8.w-8");
    const circles = container.querySelectorAll("svg.h-8.w-8 circle");

    expect(wrapper).toHaveClass("bg-transparent");
    expect(chart).toBeInTheDocument();
    expect(circles).toHaveLength(2);
    expect(circles[1]).toHaveAttribute("stroke-dasharray", "80 100");
  });
});
