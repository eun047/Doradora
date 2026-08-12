import { Grid2X2, Home, RotateCcw } from "lucide-react";

interface MenuProps {
  onHome?: () => void;
  onRestart?: () => void;
  onCollection?: () => void;
}

function Menu({ onHome, onRestart, onCollection }: MenuProps) {
  return (
    <div className="absolute inset-0 z-100">
      <div className="absolute inset-0 bg-black/20" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5">
        <button
          type="button"
          onClick={onHome}
          aria-label="홈으로 이동"
          className="flex h-37.5 w-87.5 cursor-pointer items-center justify-center rounded-3xl border-b-8 border-[#7C392A] bg-[#FF6B4A] shadow-[0_4px_8px_rgba(0,0,0,0.12)] transition-transform active:translate-y-1 active:border-b-4"
        >
          <Home size={120} strokeWidth={3.5} className="text-[#EEF9FF]" />
        </button>

        <button
          type="button"
          onClick={onRestart}
          aria-label="다시 산책하기"
          className="flex h-37.5 w-87.5 cursor-pointer items-center justify-center rounded-[20px] border-b-8 border-[#7C392A] bg-[#FF6B4A] shadow-[0_4px_8px_rgba(0,0,0,0.12)] transition-transform active:translate-y-1 active:border-b-4"
        >
          <RotateCcw size={120} strokeWidth={3.5} className="text-[#EEF9FF]" />
        </button>

        <button
          type="button"
          onClick={onCollection}
          aria-label="컬렉션으로 이동"
          className="flex h-37.5 w-87.5 cursor-pointer items-center justify-center rounded-[20px] border-b-8 border-[#7C392A] bg-[#FF6B4A] shadow-[0_4px_8px_rgba(0,0,0,0.12)] transition-transform active:translate-y-1 active:border-b-4"
        >
          <Grid2X2 size={120} strokeWidth={3.5} className="text-[#EEF9FF]" />
        </button>
      </div>
    </div>
  );
}

export default Menu;
