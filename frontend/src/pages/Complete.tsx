import { useEffect } from "react";

interface CompleteProps {
  mapImage?: string;
  onComplete?: () => void;
}

function Complete({ mapImage, onComplete }: CompleteProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete?.();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);
  return (
    <main className="relative mx-auto h-dvh w-full max-w-100.5 overflow-hidden rounded-5xl bg-[#96dcff]">
      <div className="absolute left-1/2 top-1/2 flex h-120 w-80 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-[20px] border-5 border-[#09402E] bg-[#EEF9FF]">
        {mapImage ? (
          <img
            src={mapImage}
            alt="완주한 산책 경로"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-lg font-bold text-[#3E2723]/50">
            지도 이미지
          </span>
        )}
      </div>

      <div className="absolute left-1/2 top-[13%] z-20 -translate-x-1/2">
        <div className="relative flex items-center justify-center">
          <div className="absolute -left-13 top-10 h-18 w-20 bg-[#FF6B4A] [clip-path:polygon(0_0,100%_15%,75%_50%,100%_85%,0_100%,25%_50%)]" />
          <div className="absolute -right-13 top-10 h-18 w-20 scale-x-[-1] bg-[#FF6B4A] [clip-path:polygon(0_0,100%_15%,75%_50%,100%_85%,0_100%,25%_50%)]" />
          <div className="relative flex h-22 w-70 items-center justify-center rounded-xl bg-[#FF6B4A] shadow-[0_5px_0_#7C392A]">
            <span className="text-4xl font-black text-[#EEF9FF]">
              Complete!
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Complete;
