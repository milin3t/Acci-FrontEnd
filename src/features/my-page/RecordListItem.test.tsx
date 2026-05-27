import { render } from "@testing-library/react";

import { RecordListItem } from "./RecordListItem";

describe("RecordListItem", () => {
  it("logoSrc가 없으면 기본 placeholder를 렌더링한다", () => {
    const { container } = render(<RecordListItem title="G90" date="2026.05.27" detail="견적 완료" />);
    const thumbnail = container.querySelector(".h-12.w-12");

    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveClass("bg-black");
    expect(thumbnail).not.toHaveAttribute("style");
  });

  it("logoSrc가 있으면 브랜드 로고를 배경 이미지로 렌더링한다", () => {
    const { container } = render(
      <RecordListItem title="G90" date="2026.05.27" detail="견적 완료" logoSrc="/images/brand-logos/genesis.svg" />
    );
    const thumbnail = container.querySelector(".h-12.w-12");

    expect(thumbnail).toBeInTheDocument();
    expect(thumbnail).toHaveStyle("background-image: url(/images/brand-logos/genesis.svg)");
  });
});
