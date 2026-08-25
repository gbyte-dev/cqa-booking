import {
  UtensilsCrossed,
  Martini,
  Coffee,
  Umbrella,
  Building2,
} from 'lucide-react';

const industries = [
  {
    icon: UtensilsCrossed,
    label: 'Restaurants',
  },
  {
    icon: Martini,
    label: 'Bars & Lounges',
  },
  {
    icon: Coffee,
    label: 'Cafés',
  },
  {
    icon: Umbrella,
    label: 'Beach Clubs',
  },
  {
    icon: Building2,
    label: 'Hospitality Concepts',
  },
];

export default function IndustriesStrip() {
  return (
    <section
      id="industries"
      className="border-b border-[#e7e9ee] bg-[#f4f5f8] px-4 py-12 sm:px-6 sm:py-14"
    >
      <div className="mx-auto max-w-[1150px] text-center">
        <div className="mx-auto max-w-[650px]">
          <h2 className="text-[20px] font-extrabold tracking-[-0.55px] text-[#101828] sm:text-[24px]">
            Built for Independent Hospitality Businesses
          </h2>

          <p className="mt-2 text-[12px] leading-6 text-[#667085]">
            One platform for the hospitality businesses that care about every
            table and every guest.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-2 gap-5 sm:flex sm:flex-wrap sm:justify-center sm:gap-x-12 sm:gap-y-6">
          {industries.map((industry) => (
            <div
              key={industry.label}
              className="group flex flex-col items-center gap-2.5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#e1e5ec] bg-white text-[#667eea] shadow-[0_5px_18px_rgba(16,24,40,0.05)] transition-all group-hover:-translate-y-0.5 group-hover:shadow-[0_10px_25px_rgba(16,24,40,0.08)]">
                <industry.icon className="h-5 w-5" />
              </div>

              <span className="text-[11px] font-semibold text-[#475467] sm:text-[12px]">
                {industry.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}