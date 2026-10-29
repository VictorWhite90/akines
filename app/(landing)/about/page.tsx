import { Community } from '@/components/landing/Community';
import { Experiences } from '@/components/landing/Experiences';
import { FinalCta } from '@/components/landing/FinalCta';
import { Footer } from '@/components/landing/Footer';
import { Header } from '@/components/landing/Header';
import { Hero } from '@/components/landing/Hero';
import { Intention } from '@/components/landing/Intention';
import { Motion } from '@/components/landing/Motion';
import { Rhythm } from '@/components/landing/Rhythm';
import { Trust } from '@/components/landing/Trust';

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
