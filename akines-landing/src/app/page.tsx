import { Community } from '@/components/Community';
import { Experiences } from '@/components/Experiences';
import { FinalCta } from '@/components/FinalCta';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { Intention } from '@/components/Intention';
import { Motion } from '@/components/Motion';
import { Rhythm } from '@/components/Rhythm';
import { Trust } from '@/components/Trust';

export default function Page() {
  return (
    <>
      <a className="skip-link" href="#intention">
        Skip to content
      </a>
      <Header />
      <main>
        <Hero />
        <Intention />
        <Rhythm />
        <Experiences />
        <Trust />
        <Community />
        <FinalCta />
      </main>
      <Footer />
      <Motion />
    </>
  );
}
