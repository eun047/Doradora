import { useState } from "react";
import Map from "./components/Map";
import Home from "./pages/Home";
import SelectShape from "./pages/SelectShape";
import type { Shape } from "./types/shape";

type Page = "home" | "select-shape" | "map";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("select-shape");
  const [selectedShape, setSelectedShape] = useState<Shape>("heart");

  const handleStart = () => {
    setCurrentPage("select-shape");
  };

  const handleSelectShape = (shape: Shape) => {
    setSelectedShape(shape);
    setCurrentPage("map");
  };

  const handleBackToHome = () => {
    setCurrentPage("home");
  };

  const handleBackToSelectShape = () => {
    setCurrentPage("select-shape");
  };

  if (currentPage === "home") {
    return <Home onStart={handleStart} />;
  }

  if (currentPage === "map") {
    return (
      <main className="relative mx-auto h-dvh w-full max-w-100.5 overflow-hidden rounded-5xl bg-[#96dcff]">
        <button
          type="button"
          onClick={handleBackToSelectShape}
          className="absolute left-4 top-4 z-50 cursor-pointer rounded-xl bg-white/80 px-3 py-1.5 text-sm font-bold text-[#3e2723] shadow-md backdrop-blur-sm transition-transform active:scale-95"
        >
          ← 그림 선택
        </button>
        <Map selectedShape={selectedShape} />
      </main>
    );
  }

  return (
    <SelectShape
      onSelectShape={handleSelectShape}
      onBack={handleBackToHome}
    />
  );
}

export default App;
