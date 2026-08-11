import cloud from "../assets/home/cloud.svg";
import grass from "../assets/home/grass.svg";
import logo from "../assets/home/logo.svg";
import symbol1 from "../assets/home/symbol1.svg";
import symbol2 from "../assets/home/symbol2.svg";

interface HomeProps {
  onStart?: () => void;
}

function Home({ onStart }: HomeProps) {
  return (
    <main className="relative mx-auto h-dvh w-full max-w-100.5 overflow-hidden rounded-5xl bg-[#96dcff]">
      <img
        src={cloud}
        alt=""
        className="absolute -left-22 -top-14 h-212.5 w-166.75 max-w-none"
      />

      <img
        src={logo}
        alt="Doradora"
        className="absolute left-9.25 top-25 h-53.75 w-83.5"
      />

      {/* 로고 주변 심볼 */}
      <div className="absolute left-45 top-61 flex h-18.5 w-18.5 items-center justify-center">
        <img src={symbol2} alt="" className="absolute h-16.25 w-16.25" />

        <img
          src={symbol1}
          alt=""
          className="relative h-10 w-10 translate-y-0.5 -translate-x-0.5 rotate-[65.51deg]"
        />
      </div>

      <button
        type="button"
        onClick={onStart}
        className="
          absolute left-8.75 top-90
          h-46.25 w-83
          rounded-3xl
          border-b-8
          border-[#7c392a]
          bg-[#ff6b4a]
          font-['Lilita_One',sans-serif]
          text-[6rem]
          font-bold
          leading-none
          text-[#f4f7f5]
          cursor-pointer
          transition-transform
          active:translate-y-1
        "
      >
        GO!!!
      </button>

      <button
        type="button"
        className="
          absolute left-8.75 top-138
          h-20.25 w-83
          rounded-3xl
          border-b-8
          border-[#bd6c44]
          bg-[#fcab82]
          font-['Lilita_One',sans-serif]
          text-5xl
          leading-none
          text-[#f4f7f5]
          cursor-pointer
          transition-transform
          active:translate-y-1
        "
      >
        Collection
      </button>

      <img
        src={grass}
        alt=""
        className="absolute -left-22 top-165 h-52.25 w-144.25 max-w-none"
      />

      <p
        className="
          absolute left-1/2 top-180
          w-90.75
          -translate-x-1/2
          -translate-y-1/2
          text-center
          leading-normal
          text-[#3e2723]
        "
      >
        동네 한 바퀴 돌아돌아,
        <br />
        오늘의 그림을 완성해보아요!!
      </p>
    </main>
  );
}

export default Home;
