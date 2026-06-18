import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-black">
      <Navbar />
      <Hero />
    </main>
  );
}
