'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

import { storage } from '@/lib/storage';
import { getRoleRedirectPath } from '@/lib/roleRedirect';
import CustomerVerificationBanner from '@/components/customer/CustomerVerificationBanner';

import LandingHeader from '@/components/landing/LandingHeader';
import HeroSection from '@/components/landing/HeroSection';
import IndustriesStrip from '@/components/landing/IndustriesStrip';
import FeaturesSection from '@/components/landing/FeaturesSection';
import GrowthSection from '@/components/landing/GrowthSection';
import PricingSection from '@/components/landing/PricingSection';
import TrustStrip from '@/components/landing/TrustStrip';
import LandingFooter from '@/components/landing/LandingFooter';

type AuthedUser = {
  role?: string;
  firstName?: string;
  fullName?: string;
  avatarUrl?: string;
  email?: string;
  isEmailVerified?: boolean;
};

export default function Home() {
  const router = useRouter();

  const [checking, setChecking] = useState(true);
  const [authedUser, setAuthedUser] = useState<AuthedUser | null>(null);

  useEffect(() => {
    const token = storage.getToken();
    const user = storage.getUser();

    if (token && user) {
      if (user.role !== 'customer') {
        router.replace(getRoleRedirectPath(user.role));
        return;
      }

      setAuthedUser(user);
    }

    setChecking(false);

    const onUserUpdated = (e: Event) => {
      setAuthedUser((e as CustomEvent).detail ?? null);
    };

    window.addEventListener('cqa-user-updated', onUserUpdated);

    return () => {
      window.removeEventListener('cqa-user-updated', onUserUpdated);
    };
  }, [router]);

  if (checking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#080b14] font-sans text-[13px] text-[#818ca0]">
        <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_20px_50px_rgba(0,0,0,0.25)]">
          <div className="absolute inset-0 rounded-2xl bg-[#667eea]/10 blur-xl" />
          <Sparkles className="relative h-6 w-6 animate-pulse text-[#8b95f9]" />
        </div>

        <p>Loading CQA Booking...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-white font-sans antialiased">
      {authedUser && <CustomerVerificationBanner />}

      <LandingHeader user={authedUser} />
      <HeroSection />
      <IndustriesStrip />
      <FeaturesSection />
      <GrowthSection />
      <PricingSection />
      <TrustStrip />
      <LandingFooter />
    </main>
  );
}