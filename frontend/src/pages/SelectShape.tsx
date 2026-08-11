import cloud from "../assets/home/cloud.svg";
import grass from "../assets/home/grass.svg";
import backIcon from "../assets/select-shape/back.svg";
import basketballIcon from "../assets/select-shape/basketball.svg";
import heartIcon from "../assets/select-shape/heart.svg";
import lockIcon from "../assets/select-shape/lock.svg";
import starIcon from "../assets/select-shape/star.svg";
import type { Shape } from "../types/shape";

interface SelectShapeProps {
  onSelectShape?: (shape: Shape) => void;
  onBack?: () => void;
}

export type CardItem =
  | {
      id: string;
      shape: Shape;
      name: string;
      icon: string;
      isLocked: false;
    }
  | {
      id: string;
      shape?: undefined;
      name: string;
      icon: string;
      isLocked: true;
    };

const UNLOCKED_CARDS: Extract<CardItem, { isLocked: false }>[] = [
  {
    id: "card_heart",
    shape: "heart",
    name: "Heart",
    icon: heartIcon,
    isLocked: false,
  },
  {
    id: "card_star",
    shape: "star",
    name: "Star",
    icon: starIcon,
    isLocked: false,
  },
  {
    id: "card_dribble",
    shape: "circle",
    name: "Circle",
    icon: basketballIcon,
    isLocked: false,
  },
];

const LOCKED_CARD_COUNT = 9;

const LOCKED_CARDS: Extract<CardItem, { isLocked: true }>[] = Array.from(
  { length: LOCKED_CARD_COUNT },
  (_, index) => ({
    id: `card_lock_${index + 1}`,
    name: `Locked ${index + 1}`,
    icon: lockIcon,
    isLocked: true,
  }),
);

const CARDS: CardItem[] = [...UNLOCKED_CARDS, ...LOCKED_CARDS];

function SelectShape({ onSelectShape, onBack }: SelectShapeProps) {
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
        aria-label="홈으로 돌아가기"
      >
        <img src={backIcon} alt="뒤로가기" className="h-10 w-10" />
      </button>

      {/* 세로 스크롤 가능한 모양 카드 영역 (2열 그리드) */}
      <div className="absolute inset-x-0 bottom-24 top-24 z-10 overflow-y-auto px-6.75 pb-4 pt-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
        <div className="grid grid-cols-2 gap-x-5 gap-y-5.5 justify-items-center">
          {CARDS.map((card) => {
            if (card.isLocked) {
              return (
                <div
                  key={card.id}
                  className="flex h-45 w-36 cursor-default items-center justify-center rounded-[20px] border-5 border-[#09402e] bg-[rgba(238,249,255,0.6)] shadow-sm"
                >
                  <img src={card.icon} alt="잠김" className="h-30 w-30" />
                </div>
              );
            }

            return (
              <button
                key={card.id}
                type="button"
                onClick={() => onSelectShape?.(card.shape)}
                className="flex h-45 w-36 cursor-pointer items-center justify-center rounded-[20px] border-5 border-[#09402e] bg-[#eef9ff] shadow-sm transition-all hover:shadow-md"
              >
                <img
                  src={card.icon}
                  alt={card.name}
                  className="h-30 w-30 object-contain"
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* 잔디 배경 */}
      <img
        src={grass}
        alt=""
        className="pointer-events-none absolute -left-22 top-165 h-52.25 w-144.25 max-w-none"
      />

      {/* 하단 안내 텍스트 */}
      <p className="absolute bottom-8 left-1/2 z-30 -translate-x-1/2 text-center leading-normal text-[#3e2723]">
        오늘 걸어볼 모양은?
      </p>
    </main>
  );
}

export default SelectShape;
