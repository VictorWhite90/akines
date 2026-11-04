import { Community } from './Community';
import { Experiences } from './Experiences';
import { FinalCta } from './FinalCta';
import { Footer } from './Footer';
import { Header } from './Header';
import { Hero } from './Hero';
import { Intention } from './Intention';
import { Motion } from './Motion';
import { Rhythm } from './Rhythm';
import { Trust } from './Trust';

/** The landing page's sections. The landing route shows them; sign in opens over them, as the design draws it. */
export default function LandingPage() {
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
