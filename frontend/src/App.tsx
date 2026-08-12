import { useState } from "react";
import { Menu, ChevronDown, X } from "lucide-react";
import Map from "./components/Map";
import Home from "./pages/Home";
import SelectShape from "./pages/SelectShape";
import MenuPage from "./pages/Menu";
import type { Shape } from "./types/shape";

type Page = "home" | "select-shape" | "map" | "complete" | "collection";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedShape, setSelectedShape] = useState<Shape>("heart");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // 저장하기 → 완주 화면
  const handleSavePath = () => {
    setCurrentPage("complete");
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
    return <Home onStart={handleStart} />;
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
        <Map selectedShape={selectedShape} />

        <div className="absolute bottom-8 left-0 right-0 z-50 flex justify-center px-6">
          <button
            type="button"
            onClick={handleSavePath}
            aria-label="그림 저장하기"
            className="flex h-19 w-full cursor-pointer items-center justify-center rounded-[30px] border-[3px] border-[#2C1E18]/10 bg-[#82C91E] shadow-[0_6px_0_#5C9312] transition-transform active:scale-95 hover:bg-[#77B81B]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
              <ChevronDown size={36} strokeWidth={4} />
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
      <main className="relative mx-auto flex h-dvh w-full max-w-100.5 items-center justify-center overflow-hidden rounded-5xl bg-[#52778A] text-2xl font-bold text-white">
        Complete! 페이지 준비 중...
      </main>
    );
  }

  if (currentPage === "collection") {
    return (
      <main className="relative mx-auto flex h-dvh w-full max-w-100.5 items-center justify-center overflow-hidden rounded-5xl bg-[#96dcff] text-2xl font-bold text-[#3e2723]">
        Collection 페이지 준비 중...
      </main>
    );
  }

  return null;
}

export default App;
