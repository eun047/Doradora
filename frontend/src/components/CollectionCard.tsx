import { Trash2 } from "lucide-react";
import basketballIcon from "../assets/select-shape/basketball.svg";
import heartIcon from "../assets/select-shape/heart.svg";
import starIcon from "../assets/select-shape/star.svg";
import type { CollectionItem } from "../types/collection";
import type { Shape } from "../types/shape";

interface CollectionCardProps {
  item: CollectionItem;
  onDelete: (id: string) => void;
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

function CollectionCard({ item, onDelete }: CollectionCardProps) {
  const info = SHAPE_INFO[item.shape] || {
    label: item.shape,
    icon: heartIcon,
  };

  return (
    <div className="flex flex-col rounded-3xl border-5 border-[#09402e] bg-[#eef9ff] p-4 shadow-md transition-all hover:shadow-lg">
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

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#3e2723]/60">
            {formatDate(item.createdAt)}
          </span>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            aria-label="그림 삭제하기"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-[#3e2723]/50 transition-colors hover:bg-[#FF6B4A]/15 hover:text-[#FF6B4A] active:scale-95"
          >
            <Trash2 size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>

      <div className="relative h-130 w-full overflow-hidden rounded-2xl border-3 border-[#09402e]/20 bg-white/90">
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
}

export default CollectionCard;
