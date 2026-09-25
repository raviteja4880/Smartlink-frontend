import HeroSection from '../components/home/HeroSection';
import HomeFooter from '../components/home/HomeFooter';

export default function HomePage() {
  return (
    <div className="w-full flex flex-col min-h-screen bg-slate-50/50">
      {/* ── Hero + SmartLink Creation + Value Strip ── */}
      <HeroSection />

      {/* ── Minimal Footer ── */}
      <HomeFooter />
    </div>
  );
}
