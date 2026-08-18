import { useState } from "react";
import cloud from "../assets/collection/cloud.svg";
import grass from "../assets/collection/grass.svg";
import backIcon from "../assets/collection/back.svg";
import BackButton from "../components/BackButton";
import CollectionCard from "../components/CollectionCard";
import type { CollectionItem } from "../types/collection";
import { deleteCollectionItem, getCollection } from "../utils/collection";

interface CollectionProps {
  onBack?: () => void;
}

function Collection({ onBack }: CollectionProps) {
  const [items, setItems] = useState<CollectionItem[]>(() => getCollection());

  const handleDelete = (id: string) => {
    const confirmed = window.confirm("이 그림을 컬렉션에서 삭제할까요?");
    if (!confirmed) return;

    const success = deleteCollectionItem(id);
    if (success) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  return (
    <main className="relative mx-auto h-dvh w-full max-w-100.5 overflow-hidden rounded-5xl bg-[#96dcff]">
      <img
        src={cloud}
        alt=""
        className="pointer-events-none absolute -left-20 -top-15 z-0 h-55 w-150 max-w-none"
      />

      <BackButton
        onClick={onBack}
        iconSrc={backIcon}
        ariaLabel="돌아가기"
      />

      <div className="absolute inset-x-0 bottom-16 top-24 z-10 overflow-y-auto px-6 pt-2 pb-6 scrollbar-none [&::-webkit-scrollbar]:hidden">
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
            {items.map((item) => (
              <CollectionCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      <img
        src={grass}
        alt=""
        className="pointer-events-none absolute -left-22 top-165 h-52.25 w-144.25 max-w-none"
      />
    </main>
  );
}

export default Collection;
