import {
  Building2,
  ShieldCheck,
  Lock,
  BadgeCheck,
} from 'lucide-react';

const badges = [
  {
    icon: Building2,
    label: 'Built for Hospitality Operators',
  },
  {
    icon: ShieldCheck,
    label: 'Secure Multi-Tenant SaaS Platform',
  },
  {
    icon: Lock,
    label: 'Your Data Always Isolated',
  },
  {
    icon: BadgeCheck,
    label: 'Trusted Technology Partner',
  },
];

export default function TrustStrip() {
  return (
    <section
      id="about"
      className="border-b border-[#e7e9ee] bg-[#f3f4f7] px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="mx-auto max-w-[1100px] text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[#dfe3eb] bg-white text-[#667eea] shadow-sm">
          <BadgeCheck className="h-[18px] w-[18px]" />
        </div>

        <h3 className="mt-4 text-[17px] font-extrabold tracking-[-0.3px] text-[#101828]">
          Powered by CQA — Concept Quality Assurance
        </h3>

        <p className="mx-auto mt-2 max-w-[500px] text-[12px] leading-[1.7] text-[#667085]">
          CQA Booking is built and maintained by a technology partner
          dedicated to independent hospitality operators.
        </p>

        <div className="mt-9 grid grid-cols-2 gap-8 sm:grid-cols-4 sm:gap-6">
          {badges.map((badge) => (
            <div
              key={badge.label}
              className="group flex flex-col items-center gap-2.5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e4e7ec] bg-white text-[#667eea] shadow-[0_5px_15px_rgba(16,24,40,0.04)] transition-transform group-hover:-translate-y-0.5">
                <badge.icon className="h-[18px] w-[18px]" />
              </div>

              <span className="max-w-[150px] text-[10.5px] font-semibold leading-[1.45] text-[#475467]">
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}