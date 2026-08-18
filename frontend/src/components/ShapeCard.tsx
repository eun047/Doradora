import type { CardItem } from "../pages/SelectShape";
import type { Shape } from "../types/shape";

interface ShapeCardProps {
  card: CardItem;
  onSelectShape?: (shape: Shape) => void;
}

function ShapeCard({ card, onSelectShape }: ShapeCardProps) {
  if (card.isLocked) {
    return (
      <div className="flex h-45 w-36 cursor-default items-center justify-center rounded-[20px] border-5 border-[#09402e] bg-[rgba(238,249,255,0.6)] shadow-sm">
        <img src={card.icon} alt="잠김" className="h-30 w-30" />
      </div>
    );
  }

  return (
    <button
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
}

export default ShapeCard;
