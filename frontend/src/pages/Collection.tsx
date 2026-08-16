import { useState } from "react";
import cloud from "../assets/home/cloud.svg";
import grass from "../assets/home/grass.svg";
import backIcon from "../assets/select-shape/back.svg";
import basketballIcon from "../assets/select-shape/basketball.svg";
import heartIcon from "../assets/select-shape/heart.svg";
import starIcon from "../assets/select-shape/star.svg";
import type { CollectionItem } from "../types/collection";
import type { Shape } from "../types/shape";
import { getCollection } from "../utils/collection";

interface CollectionProps {
  onBack?: () => void;
}

const SHAPE_INFO: Record<Shape, { label: string; icon: string }> = {
  heart: { label: "Heart", icon: heartIcon },
  star: { label: "Star", icon: starIcon },
  circle: { label: "Circle", icon: basketballIcon },
  square: { label: "Square", icon: starIcon },
};

function formatDate(isoString: string) {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  } catch {
    return "";
  }
}

function Collection({ onBack }: CollectionProps) {
  const [items] = useState<CollectionItem[]>(() => getCollection());

  return (
    <main className="relative mx-auto h-dvh w-full max-w-100.5 overflow-hidden rounded-5xl bg-[#96dcff]">
      {/* 구름 배경 */}
      <img
        src={cloud}
        alt=""
        className="pointer-events-none absolute -left-22 -top-14 z-0 h-212.5 w-166.75 max-w-none"
      />

      {/* 뒤로 가기 버튼 */}
      <button
        type="button"
        onClick={onBack}
        className="absolute left-6 top-6 z-30 flex h-15 w-15 cursor-pointer items-center justify-center transition-transform active:scale-95"
        aria-label="돌아가기"
      >
        <img src={backIcon} alt="뒤로가기" className="h-10 w-10" />
      </button>

      {/* 타이틀 배지 */}
      <div className="absolute left-1/2 top-7 z-20 -translate-x-1/2">
        <h1 className="font-['Lilita_One',sans-serif] text-4xl font-extrabold text-[#3e2723] drop-shadow-sm">
          Collection
        </h1>
      </div>

      {/* 컬렉션 리스트 영역 (세로 스크롤) */}
      <div className="absolute inset-x-0 bottom-16 top-24 z-10 overflow-y-auto px-6 pt-2 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {items.length === 0 ? (
          <div className="mt-16 flex flex-col items-center justify-center rounded-3xl border-5 border-[#09402e]/30 bg-[#eef9ff]/80 p-8 text-center shadow-sm">
            <p className="text-xl font-bold text-[#3e2723]">
              아직 완성한 그림이 없어요.
            </p>
            <p className="mt-3 text-sm font-semibold text-[#3e2723]/70">
              첫 번째 그림을 걸어보세요!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {items.map((item) => {
              const info = SHAPE_INFO[item.shape] || {
                label: item.shape,
                icon: heartIcon,
              };

              return (
                <div
                  key={item.id}
                  className="flex flex-col rounded-3xl border-5 border-[#09402e] bg-[#eef9ff] p-4 shadow-md transition-all hover:shadow-lg"
                >
                  {/* 카드 헤더 (모양 아이콘 + 이름 + 날짜) */}
                  <div className="mb-3 flex items-center justify-between border-b border-[#09402e]/15 pb-2">
                    <div className="flex items-center gap-2">
                      <img
                        src={info.icon}
                        alt={info.label}
                        className="h-8 w-8 object-contain"
                      />
                      <span className="text-xl font-extrabold text-[#3e2723]">
                        {info.label}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#3e2723]/60">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  {/* 캡처된 지도 이미지 */}
                  <div className="relative h-64 w-full overflow-hidden rounded-2xl border-3 border-[#09402e]/20 bg-white/90">
                    <img
                      src={item.image}
                      alt={`${info.label} 완주 그림`}
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 잔디 배경 */}
      <img
        src={grass}
        alt=""
        className="pointer-events-none absolute -left-22 bottom-0 z-20 h-52.25 w-144.25 max-w-none"
      />
    </main>
  );
}

export default Collection;
