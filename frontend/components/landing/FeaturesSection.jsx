import {
  CalendarCheck,
  LayoutGrid,
  CreditCard,
  Users,
  BellRing,
  UserX,
  Gift,
  BarChart3,
  UsersRound,
} from 'lucide-react';

const features = [
  {
    icon: CalendarCheck,
    title: 'Online Reservations',
    text: 'Guests book in seconds from your website or booking link, any time of day.',
  },
  {
    icon: LayoutGrid,
    title: 'Table & Resource Management',
    text: 'Map your floor plan, tables, and capacity so every seat is used well.',
  },
  {
    icon: CreditCard,
    title: 'Deposits & Payments',
    text: 'Collect deposits and prepayments to protect revenue on big parties.',
  },
  {
    icon: Users,
    title: 'Guest CRM',
    text: 'Every visit, preference, and note saved automatically to a guest profile.',
  },
  {
    icon: BellRing,
    title: 'Smart Notifications',
    text: 'Automated confirmations and reminders by SMS and email cut no-shows.',
  },
  {
    icon: UserX,
    title: 'No-Shows & Cancellations',
    text: 'Track patterns and enforce policies to protect your table inventory.',
  },
  {
    icon: Gift,
    title: 'Promotions & Loyalty',
    text: 'Reward repeat guests and run promotions that bring them back sooner.',
  },
  {
    icon: BarChart3,
    title: 'Dashboards & Reports',
    text: 'Occupancy, revenue, and guest trends in one clear, live view.',
  },
  {
    icon: UsersRound,
    title: 'Staff Dashboard',
    text: 'Give your front-of-house team a simple live view of every seating.',
  },
];

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[245px] sm:w-[260px]">
      <div className="absolute -inset-10 rounded-full bg-[#667eea]/10 blur-3xl" />

      <div className="relative rounded-[34px] border-[8px] border-[#101828] bg-[#101828] shadow-[0_35px_80px_rgba(16,24,40,0.2)]">
        <div className="absolute left-1/2 top-[-5px] h-4 w-20 -translate-x-1/2 rounded-b-xl bg-[#101828]" />

        <div className="overflow-hidden rounded-[26px] bg-white">
          <div className="flex items-center justify-between bg-gradient-to-r from-[#667eea] to-[#764ba2] px-4 py-3.5">
            <span className="text-[12px] font-bold text-white">
              New Booking
            </span>

            <span className="text-[9px] font-semibold text-white/70">
              2 / 3
            </span>
          </div>

          <div className="px-4 py-4">
            <div className="mb-2 text-[10px] font-bold text-[#475467]">
              Select a table
            </div>

            <div className="mb-4 grid grid-cols-4 gap-1.5">
              {Array.from({ length: 12 }).map((_, index) => (
                <div
                  key={index}
                  className={`flex h-8 items-center justify-center rounded-md text-[9px] font-bold ${
                    index === 5
                      ? 'bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white shadow-[0_4px_10px_rgba(102,126,234,0.25)]'
                      : index % 4 === 0
                        ? 'bg-[#f2f4f7] text-[#98a2b3] line-through'
                        : 'border border-[#e4e7ec] bg-white text-[#667085]'
                  }`}
                >
                  T{index + 1}
                </div>
              ))}
            </div>

            <div className="mb-2 text-[10px] font-bold text-[#475467]">
              Guest details
            </div>

            <div className="space-y-1.5">
              <div className="h-7 rounded-md border border-[#e4e7ec] bg-[#f9fafb] px-2.5 text-[9px] leading-7 text-[#98a2b3]">
                Full name
              </div>

              <div className="h-7 rounded-md border border-[#e4e7ec] bg-[#f9fafb] px-2.5 text-[9px] leading-7 text-[#98a2b3]">
                Phone number
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                <div className="h-7 rounded-md border border-[#e4e7ec] bg-[#f9fafb] px-2.5 text-[9px] leading-7 text-[#98a2b3]">
                  8:00 PM
                </div>

                <div className="h-7 rounded-md border border-[#e4e7ec] bg-[#f9fafb] px-2.5 text-[9px] leading-7 text-[#98a2b3]">
                  4 guests
                </div>
              </div>
            </div>

            <div className="mt-4 h-8 rounded-lg bg-gradient-to-r from-[#667eea] to-[#764ba2] text-center text-[10px] font-bold leading-8 text-white shadow-[0_6px_15px_rgba(102,126,234,0.22)]">
              Confirm Booking
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="bg-white px-4 py-16 sm:px-6 sm:py-24 lg:py-28"
    >
      <div className="mx-auto max-w-[1240px]">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[1.18fr_0.82fr] lg:items-start lg:gap-20">
          <div>
            <div className="mb-4 inline-flex items-center rounded-full border border-[#e4e7ec] bg-[#f9fafb] px-3.5 py-1.5 text-[9px] font-extrabold uppercase tracking-[1.15px] text-[#667eea]">
              Everything You Need to Operate & Grow
            </div>

            <h2 className="max-w-[570px] text-[clamp(28px,3.8vw,40px)] font-extrabold leading-[1.15] tracking-[-1.3px] text-[#101828]">
              Core features that power your business
            </h2>

            <p className="mt-4 max-w-[560px] text-[13px] leading-[1.75] text-[#667085]">
              From the first reservation to the next repeat visit, CQA Booking
              gives your team the tools to run a smarter hospitality operation.
            </p>

            <div className="mt-9 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-[#eaecf0] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#dfe3f0] hover:shadow-[0_16px_35px_rgba(16,24,40,0.07)]"
                >
                  <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#667eea]/[0.09] text-[#667eea] transition-colors group-hover:bg-[#667eea]/[0.14]">
                    <feature.icon className="h-[18px] w-[18px]" />
                  </div>

                  <strong className="mb-1.5 block text-[13px] font-bold text-[#101828]">
                    {feature.title}
                  </strong>

                  <p className="text-[11.5px] leading-[1.65] text-[#667085]">
                    {feature.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pt-4 lg:sticky lg:top-24 lg:pt-20">
            <PhoneMockup />
          </div>
        </div>
      </div>
    </section>
  );
}