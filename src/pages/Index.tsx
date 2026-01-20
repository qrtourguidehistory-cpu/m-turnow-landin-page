import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Comparison from '@/components/Comparison';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';
import { useAutoScroll } from '@/hooks/useAutoScroll';

const SECTION_IDS = ['hero', 'features', 'apps', 'cta'];

const Index = () => {
  useAutoScroll(SECTION_IDS, 4000);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <Comparison />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
