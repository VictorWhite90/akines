import LandingPage from '@/components/landing/LandingPage';
import Companion from '@/components/shell/Companion';

export default function Page() {
  return (
    <>
      <LandingPage />
      <Companion guest />
    </>
  );
}
