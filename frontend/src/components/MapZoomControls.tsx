interface MapZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

function MapZoomControls({ onZoomIn, onZoomOut }: MapZoomControlsProps) {
  return (
    <div className="absolute top-6 left-4 z-40 flex flex-col overflow-hidden rounded-2xl border-2 border-[#09402e]/20 bg-white/90 shadow-lg backdrop-blur-md">
      <button
        type="button"
        onClick={onZoomIn}
        className="flex h-10 w-10 cursor-pointer items-center justify-center border-b border-gray-200 text-xl font-bold text-[#3e2723] transition-all hover:bg-black/5 active:scale-95"
        aria-label="지도 확대"
      >
        +
      </button>

      <button
        type="button"
        onClick={onZoomOut}
        className="flex h-10 w-10 cursor-pointer items-center justify-center text-xl font-bold text-[#3e2723] transition-all hover:bg-black/5 active:scale-95"
        aria-label="지도 축소"
      >
        −
      </button>
    </div>
  );
}

export default MapZoomControls;
