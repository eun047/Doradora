import { useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import Map, { type MapHandle } from "./components/Map";
import Collection from "./pages/Collection";
import Complete from "./pages/Complete";
import Home from "./pages/Home";
import MenuPage from "./pages/Menu";
import SelectShape from "./pages/SelectShape";
import type { Shape } from "./types/shape";
import { saveCollectionItem } from "./utils/collection";

type Page = "home" | "select-shape" | "map" | "complete" | "collection";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedShape, setSelectedShape] = useState<Shape>("heart");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mapImage, setMapImage] = useState<string>("");
  const [isCapturing, setIsCapturing] = useState(false);

  const mapComponentRef = useRef<MapHandle | null>(null);

  // 홈 → 그림 선택
  const handleStart = () => {
    setCurrentPage("select-shape");
  };

  // 그림 선택 → 지도
  const handleSelectShape = (shape: Shape) => {
    setSelectedShape(shape);
    setCurrentPage("map");
  };

  // 홈으로 이동
  const handleBackToHome = () => {
    setCurrentPage("home");
  };

  // 메뉴 버튼 → 메뉴 페이지
  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  // 그림 저장하기 → 지도 캡처 후 localStorage 저장 & 완주 화면 이동
  const handleSavePath = async () => {
    if (isCapturing) return;
    setIsCapturing(true);

    try {
      const capturedImage = await mapComponentRef.current?.captureMap();
      if (capturedImage) {
        // Complete 화면에는 원본 캡처 이미지 전달
        setMapImage(capturedImage);

        // Collection 저장 전 이미지 용량 압축 및 저장 수행
        const saved = await saveCollectionItem(selectedShape, capturedImage);
        if (!saved) {
          alert("저장 공간이 부족해 그림을 컬렉션에 저장하지 못했어요.");
        }

        setCurrentPage("complete");
      }
    } catch (error) {
      console.error("지도 캡처 및 저장 실패:", error);
    } finally {
      setIsCapturing(false);
    }
  };

  // 메뉴 → 홈
  const handleMenuHome = () => {
    setIsMenuOpen(false);
    setCurrentPage("home");
  };

  // 메뉴 → 그림 선택
  const handleMenuRestart = () => {
    setIsMenuOpen(false);
    setCurrentPage("select-shape");
  };

  // 메뉴 → 컬렉션
  const handleMenuCollection = () => {
    setIsMenuOpen(false);
    setCurrentPage("collection");
  };

  if (currentPage === "home") {
    return (
      <Home
        onStart={handleStart}
        onCollection={handleMenuCollection}
      />
    );
  }

  if (currentPage === "select-shape") {
    return (
      <SelectShape
        onSelectShape={handleSelectShape}
        onBack={handleBackToHome}
      />
    );
  }

  if (currentPage === "map") {
    return (
      <main className="relative mx-auto h-dvh w-full max-w-100.5 overflow-hidden rounded-5xl bg-[#96dcff]">
        <Map ref={mapComponentRef} selectedShape={selectedShape} />

        <div className="absolute bottom-8 left-0 right-0 z-50 flex justify-center px-6">
          <button
            type="button"
            onClick={handleSavePath}
            disabled={isCapturing}
            aria-label="그림 저장하기"
            className="flex h-19 w-full cursor-pointer items-center justify-center rounded-[30px] border-[3px] border-[#2C1E18]/10 bg-[#82C91E] shadow-[0_6px_0_#5C9312] transition-transform active:scale-95 hover:bg-[#77B81B] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
              {isCapturing ? (
                <span className="text-xs font-bold leading-tight">
                  저장중
                </span>
              ) : (
                <ChevronDown size={36} strokeWidth={4} />
              )}
            </div>
          </button>
        </div>

        {isMenuOpen && (
          <MenuPage
            onHome={handleMenuHome}
            onRestart={handleMenuRestart}
            onCollection={handleMenuCollection}
          />
        )}

        <button
          type="button"
          onClick={handleToggleMenu}
          aria-label={isMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          className="absolute right-6 top-6 z-200 flex h-17 w-17 cursor-pointer items-center justify-center rounded-full bg-[#E1F4FF]/60 text-[#4A2810] shadow-[0_4px_12px_rgba(0,0,0,0.1)] transition-transform active:scale-95"
        >
          {isMenuOpen ? (
            <X size={36} strokeWidth={3.5} />
          ) : (
            <Menu size={36} strokeWidth={3.5} />
          )}
        </button>
      </main>
    );
  }

  if (currentPage === "complete") {
    return (
      <Complete
        mapImage={mapImage}
        onComplete={() => setCurrentPage("collection")}
      />
    );
  }

  if (currentPage === "collection") {
    return <Collection onBack={handleBackToHome} />;
  }

  return null;
}

export default App;
