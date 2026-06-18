import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { Vibe } from "./components/Vibe";
import Art from "./components/Art";
import Showcase from "./components/Showcase";
import Memory from "./components/Memory";
import Footer from "./components/Footer";
import Upgrade from "./components/Upgrade";
import About from "./components/About";

export default function Home() {
  return (
    <main className="relative w-full min-h-screen bg-black">
      <Navbar />
      <Hero />
      <Vibe />
      <Art />
      <Showcase />
      <Upgrade />
      <About />
      <Memory />
      <Footer />
    </main>
  );
}
