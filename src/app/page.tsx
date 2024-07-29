import { TokenCircle } from "./components";

export default function Home() {
  return (
    <main className="flex min-h-[90vh] flex-col items-center justify-center gap-10 p-5 overflow-hidden">
      <div className="relative w-full h-full">
        <TokenCircle circleRadius={300} clockwise={false} />
        <div className="absolute w-full h-full top-0">
          <div className="flex items-center justify-center w-full h-full text-wrap flex-col gap-3">
            <p className="text-4xl text-white font-semibold bg-gradient-to-r">
              Connect and explore
            </p>
            <p className="text-6xl text-transparent font-semibold text-purple-yellow-gradient animate-gradient">
              the Web3 world
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
